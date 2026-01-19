
const fs = require('fs');
const path = require('path');

const NIVEA_FILE = path.join(__dirname, '../../data/nivea_products.json');
const APP_FILE = path.join(__dirname, '../../src/lib/product_data.json');

function main() {
    if (!fs.existsSync(NIVEA_FILE)) {
        console.error('Nivea file not found');
        return;
    }

    const nivea = JSON.parse(fs.readFileSync(NIVEA_FILE, 'utf8'));
    const appData = JSON.parse(fs.readFileSync(APP_FILE, 'utf8'));

    // Filter out existing Nivea products to avoid dupes (by URL or name)
    const existingUrls = new Set(appData.map(p => p.url));
    const newProducts = nivea.filter(p => !existingUrls.has(p.url));

    console.log(`[Merger] Adding ${newProducts.length} new Nivea products to existing ${appData.length}.`);

    const finalData = [...appData, ...newProducts];

    fs.writeFileSync(APP_FILE, JSON.stringify(finalData, null, 2));
    console.log(`[Merger] Saved ${finalData.length} products to ${APP_FILE}`);
}

main();
