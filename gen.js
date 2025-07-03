const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const axios = require('axios');
const randomstring = require('randomstring');
const chalk = require('chalk');
const dayjs = require('dayjs');
const readline = require('readline');

puppeteer.use(StealthPlugin());

const banner = `
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
    return chalk.gray(`[${dayjs().format('HH:mm:ss DD-MM-YYYY')}]`);
}

function printTempLog(tempEmail) {
    console.log(`${timestamp()} ${chalk.blue("Using tempmail")}: ${chalk.green(tempEmail)}`);
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
    // This is a rough node.js translation; real bypass requires custom TLS client.
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
                    // "X-Super-Properties": "<very long base64 string>", // Omitted for brevity
                }
            }
        );
        if (resp.data && resp.data.retry_after) {
            return resp.data.retry_after;
        }
        return 1;
    } catch (e) {
        console.log(chalk.red(`Error fetching rate limit: ${e.message}`));
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
            console.log(`${timestamp()} ${chalk.green(`Token fetched: ${token}`)}`);
            fs.appendFileSync("tokens.txt", `${token}\n`);
            fs.appendFileSync("evs.txt", `${email}:${password}:${token}\n`);
            console.log(`${timestamp()} ${chalk.green("Token Saved to evs.txt and tokens.txt")}`);
            return true;
        } else if (r.data && r.data.captcha_key) {
            console.log(`${timestamp()} ${chalk.red("Discord returned captcha, stopping retry.")}`);
            return false;
        }
    } catch (e) {
        if (e.response && e.response.data && e.response.data.captcha_key) {
            console.log(`${timestamp()} ${chalk.red("Discord returned captcha, stopping retry.")}`);
        }
    }
    return false;
}

async function waitForUserInput(msg) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(msg, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function main() {
    console.clear();
    process.title = "Ultimate EV GEN V1 By Anomus.LY_";
    console.log(banner);

    while (true) {
        const { username, email } = generateYopmailEmail();
        console.log(`${timestamp()} ${chalk.blue("Using temporary email:")} ${chalk.green(email)}`);
        if (!email) {
            console.log(`${timestamp()} ${chalk.red("Failed to create temporary email.")}`);
            continue;
        }
        printTempLog(email);

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
            await page.type('input[name="email"]', email);
            await page.type('input[name="global_name"]', "Lunarxterm");
            const randUsername = generateRandomString();
            await page.type('input[name="username"]', randUsername);
            await page.type('input[name="password"]', email);
            await page.click('#react-select-3-input');
            await page.type('#react-select-3-input', '15');
            await page.keyboard.press('Enter');
            await page.click('#react-select-2-input');
            await page.type('#react-select-2-input', 'MAY');
            await page.keyboard.press('Enter');
            await page.click('#react-select-4-input');
            await page.type('#react-select-4-input', '1995');

            const limit = await accountRatelimit();
            if (limit > 1) {
                console.log(`${timestamp()}${chalk.red(`[INFO] Ratelimited for ${limit} seconds. Retrying after ratelimit disappears.`)}`);
                await new Promise(r => setTimeout(r, limit * 1000));
            }

            await page.waitForSelector('button[type="submit"]');
            await page.click('button[type="submit"]');
            console.log(`${timestamp()} ${chalk.blue("Please Solve Captcha Manually.")}`);

            await page.waitForFunction(
                'window.location.href.includes("discord.com/channels/@me")',
                { timeout: 300000 }
            );
            console.log(`${timestamp()} ${chalk.green("Redirected to the Discord page!")}`);

            const usernamebaba = email.split('@')[0];
            await page.goto(`https://yopmail.com/en/?login=${usernamebaba}`);
            console.log(`${timestamp()} ${chalk.blue("Navigate to Yopmail and verify email manually.")}`);
            console.log(`${timestamp()} ${chalk.blue("Once you've solved the CAPTCHA and clicked the verification link, close the browser window and press Enter to continue.")}`);

            await waitForUserInput("Press Enter after closing the browser window...");

            await browser.close();

            const success = await loginAndFetchToken(email, email);
            if (success) {
                console.log(`${timestamp()} ${chalk.green("Process complete. Restarting...")}`);
            } else {
                console.log(`${timestamp()} ${chalk.red("Failed to fetch the token.")}`);
            }
        } catch (e) {
            console.log(`${timestamp()} ${chalk.red("Error:")} ${e}`);
        } finally {
            if (browser) {
                try {
                    await browser.close();
                    console.log(`${timestamp()} ${chalk.green("Browser closed successfully.")}`);
                } catch {
                    console.log(`${timestamp()} ${chalk.yellow("Browser already closed or error occurred.")}`);
                }
            }
        }
    }
}

main();
