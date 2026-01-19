
const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../../data/laroche_products.json');
const APP_FILE = path.join(__dirname, '../../src/lib/product_data.json');

function main() {
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error('Source file not found at ' + SOURCE_FILE);
        return;
    }

    const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
    let appData = [];

    if (fs.existsSync(APP_FILE)) {
        appData = JSON.parse(fs.readFileSync(APP_FILE, 'utf8'));
    }

    // Filter out existing by URL
    const existingUrls = new Set(appData.map(p => p.url));
    const newProducts = sourceData.filter(p => !existingUrls.has(p.url));

    console.log(`[Merger] Found ${sourceData.length} LRP products.`);
    console.log(`[Merger] Adding ${newProducts.length} NEW products.`);

    const finalData = [...appData, ...newProducts];

    fs.writeFileSync(APP_FILE, JSON.stringify(finalData, null, 2));
    console.log(`[Merger] Saved total ${finalData.length} products to ${APP_FILE}`);
}

main();
