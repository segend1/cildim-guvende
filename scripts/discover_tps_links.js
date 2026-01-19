const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const https = require('https');

const OUTPUT_FILE = path.join(__dirname, '../data/tps_urls.txt');
const SITEMAP_URL = 'https://thepurestsolutions.com/sitemap_products_1.xml';

// Helper to download sitemap
function downloadSitemap(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', (err) => reject(err));
        });
    });
}

(async () => {
    console.log(`Checking Sitemap: ${SITEMAP_URL}`);
    try {
        const xmlData = await downloadSitemap(SITEMAP_URL);

        if (xmlData.includes('<urlset') && xmlData.includes('<loc>')) {
            console.log('Sitemap found! Parsing with Regex...');
            // Simple regex since we can't install xml parser
            const matches = xmlData.match(/<loc>(.*?)<\/loc>/g);
            let urls = [];
            if (matches) {
                urls = matches
                    .map(m => m.replace(/<\/?loc>/g, ''))
                    .filter(u => u.includes('/products/'));
            }

            console.log(`Found ${urls.length} product URLs in sitemap.`);
            fs.writeFileSync(OUTPUT_FILE, urls.join('\n'));
            return; // EXIT if successful
        }
    } catch (e) {
        console.log('Sitemap access failed or invalid. Falling back to Crawler.');
    }

    // FALLBACK: Crawl /collections/all
    console.log('Starting Puppeteer Crawler...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const BASE_URL = 'https://thepurestsolutions.com/collections/tum-urunler'; // Validated by subagent

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Auto-scroll to load lazy items
    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                // Stop if we scroll too much or hit bottom
                if (totalHeight >= scrollHeight || totalHeight > 50000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
    });

    const links = await page.evaluate(() => {
        // Selector validated by agent: .grid__item a[href*="/products/"]
        return Array.from(document.querySelectorAll('a[href*="/products/"]'))
            .map(a => a.href)
            .filter(href => !href.includes('#'));
    });

    const uniqueLinks = [...new Set(links)];
    console.log(`Crawler found ${uniqueLinks.length} products.`);

    fs.writeFileSync(OUTPUT_FILE, uniqueLinks.join('\n'));
    await browser.close();
})();
