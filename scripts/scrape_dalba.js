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

        // 1. Close Popups
        try {
            const closers = await page.$$('.needsclick, button[aria-label="Close"], .klaviyo-close-form, .popup-close, svg[data-name="Close"]');
            for (const c of closers) {
                if (await c.isVisible()) await c.click();
            }
        } catch (e) { }

        // 2. Title (Cleaned)
        let title = await page.evaluate(() => {
            const h1 = document.querySelector('h1.ProductMeta__Title, h1.product__title, h1');
            return h1 ? h1.innerText.trim() : document.title;
        });
        // Remove [Price info] prefix
        title = title.replace(/^\[.*?\]\s*/g, '').trim();

        // 3. Image (Shopify Prestige Theme)
        const image = await page.evaluate(() => {
            // First try the main slideshow image
            const slideImg = document.querySelector('.Product__Slideshow .Image--fadeIn, .Product__Slideshow img');
            if (slideImg) {
                let src = slideImg.getAttribute('data-original-src') || slideImg.getAttribute('data-src') || slideImg.src;
                if (!src.startsWith('http')) src = 'https:' + src;
                return src;
            }
            // Fallback
            const img = document.querySelector('.product__media img, .product-single__photo img');
            if (img) return img.src.startsWith('//') ? 'https:' + img.src : img.src;
            return '';
        });

        // 4. Ingredients (Accordion)
        let ingredients = await page.evaluate(async () => {
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const clean = (text) => text ? text.replace(/\s+/g, ' ').trim() : '';

            // Look for specific Dalba "Prestige" theme accordion
            const items = document.querySelectorAll('.ingredient-item');
            for (const item of items) {
                const btn = item.querySelector('.ingredient-button');
                if (btn && (btn.innerText.toUpperCase().includes('INGREDIENT') || btn.innerText.toUpperCase().includes('LIST'))) {
                    btn.click();
                    await wait(800);
                    const content = item.querySelector('.ingredient-detail, .ingredient-content, p');
                    if (content) return clean(content.innerText);
                }
            }

            // Fallback for non-accordion pages
            const allText = document.body.innerText;
            if (allText.includes('Water,') || allText.includes('Aqua,')) {
                // Simple heuristic: find a paragraph with comma-separated ingredients
                const paragraphs = document.querySelectorAll('p, div');
                for (const p of paragraphs) {
                    if ((p.innerText.includes('Water,') || p.innerText.includes('Aqua,')) && p.innerText.length > 50) {
                        return clean(p.innerText);
                    }
                }
            }

            return '';
        });

        // Clean up common prefixes
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

        console.log(`[Product] Success: ${title} (Img: ${image ? 'Yes' : 'No'}, Ing: ${ingredients.length} chars)`);
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
