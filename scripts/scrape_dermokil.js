const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/dermokil_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/dermokil_products.json');

async function getProductLinks() {
    console.log('[Discovery] Reading URLs from file...');
    try {
        if (!fs.existsSync(URLS_FILE)) {
            return [];
        }
        const content = fs.readFileSync(URLS_FILE, 'utf8');
        return content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    } catch (e) {
        console.error('Could not read URLs file', e);
        return [];
    }
}

async function scrapeProduct(page, url) {
    console.log(`[Product] Navigating to ${url}...`);
    try {
        // Retry logic for navigation
        let retries = 2;
        while (retries > 0) {
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                break;
            } catch (e) {
                console.warn(`[Product] Navigation failed (retries left ${retries}): ${e.message}`);
                retries--;
                if (retries === 0) throw e;
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        // Wait a small bit for stability
        await new Promise(r => setTimeout(r, 1000));

        // 1. Title
        let title = 'Unknown Product';
        try {
            const docTitle = await page.title();
            const h1 = await page.evaluate(() => {
                const el = document.querySelector('h1');
                return el ? el.innerText.trim() : '';
            });
            const ogTitle = await page.evaluate(() => {
                const el = document.querySelector('meta[property="og:title"]');
                return el ? el.content : '';
            });

            title = h1 || ogTitle || docTitle || 'Unknown Product';
        } catch (e) {
            console.log('Title extraction failed', e.message);
        }

        // 2. Image
        const image = await page.evaluate(() => {
            const el = document.querySelector('meta[property="og:image"]');
            return el ? el.content : '';
        }).catch(() => '');

        // 3. Ingredients
        let ingredients = '';
        try {
            ingredients = await page.evaluate(() => {
                const summaries = Array.from(document.querySelectorAll('details summary'));
                const targetSummary = summaries.find(s => s.innerText.includes('İçindekiler'));

                if (targetSummary) {
                    const details = targetSummary.parentElement;
                    details.open = true;
                    return details.innerText.replace(targetSummary.innerText, '').trim();
                }

                const allDetails = Array.from(document.querySelectorAll('details'));
                const found = allDetails.find(d => d.textContent.includes('Aqua') || d.textContent.includes('Water'));
                if (found) {
                    return found.innerText;
                }
                return '';
            });
        } catch (e) {
            console.log('Ingredients selector failed', e.message);
        }

        // Cleanup ingredients
        if (ingredients) {
            ingredients = ingredients.trim()
                .replace(/^İçindekiler\s*:?/i, '')
                .replace(/^Ingredients\s*:?/i, '')
                .trim();
        }

        const product = {
            url,
            title: title.replace(' | Dermokil', '').trim(),
            image,
            ingredients: (ingredients || '').trim(),
            brand: 'Dermokil'
        };

        if (product.ingredients.length > 5) {
            console.log(`[Product] Success: ${product.title} (${product.ingredients.length} chars)`);
            return product;
        } else {
            console.log(`[Product] No ingredients found for ${product.title}`);
            return product;
        }
    } catch (e) {
        console.error(`[Product] Error scraping ${url}:`, e.message);
        return null;
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Set UA
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    const links = await getProductLinks();
    let allProducts = [];

    // Load existing if partial
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            allProducts = JSON.parse(fs.readFileSync(OUTPUT_FILE));
            console.log(`Loaded ${allProducts.length} existing products.`);
        } catch (e) { }
    }

    const processedUrls = new Set(allProducts.map(p => p.url));

    for (let i = 0; i < links.length; i++) {
        if (processedUrls.has(links[i])) {
            console.log(`Skipping processed: ${links[i]}`);
            continue;
        }

        const p = await scrapeProduct(page, links[i]);
        if (p) {
            allProducts.push(p);
            // Save every 5
            if (allProducts.length % 5 === 0) {
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Main] Done. Total: ${allProducts.length}`);
    await browser.close();
})();
