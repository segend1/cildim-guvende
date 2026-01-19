const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/duaderm_urls.txt');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = 'https://www.duaderm.com.tr/cilt-bakim-urunleri';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Scroll to trigger lazy loading if any
    await autoScroll(page);

    // Initial check for pagination
    // Links are usually in product cards.
    // Inspect suggests standard structure.

    // Select all links
    const links = await page.$$eval('a', els => els.map(a => a.href));

    // Filter for product links
    // Assuming products don't have "cilt-bakim-urunleri" in their own path relative to root, 
    // or they are just at root level e.g. /product-name
    // Let's filter by excluding known non-product paths or including likely product patterns.
    // Observation from URL provided: https://www.duaderm.com.tr/koruyucu-ve-onarici-bariyer-krem-50-ml
    // It seems products are at root level or specific paths.
    // Strategy: Filter out category links, account links, etc.

    const productLinks = [...new Set(links)].filter(l =>
        !l.includes('cilt-bakim-urunleri') && // Category page itself
        !l.includes('sepet') &&
        !l.includes('hesabim') &&
        !l.includes('iletisim') &&
        !l.includes('hakkimizda') &&
        !l.includes('facebook') &&
        !l.includes('instagram') &&
        !l.includes('?add-to-cart') &&
        !l.endsWith('.tr/') && // Home page
        l.startsWith('https://www.duaderm.com.tr/')
    );

    // Further refinement: Product links usually don't have query params for filters
    const refinedLinks = productLinks.filter(l => !l.includes('?'));

    console.log(`Found ${refinedLinks.length} potential product links.`);
    fs.writeFileSync(OUTPUT_FILE, refinedLinks.join('\n'));
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
