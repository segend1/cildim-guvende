const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/snp_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/snp_products.json');

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

        // 1. Title
        const title = await page.evaluate(() => {
            const h2 = document.querySelector('.infoArea h2');
            if (h2) return h2.innerText.trim();
            const h1 = document.querySelector('h1');
            return h1 ? h1.innerText.trim() : document.title;
        });

        // 2. Image
        const image = await page.evaluate(() => {
            const img = document.querySelector('.bigImage'); // Common in KR generic carts
            if (img) return img.src;
            const keyImg = document.querySelector('.keyImg img');
            if (keyImg) return keyImg.src;
            return '';
        });

        // 3. Ingredients
        // Logic: Find table row with "Ingredients" header, then get content.
        let ingredients = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.edinfo-detail table.edinfo-info tr'));

            // Look for row with "Ingredients" in the header (th)
            const targetRow = rows.find(row => {
                const th = row.querySelector('th');
                return th && (th.innerText.includes('Ingredients') || th.innerText.includes('Material'));
            });

            if (targetRow) {
                const desc = targetRow.querySelector('.edinfo-desc') || targetRow.querySelector('td');
                if (desc) return desc.innerText.trim();
            }

            // Fallback: Check all .edinfo-desc divs for "Water" or "Aqua"
            const potentialDivs = Array.from(document.querySelectorAll('.edinfo-desc'));
            const match = potentialDivs.find(d => {
                const txt = d.innerText;
                return (txt.includes('Water,') || txt.includes('Aqua,')) && txt.length > 50;
            });

            return match ? match.innerText.trim() : '';
        });

        // Cleanup
        if (ingredients) {
            ingredients = ingredients.replace(/Start typing ingredients.*/i, '').trim();
        }

        const product = {
            url,
            title,
            image,
            ingredients: ingredients || '',
            brand: 'SNP Beauty'
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
