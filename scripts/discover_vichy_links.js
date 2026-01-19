const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/vichy_urls.txt');
const BASE_URL = 'https://www.vichy.com.tr/tum-urunler/urunler/ap.aspx';

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Cookie banner handling
    try {
        const acceptBtn = await page.$('#onetrust-accept-btn-handler'); // Common ID
        if (acceptBtn) await acceptBtn.click();
    } catch (e) { }

    console.log('Scrolling to load all products...');

    // Scroll multiple times to trigger lazy load
    let previousHeight = 0;
    let noChangeCount = 0;

    while (noChangeCount < 3) {
        await autoScroll(page);
        await new Promise(r => setTimeout(r, 2000));

        const currentHeight = await page.evaluate('document.body.scrollHeight');
        if (currentHeight === previousHeight) {
            noChangeCount++;
        } else {
            noChangeCount = 0;
            previousHeight = currentHeight;
            console.log(`  Height: ${currentHeight}`);
        }
    }

    // Extract Links
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div.obj_product a'))
            .map(a => a.href)
            .filter(href => href.includes('/p') && href.includes('.aspx')); // Filter for product pages
    });

    const uniqueLinks = [...new Set(links)];
    console.log(`Found ${uniqueLinks.length} unique product links.`);

    fs.writeFileSync(OUTPUT_FILE, uniqueLinks.join('\n'));
    await browser.close();
})();
