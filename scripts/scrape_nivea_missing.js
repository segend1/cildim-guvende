
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// Filter Nivea products missing ingredients
const missing = products.filter(p =>
    p.brand === 'Nivea' &&
    (!p.ingredients || p.ingredients.length < 10) &&
    p.url && p.url.includes('nivea.com.tr')
);

console.log(`Found ${missing.length} Nivea products to scrape.`);

if (missing.length === 0) {
    process.exit(0);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    let updatedCount = 0;

    for (const product of missing) {
        console.log(`\nNavigating to: ${product.url}`);
        try {
            await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Nivea cookie banner handling might be needed but let's try direct first.

            // Try to find Ingredients section
            // Often inside an accordion or specific div
            // Selector strategy: Look for text "İçindekiler" or class "ingredients"

            // Click "İçindekiler" button if it exists (Accordion)
            try {
                // Generic expander search
                const expanders = await page.$$('button, div[role="button"], span');
                for (const exp of expanders) {
                    const text = await page.evaluate(el => el.textContent, exp);
                    if (text && text.includes('İçindekiler')) {
                        await exp.click();
                        await new Promise(r => setTimeout(r, 500));
                        break; // Clicked one, hope it opens
                    }
                }
            } catch (e) { /* ignore click errors */ }

            // Extract text
            const ingredients = await page.evaluate(() => {
                // Strategy: Find the 'İçindekiler' button/header, then find the NEXT sibling div that contains text
                const buttons = Array.from(document.querySelectorAll('button'));
                const ingButton = buttons.find(b => (b.textContent || '').includes('İçindekiler'));

                if (ingButton) {
                    // Try to click to expand
                    ingButton.click();
                    // wait a bit? Puppeteer handles this in the script loop, but inside evaluate we can't wait well.
                }

                // Look for the specific class `dag-ingredients-list` (common in Nivea)
                // Or look for a Rich Text component near the bottom
                const richTexts = Array.from(document.querySelectorAll('.rich-text, .text-component'));
                const candidate = richTexts.find(el => {
                    const txt = el.textContent || '';
                    // Must contain "Aqua" or "Glycerin" AND be reasonable length (< 1000)
                    return (txt.includes('Aqua') || txt.includes('Water,') || txt.includes('Glycerin,'))
                        && txt.length > 20
                        && txt.length < 1500;
                });

                if (candidate) return candidate.textContent.trim();

                // Fallback: Look for ANY div containing commas and Aqua
                const allDivs = Array.from(document.querySelectorAll('div'));
                const fallback = allDivs.find(el => {
                    const txt = el.textContent || '';
                    return txt.includes('Aqua') && txt.includes(',') && txt.length > 20 && txt.length < 1000
                        && !txt.includes('footer') && !txt.includes('nav'); // Exclude structural
                });

                return fallback ? fallback.textContent.trim() : null;
            });

            if (ingredients) {
                // Cleanup: Nivea often puts "İçindekiler:" prefix or other junk
                let clean = ingredients
                    .replace(/^İçindekiler:?/i, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                // If it captured too much (whole page footer etc), simple check
                if (clean.length < 2000) {
                    product.ingredients = clean;
                    updatedCount++;
                    console.log(`✅ Scraped: ${clean.substring(0, 50)}...`);
                } else {
                    console.log(`⚠️ Text too long, probably wrong element.`);
                }
            } else {
                console.log(`❌ No ingredients found.`);
            }

        } catch (err) {
            console.error(`Error scraping ${product.url}:`, err.message);
        }

        // Random usage delay
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
    }

    await browser.close();

    if (updatedCount > 0) {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        console.log(`\nSaved ${updatedCount} updated products.`);
    }

})();
