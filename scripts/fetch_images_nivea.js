const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../src/lib/product_data.json');
const TARGET_BRAND = 'Nivea';
const SITE_URL = 'https://www.nivea.com.tr';

(async () => {
    // 1. Load Data
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const targets = data.filter(p =>
        (p.brand === TARGET_BRAND || (p.title && p.title.toLowerCase().includes('nivea'))) &&
        (!p.image || p.image === "" || p.image.includes('placeholder'))
    );

    console.log(`Found ${targets.length} ${TARGET_BRAND} products missing images.`);
    if (targets.length === 0) return;

    // 2. Launch Browser
    const browser = await puppeteer.launch({
        headless: true, // Visible for debugging if needed
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let updatedCount = 0;

    for (const [index, product] of targets.entries()) {
        const query = product.name || product.title;
        // Clean query: remove special chars, maybe keep it simple
        const cleanQuery = query.replace(/NIVEA/gi, '').trim().split(' ').slice(0, 4).join(' '); // Search first 4 words for better hit rate

        console.log(`[${index + 1}/${targets.length}] Searching: "${cleanQuery}"`);

        try {
            // Nivea Search URL pattern (heuristic)
            const searchUrl = `${SITE_URL}/arama-sonuclari?q=${encodeURIComponent(cleanQuery)}`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

            // Wait for results
            try {
                await page.waitForSelector('.result-item, .product-item, .nx-search-result-product', { timeout: 5000 });
            } catch (e) {
                // No results found
                console.log('  No results found.');
                continue;
            }

            // Extract first image
            const imageUrl = await page.evaluate(() => {
                // Try multiple selectors common on Nivea sites
                const img = document.querySelector('.result-item img') ||
                    document.querySelector('.product-item img') ||
                    document.querySelector('.nx-search-result-product img');

                return img ? img.src : null;
            });

            if (imageUrl) {
                console.log(`  Found Image: ${imageUrl.substring(0, 50)}...`);
                // Update in memory
                const productRef = data.find(p => p.id === product.id);
                if (productRef) {
                    productRef.image = imageUrl;
                    updatedCount++;
                }
            } else {
                console.log('  No image found in results.');
            }

            // Be nice to the server
            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.error(`  Error: ${err.message}`);
        }
    }

    await browser.close();

    // 3. Save
    if (updatedCount > 0) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
        console.log(`\nUpdated ${updatedCount} products. Saved to ${DATA_PATH}`);
    } else {
        console.log('\nNo updates made.');
    }

})();
