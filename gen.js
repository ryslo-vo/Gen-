// Improved Node.js version of Discord Token Generator with plain console logging (no chalk).

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const axios = require('axios');
const randomstring = require('randomstring');
const dayjs = require('dayjs');
const readline = require('readline');

puppeteer.use(StealthPlugin());

const BANNER = `
██████╗ ██╗██╗   ██╗███████╗██████╗ 
██╔══██╗██║██║   ██║██╔════╝██╔══██╗
██████╔╝██║██║   ██║█████╗  ██████╔╝
██╔══██╗██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║  ██║██║ ╚████╔╝ ███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
🚀 Ultimate EVS Tool 🚀
[+] Programmed By Anomus.LY
`;

function timestamp() {
    return `[${dayjs().format('HH:mm:ss DD-MM-YYYY')}]`;
}

function logInfo(msg) {
    console.log(`${timestamp()} [INFO] ${msg}`);
}

function logSuccess(msg) {
    console.log(`${timestamp()} [SUCCESS] ${msg}`);
}

function logError(msg) {
    console.log(`${timestamp()} [ERROR] ${msg}`);
}

function logWarn(msg) {
    console.log(`${timestamp()} [WARN] ${msg}`);
}

function generateYopmailEmail() {
    const username = randomstring.generate({ length: 10, charset: 'alphanumeric' });
    const email = `${username}@1xp.fr`;
    return { username, email };
}

function generateRandomString(length = 12) {
    return randomstring.generate({ length, charset: 'alphanumeric' });
}

async function accountRatelimit() {
    const email = randomstring.generate({ length: 9, charset: 'lowercase' }) +
        randomstring.generate({ length: 6, charset: 'numeric' });
    const mail = randomstring.generate({ length: 11, charset: 'lowercase' }) + "@gmail.com";
    const data = {
        email: mail,
        password: 'ultimate12$$',
        date_of_birth: "2000-09-20",
        username: email,
        consent: true,
        captcha_service: "hcaptcha",
        global_name: "ultimate",
        captcha_key: null,
        invite: null,
        promotional_email_opt_in: false,
        gift_code_sku_id: null,
    };
    try {
        const resp = await axios.post(
            'https://discord.com/api/v9/auth/register',
            data,
            {
                headers: {
                    "Accept": "*/*",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/json",
                    "DNT": "1",
                    "Host": "discord.com",
                    "Origin": "https://discord.com",
                    "Referer": 'https://discord.com/register',
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-GPC": "1",
                    "TE": "trailers",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
                    "X-Debug-Options": "bugReporterEnabled",
                    "X-Discord-Locale": "en-US",
                    "X-Discord-Timezone": "Asia/Calcutta",
                }
            }
        );
        if (resp.data && resp.data.retry_after) {
            return resp.data.retry_after;
        }
        return 1;
    } catch (e) {
        logError(`Error fetching rate limit: ${e.message}`);
        return 1;
    }
}

async function loginAndFetchToken(email, password) {
    const data = { email, password, undelete: false };
    const headers = {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
    };
    try {
        const r = await axios.post("https://discord.com/api/v9/auth/login", data, { headers });
        if (r.status === 200 && r.data.token) {
            const token = r.data.token;
            logSuccess(`Token fetched: ${token}`);
            fs.appendFileSync("tokens.txt", `${token}\n`);
            fs.appendFileSync("evs.txt", `${email}:${password}:${token}\n`);
            logSuccess("Token Saved to evs.txt and tokens.txt");
            return true;
        } else if (r.data && r.data.captcha_key) {
            logError("Discord returned captcha, stopping retry.");
            return false;
        }
    } catch (e) {
        if (e.response && e.response.data && e.response.data.captcha_key) {
            logError("Discord returned captcha, stopping retry.");
        } else {
            logError(`Login error: ${e.message}`);
        }
    }
    return false;
}

function waitForUserInput(msg) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(msg, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function fillRegistrationForm(page, email) {
    await page.type('input[name="email"]', email);
    await page.type('input[name="global_name"]', "Lunarxterm");
    await page.type('input[name="username"]', generateRandomString());
    await page.type('input[name="password"]', email);

    // Date selection logic
    await page.click('#react-select-3-input');
    await page.type('#react-select-3-input', '15');
    await page.keyboard.press('Enter');
    await page.click('#react-select-2-input');
    await page.type('#react-select-2-input', 'MAY');
    await page.keyboard.press('Enter');
    await page.click('#react-select-4-input');
    await page.type('#react-select-4-input', '1995');
}

async function main() {
    console.clear();
    process.title = "Ultimate EV GEN V1 By Anomus.LY_";
    console.log(BANNER);

    while (true) {
        const { username, email } = generateYopmailEmail();
        logInfo(`Using temporary email: ${email}`);
        if (!email) {
            logError("Failed to create temporary email.");
            continue;
        }

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--disable-popup-blocking',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--ignore-certificate-errors'
                ]
            });
            const page = await browser.newPage();
            await page.goto('https://discord.com/register', { waitUntil: 'domcontentloaded' });

            await page.waitForSelector('input[name="email"]', { timeout: 20000 });
            await fillRegistrationForm(page, email);

            const limit = await accountRatelimit();
            if (limit > 1) {
                logWarn(`[INFO] Ratelimited for ${limit} seconds. Retrying after ratelimit disappears.`);
                await new Promise(r => setTimeout(r, limit * 1000));
            }

            await page.waitForSelector('button[type="submit"]');
            await page.click('button[type="submit"]');
            logInfo("Please Solve Captcha Manually.");

            // Wait for Discord redirect after registration
            await page.waitForFunction(
                'window.location.href.includes("discord.com/channels/@me")',
                { timeout: 300000 }
            );
            logSuccess("Redirected to the Discord page!");

            // Open yopmail for email verification
            const usernamebaba = email.split('@')[0];
            await page.goto(`https://yopmail.com/en/?login=${usernamebaba}`);
            logInfo("Navigate to Yopmail and verify email manually.");
            logInfo("Once you've solved the CAPTCHA and clicked the verification link, close the browser window and press Enter to continue.");

            await waitForUserInput("Press Enter after closing the browser window...");

            await browser.close();

            const success = await loginAndFetchToken(email, email);
            if (success) {
                logSuccess("Process complete. Restarting...");
            } else {
                logError("Failed to fetch the token.");
            }
        } catch (e) {
            logError(`Error: ${e}`);
        } finally {
            if (browser) {
                try {
                    await browser.close();
                    logSuccess("Browser closed successfully.");
                } catch {
                    logWarn("Browser already closed or error occurred.");
                }
            }
        }
    }
}

main();
