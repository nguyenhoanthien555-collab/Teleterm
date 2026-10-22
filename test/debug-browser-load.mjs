import puppeteer from 'puppeteer';

async function checkFailedResources() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.on('response', res => {
        if (res.status() >= 400) console.log('HTTP FAIL:', res.status(), res.url());
    });
    page.on('pageerror', err => console.error('JS ERROR:', err.message));

    await page.goto('http://localhost:4000?direct=1', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await new Promise(r => setTimeout(r, 4000));
    await browser.close();
}

checkFailedResources();
