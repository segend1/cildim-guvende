const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/ohk_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/ohk_products.json');

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

        // Strategy: specific selector found during inspection. 
        // .elementor-accordion-item:nth-of-type(4) .elementor-tab-content p

        // 1. Title
        const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'Unknown Product');

        // 2. Image
        const image = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => '');

        // 3. Ingredients
        let ingredients = '';

        try {
            // Try clicking to expand if needed, but often text is in DOM even if hidden.
            ingredients = await page.evaluate(() => {
                // Try the specific selector first
                const el = document.querySelector('.elementor-accordion-item:nth-of-type(4) .elementor-tab-content p');
                if (el) return el.innerText;

                // Fallback: Find any accordion content with "Aqua" 
                const allPs = Array.from(document.querySelectorAll('.elementor-tab-content p'));
                const found = allPs.find(p => p.innerText.includes('Aqua') || p.innerText.includes('Water'));
                return found ? found.innerText : '';
            });
        } catch (e) {
            console.log('Ingredients selector failed');
        }

        // Cleanup ingredients
        if (ingredients) {
            ingredients = ingredients.trim();
        }

        const product = {
            url,
            title,
            image,
            ingredients: (ingredients || '').trim(),
            brand: 'Oh K! Life'
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
