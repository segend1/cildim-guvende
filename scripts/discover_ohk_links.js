const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/ohk_urls.txt');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = 'https://ohklife.com/shop/';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Handle pagination or "Load More"?
    // Inspection suggested a standard shop page. Let's try to find all product links.
    // Usually paginated or infinite scroll.
    // For V1, let's grab links on the first page and assume standard pagination query params if visible,
    // or just grab what's there.
    // Often wordpress/elementor sites use ?page=2 or /page/2/

    // Let's try to scroll to bottom to trigger lazy load if any
    await autoScroll(page);

    const links = await page.$$eval('a', els => els.map(a => a.href));

    const productLinks = [...new Set(links)].filter(l =>
        l.includes('/product/') &&
        !l.includes('/category/') &&
        !l.includes('?add-to-cart=') &&
        !l.includes('#')
    );

    console.log(`Found ${productLinks.length} product links.`);
    fs.writeFileSync(OUTPUT_FILE, productLinks.join('\n'));
    console.log(`Saved to ${OUTPUT_FILE}`);

    await browser.close();
})();

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
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
