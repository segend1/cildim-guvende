const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const https = require('https');

const OUTPUT_FILE = path.join(__dirname, '../data/dalba_urls.txt');
const SITEMAP_URL = 'https://dalba.com/sitemap_products_1.xml';
const BASE_CRAWL_URL = 'https://dalba.com/collections/all-products';

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
            const matches = xmlData.match(/<loc>(.*?)<\/loc>/g);
            let urls = [];
            if (matches) {
                urls = matches
                    .map(m => m.replace(/<\/?loc>/g, ''))
                    .filter(u => u.includes('/products/'));
            }

            console.log(`Found ${urls.length} product URLs in sitemap.`);
            fs.writeFileSync(OUTPUT_FILE, urls.join('\n'));
            return;
        }
    } catch (e) {
        console.log('Sitemap access failed/invalid. Falling back to Crawler.');
    }

    // FALLBACK: Crawl
    console.log('Starting Puppeteer Crawler...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    // d'Alba has a popup usually?
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Navigating to ${BASE_CRAWL_URL}...`);
    await page.goto(BASE_CRAWL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Auto-scroll
    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || totalHeight > 50000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
    });

    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href*="/products/"]'))
            .map(a => a.href)
            .filter(href => !href.includes('#') && !href.includes('?'));
    });

    const uniqueLinks = [...new Set(links)];
    console.log(`Crawler found ${uniqueLinks.length} products.`);

    fs.writeFileSync(OUTPUT_FILE, uniqueLinks.join('\n'));
    await browser.close();
})();
