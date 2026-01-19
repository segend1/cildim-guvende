const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/haruharu_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/haruharu_products.json');

async function getProductLinks() {
    console.log('[Discovery] Reading URLs from file...');
    try {
        if (!fs.existsSync(URLS_FILE)) {
            // Fallback for testing if file doesn't exist
            return ['https://haruharuwonder.com/products/haruharuwonder-black-rice-bakuchiol-eye-cream-20ml'];
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
        // wait a bit for dynamic content
        await new Promise(r => setTimeout(r, 2000));

        // 1. Title
        const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'Unknown Product');

        // 2. Image
        const image = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => '');

        // 3. Ingredients
        let ingredients = '';

        // Strategy: Use the known selector #ingredientsModal .metafield-multi_line_text_field
        try {
            ingredients = await page.$eval('#ingredientsModal .metafield-multi_line_text_field', el => el.innerText).catch(() => '');

            if (!ingredients) {
                // Fallback: look for other likely containers if main failed
                const bodyText = await page.$eval('body', el => el.innerText);
                if (bodyText.includes('Water, Glycerin')) {
                    // try to narrow it down? No, just keep it empty if we can't find precise block to avoid garbage.
                }
            }
        } catch (e) {
            console.log('Ingredients selector failed, trying fallback...');
        }

        // Cleanup ingredients
        if (ingredients) {
            ingredients = ingredients.trim();
            // Normalize separators if needed, but usually it's comma separated
        }

        const product = {
            url,
            title,
            image,
            ingredients: (ingredients || '').trim(),
            brand: 'Haruharu Wonder'
        };

        if (product.ingredients.length > 10) {
            console.log(`[Product] Success: ${title} (${product.ingredients.length} chars)`);
            return product;
        } else {
            console.log(`[Product] No ingredients found for ${title}`);
            return product; // Return it anyway, maybe check manually
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

    // Limit for testing? No, process all but catch errors.
    for (let i = 0; i < links.length; i++) {
        const p = await scrapeProduct(page, links[i]);
        if (p) allProducts.push(p);

        // Save intermittently
        if (i % 5 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Main] Done. Total: ${allProducts.length}`);
    await browser.close();
})();
