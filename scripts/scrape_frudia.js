const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/frudia_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/frudia_products.json');

async function getProductLinks() {
    console.log('[Discovery] Reading URLs from file...');
    try {
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
        const title = await page.evaluate(() => {
            const t = document.querySelector('p.ko_tit');
            return t ? t.innerText.trim() : document.title;
        });

        // 2. Image
        const image = await page.evaluate(() => {
            const img = document.querySelector('.pro_view_photo img');
            return img ? img.src : '';
        });

        // 3. Ingredients
        // Strategy: 
        // a. Find the "Ingredients" accordion header (inside .ele) and click it
        // b. Extract text from p.content

        try {
            await page.evaluate(() => {
                const headers = Array.from(document.querySelectorAll('.ele .flex_wrap'));
                const ingHeader = headers.find(h => h.innerText.includes('Ingredients') || h.innerText.includes('INGREDIENTS'));
                if (ingHeader) ingHeader.click();
            });
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) { }

        let ingredients = await page.evaluate(() => {
            // Priority: p.content inside .ele
            // Iterate all .ele sections to find the one with ingredients text
            const eles = Array.from(document.querySelectorAll('.ele'));
            for (const ele of eles) {
                const p = ele.querySelector('p.content');
                if (p && (p.innerText.includes('Water') || p.innerText.includes('Extract') || p.innerText.includes(','))) {
                    return p.innerText.trim();
                }
            }

            // Fallback: Just look for .content.on as user suggested
            const onContent = document.querySelector('.content.on');
            if (onContent) return onContent.innerText.trim();

            return '';
        });

        // Cleanup
        if (ingredients) {
            ingredients = ingredients.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        }

        const product = {
            url,
            title,
            image,
            ingredients: ingredients || '',
            brand: 'Frudia'
        };

        if (product.ingredients.length > 20) {
            console.log(`[Product] Success: ${title} (${product.ingredients.length} chars)`);
            return product;
        } else {
            console.log(`[Product] No ingredients found for ${title}`);
            // Return finding anyway? Or skip? Let's return to see partials.
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

    // Limit for testing? No, full run.
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
