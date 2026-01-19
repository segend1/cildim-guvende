const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../src/lib/product_data.json');
const TARGET_BRAND = 'Nivea';
const SITE_URL = 'https://www.nivea.com.tr';

(async () => {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const targets = data.filter(p =>
        (p.brand === TARGET_BRAND || (p.name || p.title).toLowerCase().includes('nivea')) &&
        (!p.image || p.image === "" || p.image.includes('placeholder'))
    );

    console.log(`Found ${targets.length} Nivea products missing images.`);
    if (targets.length === 0) return;

    // Launch with visual head to avoid some bot checks and see flow
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    try {
        await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Aggressive Cookie Killer
        try {
            // Function to find and click 'KABUL ET'
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const accept = buttons.find(b => b.innerText.includes('KABUL ET') || b.id === 'onetrust-accept-btn-handler');
                if (accept) accept.click();
            });
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) { console.log('Cookie banner not found or error:', e); }
    } catch (e) {
        console.error("Failed to load homepage:", e);
        await browser.close();
        return;
    }

    let updatedCount = 0;

    for (const [index, product] of targets.entries()) {
        try {
            // RELOAD HOMEPAGE PER ITEM to avoid stale results
            await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Aggressive Cookie Killer (Fast check)
            await page.evaluate(() => {
                const btn = document.querySelector('#onetrust-accept-btn-handler');
                if (btn) btn.click();
            });
        } catch (e) {
            console.log('  Page load error, skipping...');
            continue;
        }

        const queryName = (product.name || product.title)
            .replace(/NIVEA/gi, '')
            .replace(/\d+\s?ML/gi, '')
            .replace(/\d+\s?ml/gi, '')
            .replace(/SPF\d+/gi, '')
            .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Take first 2 words for search broadness (3 matches "No results" often)
        const shortQuery = queryName.split(' ').slice(0, 2).join(' ');

        console.log(`[${index + 1}/${targets.length}] Searching: "${shortQuery}"`);

        try {
            // Click Search Icon to open overlay (if not already open)
            // Selector: .nx-search-icon or ensure input is visible
            // We just try to find the input directly.

            // Trigger Search Overlay
            await page.waitForSelector('.nx-search-input__text', { visible: true, timeout: 3000 })
                .catch(async () => {
                    // Try clicking search icon using verified selectors via VALID JS
                    console.log('  Input not visible, clicking search icon...');
                    const clicked = await page.evaluate(() => {
                        const btn = document.querySelector('[data-test="search"] a') || document.querySelector('.nx-header-icons__link[href*="Search"]');
                        if (btn) {
                            btn.click();
                            return true;
                        }
                        return false;
                    });

                    if (clicked) await new Promise(r => setTimeout(r, 1000));
                    await page.waitForSelector('.nx-search-input__text', { visible: true, timeout: 5000 });
                });

            // Type and Enter
            await page.evaluate((q) => {
                const input = document.querySelector('.nx-search-input__text');
                if (input) {
                    input.value = q;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                }
            }, shortQuery);

            await page.keyboard.press('Enter');

            // Wait for results - since we reloaded, any result is new
            try {
                await page.waitForSelector('.nx-product-teaser__link-wrapper', { timeout: 10000 });
            } catch (e) {
                console.log('  No results found.');
                continue;
            }

            // Get first product link
            const firstLink = await page.$eval('.nx-product-teaser__link-wrapper', el => el.href);

            if (firstLink) {
                console.log(`  Found Link: ${firstLink}`);

                // Open in new tab to preserve main page state/search context if needed? 
                // Using same page adds navigation overhead. Let's start a new page.
                const productPage = await browser.newPage();
                await productPage.goto(firstLink, { waitUntil: 'domcontentloaded' });

                const imageUrl = await productPage.evaluate(() => {
                    const og = document.querySelector('meta[property="og:image"]');
                    if (og) return og.content;
                    const img = document.querySelector('.nx-image-gallery__image img, .product-image img');
                    return img ? img.src : null;
                });

                if (imageUrl) {
                    console.log(`  Image: ${imageUrl.substring(0, 50)}...`);
                    const productRef = data.find(p => p.id === product.id);
                    if (productRef) {
                        productRef.image = imageUrl;
                        updatedCount++;
                    }
                }
                await productPage.close();
            }

            // Clear search? Or just loop. Loop re-opens search.

        } catch (err) {
            console.error(`  Error: ${err.message}`);
        }

        if (index % 5 === 0) fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`\nDONE. Updated ${updatedCount} products.`);
    await browser.close();

})();
