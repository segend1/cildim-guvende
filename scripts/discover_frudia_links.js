const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/frudia_urls.txt');
const BASE_URL = 'https://www.frudia.com/en/product/product06.php';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 1. Get Initial Links from Base Page
    const initialLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
            .map(a => a.href)
            .filter(href => href.includes('frudia.com'));
    });

    let productLinks = initialLinks.filter(l => l.includes('prdcode='));
    let categoryLinks = initialLinks.filter(l => l.includes('catcode=') && !l.includes('prdcode='));

    // Add known base pages
    categoryLinks.push('https://www.frudia.com/en/product/product02.php');
    categoryLinks.push('https://www.frudia.com/en/product/product06.php');

    categoryLinks = [...new Set(categoryLinks)];
    console.log(`Found ${productLinks.length} initial products and ${categoryLinks.length} categories.`);

    // 2. Scan Categories
    for (const catUrl of categoryLinks) {
        console.log(`Scanning Category: ${catUrl}...`);
        try {
            await page.goto(catUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Get products on this category page
            const newProducts = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href*="prdcode="]'))
                    .map(a => a.href);
            });

            console.log(`  Found ${newProducts.length} products.`);
            productLinks.push(...newProducts);

        } catch (e) {
            console.log('Skipping category due to error:', e.message);
        }
    }

    const uniqueProducts = [...new Set(productLinks)];
    console.log(`Total Unique Products Found: ${uniqueProducts.length}`);

    fs.writeFileSync(OUTPUT_FILE, uniqueProducts.join('\n'));
    await browser.close();
})();
