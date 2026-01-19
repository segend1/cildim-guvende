const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/dalba_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/dalba_products.json');

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

        // 1. Close Popups (Shopify marketing) - Aggressive
        try {
            const closers = await page.$$('.needsclick, button[aria-label="Close"], .klaviyo-close-form, .popup-close, svg[data-name="Close"], div[aria-label="Close form"]');
            for (const c of closers) {
                if (await c.isVisible()) await c.click();
            }
        } catch (e) { }

        // 2. Title
        const title = await page.evaluate(() => {
            const h1 = document.querySelector('h1.product__title, h1.product-single__title, h1');
            return h1 ? h1.innerText.trim() : document.title;
        });

        // 3. Image
        const image = await page.evaluate(() => {
            const img = document.querySelector('.product__media img, .product-single__photo img');
            if (img) return img.src.startsWith('//') ? 'https:' + img.src : img.src;
            return '';
        });

        // 4. Ingredients
        let ingredients = await page.evaluate(async () => {
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Helper to clean text
            const clean = (text) => text ? text.replace(/\s+/g, ' ').trim() : '';

            // Strategy A: Specific d'Alba Accordion
            const ingBtn = Array.from(document.querySelectorAll('.ingredient-button')).find(b =>
                b.innerText.toUpperCase().includes('FULL INGREDIENT LIST') || b.innerText.toUpperCase().includes('INGREDIENT')
            );

            if (ingBtn) {
                ingBtn.click();
                await wait(800);

                const container = ingBtn.closest('.ingredient-item');
                if (container) {
                    const detail = container.querySelector('.ingredient-detail, .ingredient-content, .Custom_n3, p.Custom_n3');
                    if (detail) return clean(detail.innerText);

                    const allText = clean(container.innerText);
                    const btnText = clean(ingBtn.innerText);
                    if (allText.length > btnText.length + 20) {
                        return allText.replace(btnText, '').trim();
                    }
                }
            }

            // Strategy B: Search whole page for long text starting with Water/Aqua
            // This is a robust fallback for static text or pre-expanded accordions
            const allElements = document.querySelectorAll('p, div, span, li');
            let bestMatch = '';
            for (const el of allElements) {
                const text = el.innerText;
                // Check for standard ingredient starts
                if (text.match(/^(Water|Aqua|Extract)/i) || text.includes('Water,') || text.includes('Aqua,')) {
                    // Must be reasonably long to be a full list
                    if (text.length > 50 && text.length > bestMatch.length) {
                        // Avoid grabbing the whole body
                        if (text.length < 5000) bestMatch = text;
                    }
                }
            }
            if (bestMatch) return clean(bestMatch);

            return '';
        });

        // Cleanup
        if (ingredients) {
            ingredients = ingredients.replace(/^Ingredients:?/i, '').trim();
        }

        const product = {
            url,
            title,
            image,
            ingredients: ingredients || '',
            brand: "d'Alba"
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
