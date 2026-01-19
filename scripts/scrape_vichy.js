const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/vichy_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/vichy_products.json');

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

        // 1. Close Modals (Newsletter)
        try {
            const closeBtn = await page.$('button.btn_close-onglet');
            if (closeBtn) await closeBtn.click();
        } catch (e) { }

        // 2. Title
        const title = await page.evaluate(() => {
            const h1 = document.querySelector('h1');
            return h1 ? h1.innerText.trim() : document.title;
        });

        // 3. Image
        const image = await page.evaluate(() => {
            const img = document.querySelector('img[itemprop="image"]');
            if (img) return img.src;

            // Fallback: finding largest image in main area
            const allImgs = Array.from(document.querySelectorAll('.product-visual img, .obj_product_visual img'));
            return allImgs.length > 0 ? allImgs[0].src : '';
        });

        // 4. Ingredients (User: div[id^="listIngredient_"])
        // Also normalization of " - " to ", "
        let ingredients = await page.evaluate(() => {
            // Priority: The ID pattern user spotted
            const ingDiv = Array.from(document.querySelectorAll('div')).find(d => d.id && d.id.startsWith('listIngredient_'));

            if (ingDiv) {
                return ingDiv.innerText;
            }

            // Fallback: Look for "İçindekiler" or "Ingredients" accordion
            const pTags = Array.from(document.querySelectorAll('p'));
            const potential = pTags.find(p => p.innerText.includes('AQUA') || p.innerText.includes('WATER'));
            return potential ? potential.innerText : '';
        });

        if (ingredients) {
            // Cleanup and Normalize
            // User snippet: "AQUA /WATER / EAU - BUTYLENE GLYCOL..."
            // Replace " - " with ", "
            ingredients = ingredients
                .replace(/\s+-\s+/g, ', ')  // " - " -> ", "
                .replace(/\s-\s/g, ', ')    // " - " -> ", "
                .replace(/\n/g, ' ')
                .trim();
        }

        const product = {
            url,
            title,
            image,
            ingredients: ingredients || '',
            brand: 'Vichy'
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
    // Desktop UA
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
