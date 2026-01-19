const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/duaderm_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/duaderm_products.json');

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
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // 1. Title
        const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'Unknown Product');

        // 2. Image
        const image = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => '');

        // 3. Ingredients
        // Selector identified: div#product-left div.w-100.my-2 p.MsoNormal
        let ingredients = '';

        try {
            ingredients = await page.evaluate(() => {
                // Try specific selector
                // Using the structure: #product-left -> w-100 my-2 -> p
                // But let's look for "Aqua" to be safe as identified in inspection
                const candidates = Array.from(document.querySelectorAll('#product-left .w-100.my-2, #product-left p'));

                const found = candidates.find(el => el.innerText.includes('Aqua') || el.innerText.includes('Water'));
                return found ? found.innerText : '';
            });
        } catch (e) {
            console.log('Ingredients selector failed');
        }

        // Cleanup ingredients
        if (ingredients) {
            ingredients = ingredients.trim().replace(/^Ingredients:?\s*/i, '');
        }

        const product = {
            url,
            title,
            image,
            ingredients: (ingredients || '').trim(),
            brand: 'Duaderm'
        };

        if (product.ingredients.length > 10) {
            console.log(`[Product] Success: ${title} (${product.ingredients.length} chars)`);
            return product;
        } else {
            console.log(`[Product] No ingredients found for ${title}`);
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

    // Safety: limit parallel? Doing sequential for reliability.
    for (let i = 0; i < links.length; i++) {
        const p = await scrapeProduct(page, links[i]);
        if (p) allProducts.push(p);

        if (i % 5 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Main] Done. Total: ${allProducts.length}`);
    await browser.close();
})();
