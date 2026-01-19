
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../../data/nivea_products.json');
const TARGET_FILE = path.join(__dirname, '../../data/target_ingredients.txt');
const SCIENTIFIC_DB = path.join(__dirname, '../../data/scientific_ingredients.json');

function main() {
    if (!fs.existsSync(PRODUCTS_FILE)) {
        console.error('Products file not found!');
        return;
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    let knownSet = new Set();

    if (fs.existsSync(SCIENTIFIC_DB)) {
        const scientificData = JSON.parse(fs.readFileSync(SCIENTIFIC_DB, 'utf8'));
        scientificData.forEach(item => knownSet.add(item.name.toLowerCase()));
    }

    const newIngredients = new Set();

    console.log(`[Extractor] Processing ${products.length} products...`);

    products.forEach(p => {
        if (!p.ingredients) return;

        // Clean: remove 'Dahil:', split by comma, remove dots
        const cleanText = p.ingredients
            .replace(/Dahil:/gi, '')
            .replace(/İçindekiler:/gi, '')
            .replace(/\(.*\)/g, '') // Remove (Nano), (CI 123) maybe? No, CI numbers are important. Remove generic parens?
            // Actually, Nivea lists might be comma separated or just space?
            // "Aqua, Glycerin, ..." -> Comma
            .replace(/\.$/, '');

        const items = cleanText.split(/,|;/);

        items.forEach(rawItem => {
            const item = rawItem.trim().toLowerCase();
            if (item.length > 2 && !knownSet.has(item)) {
                newIngredients.add(item); // Add lower case
            }
        });
    });

    // Formatting for target file (Capitalize first letter?)
    const list = [...newIngredients].map(i => {
        return i.charAt(0).toUpperCase() + i.slice(1);
    }).sort();

    console.log(`[Extractor] Found ${list.length} NEW unique ingredients.`);

    // Append or Overwrite?
    // Let's overwrite target_ingredients.txt so fetcher focuses on this batch.
    // (Previous batch is already saved to ingredients.json)
    fs.writeFileSync(TARGET_FILE, list.join('\n'));
    console.log(`[Extractor] Saved to ${TARGET_FILE}`);
}

main();
