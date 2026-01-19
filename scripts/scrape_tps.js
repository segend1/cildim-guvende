const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/tps_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/tps_products.json');

async function getProductLinks() {
    try {
        const content = fs.readFileSync(URLS_FILE, 'utf8');
        return content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    } catch (e) {
        return [];
    }
}

async function scrapeProduct(page, url) {
    console.log(`[Product] Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // 1. Close Popups
        try {
            // Shopify store popups
            const closeBtn = await page.$('.popup-close, .close-button, [aria-label="Close"]');
            if (closeBtn) await closeBtn.click();
        } catch (e) { }

        // 2. Title
        const title = await page.evaluate(() => {
            const h1 = document.querySelector('h1');
            return h1 ? h1.innerText.trim() : document.title;
        });

        // 3. Image
        const image = await page.evaluate(() => {
            // Shopify typical
            const img = document.querySelector('.product-single__photo img, .product__media img');
            if (img) return img.src.startsWith('//') ? 'https:' + img.src : img.src;
            const metaImg = document.querySelector('meta[property="og:image"]');
            return metaImg ? metaImg.content : '';
        });

        // 4. Ingredients
        // Structure: <details><summary>İÇİNDEKİLER</summary><div class="accordion__content">...</div></details>

        let ingredients = await page.evaluate(() => {
            // Strategy A: Find the specific details/summary combo
            const summaries = Array.from(document.querySelectorAll('summary'));
            const ingSummary = summaries.find(s =>
                s.innerText.toUpperCase().includes('İÇİNDEKİLER') ||
                s.innerText.toUpperCase().includes('INGREDIENTS')
            );

            if (ingSummary) {
                // Click to expand just in case (though innerText usually works on hidden)
                ingSummary.click();

                const details = ingSummary.parentElement; // <details>
                const content = details.querySelector('.accordion__content');
                if (content) return content.innerText.trim();
            }

            // Strategy B: Direct search in known container class
            const contents = Array.from(document.querySelectorAll('.accordion__content'));
            for (const c of contents) {
                const text = c.innerText;
                if (text.includes('Aqua') || text.includes('Water')) {
                    if (text.length > 20) return text.trim();
                }
            }

            return '';
        });

        // Wait a small bit if we clicked
        if (!ingredients) {
            await new Promise(r => setTimeout(r, 500));
        }

        // Specific Cleanups for TPS
        if (ingredients) {
            ingredients = ingredients.replace(/İçindekiler\s?:?/i, '').trim();
            ingredients = ingredients.replace(/Ingredients\s?:?/i, '').trim();
        }

        const product = {
            url,
            title,
            image,
            ingredients: (ingredients || '').trim(),
            brand: 'The Purest Solutions'
        };

        if (product.ingredients.length > 20) {
            console.log(`[Product] Success: ${title} (${product.ingredients.length} chars)`);
        } else {
            console.log(`[Product] No ingredients found for ${title}`);
        }

        return product;

    } catch (e) {
        console.error(`[Product] Error scraping ${url}:`, e.message);
        return null;
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const links = await getProductLinks();
    let allProducts = [];

    // Run scraping
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
