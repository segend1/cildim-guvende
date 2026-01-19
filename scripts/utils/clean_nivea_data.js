
const fs = require('fs');
const path = require('path');

const RAW_INGREDIENTS = path.join(__dirname, '../../data/ingredients.json');
const APP_INGREDIENTS = path.join(__dirname, '../../src/lib/ingredients.json');
const APP_PRODUCTS = path.join(__dirname, '../../src/lib/product_data.json');

const DISCLAIMER_PART = "Not Listelenen içerikler mevcut üretim durumuna";

function cleanProducts() {
    if (!fs.existsSync(APP_PRODUCTS)) return;

    let raw = fs.readFileSync(APP_PRODUCTS, 'utf8');
    const originalLen = raw.length;

    // Simple string replace for the disclaimer text in the JSON
    // We'll use a regex to catch the whole sentence up to "geçerlidir."
    // "Not Listelenen ... geçerlidir."
    // Be careful with unicode in regex.

    // Instead of complex regex, let's load JSON and clean fields.
    const products = JSON.parse(raw);
    let cleanedCount = 0;

    products.forEach(p => {
        if (p.ingredients && typeof p.ingredients === 'string' && p.ingredients.includes('Not Listelenen')) {
            // Remove the sentence. 
            // It seems to start with "Not Listelenen" and end with "geçerlidir." or "geerlidir." or just be a huge block.
            // We will remove the known prefix until the ingredient list starts (usually "Aqua" or similar).

            // Actually, looking at the grep output: "Not ... geerlidir.  Aqua..."
            // So we can split by "geerlidir." or "geçerlidir." and take the last part if it exists?
            // Or just replace the specific sentence.

            // Strategy: Replace the known start phrase and following chars until we hit 2 consecutive spaces? 
            // Or just remove the specific long string if we can match it.

            // Let's try to remove lines starting with "Not Listelenen" or just the phrase.
            p.ingredients = p.ingredients.replace(/Not Listelenen.*?geçerlidir\.?/gi, '').trim();
            // Handle the "Translation missing" part too?
            p.ingredients = p.ingredients.replace(/\?Translation missing: Active Ingredient:/gi, '').trim();
            p.ingredients = p.ingredients.replace(/Translation missing: Active Ingredient:/gi, '').trim();

            cleanedCount++;
        }
    });

    fs.writeFileSync(APP_PRODUCTS, JSON.stringify(products, null, 2));
    console.log(`[Cleaner] Cleaned ${cleanedCount} products in product_data.json`);
}

function cleanIngredientsDB(filePath) {
    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const before = data.length;

    // Filter out bad ingredients
    const cleanData = data.filter(item => {
        const name = item.name.toLowerCase();
        if (name.includes('not listelenen')) return false;
        if (name.includes('mevcut üretim')) return false;
        if (name.length > 200) return false; // Sanity check
        return true;
    });

    const after = cleanData.length;
    fs.writeFileSync(filePath, JSON.stringify(cleanData, null, 2));
    console.log(`[Cleaner] Removed ${before - after} bad entries from ${path.basename(filePath)}`);
}

function main() {
    console.log('--- CLEANING DATA ---');
    cleanProducts();
    cleanIngredientsDB(RAW_INGREDIENTS);
    cleanIngredientsDB(APP_INGREDIENTS);
    console.log('--- DONE ---');
}

main();
