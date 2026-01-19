
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../../data/laroche_products.json');
const TARGET_FILE = path.join(__dirname, '../../data/target_ingredients.txt');
const SCIENTIFIC_DB = path.join(__dirname, '../../data/scientific_ingredients.json');

function main() {
    if (!fs.existsSync(PRODUCTS_FILE)) {
        console.error('LRP products file not found!');
        return;
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    let knownSet = new Set();

    if (fs.existsSync(SCIENTIFIC_DB)) {
        const scientificData = JSON.parse(fs.readFileSync(SCIENTIFIC_DB, 'utf8'));
        scientificData.forEach(item => knownSet.add(item.name.toLowerCase()));
    }

    const newIngredients = new Set();

    console.log(`[Extractor] Processing ${products.length} LRP products...`);

    products.forEach(p => {
        if (!p.ingredients) return;

        // LRP formats: "AQUA / WATER • HOMOSALATE • ..." (Bullets)
        // Or "AQUA / WATER, HOMOSALATE, ..." (Commas)

        let raw = p.ingredients;
        // Remove known non-ingredients
        raw = raw.replace(/İçindekiler/gi, '').replace(/:/g, '');

        // Normalization for slash "AQUA / WATER" -> "AQUA"
        // But maybe "AQUA / WATER" is the INCI name? usually mapped to Aqua.
        // We will split by bullets "•" and commas ","

        const items = raw.split(/,|•|;/);

        items.forEach(rawItem => {
            let item = rawItem.trim();
            // Handle "AQUA / WATER" -> "AQUA"
            if (item.includes('/')) {
                const parts = item.split('/');
                item = parts[0].trim(); // Take first part
            }

            item = item.toLowerCase();

            if (item.length > 2 && !knownSet.has(item)) {
                newIngredients.add(item);
            }
        });
    });

    const list = [...newIngredients].map(i => {
        return i.charAt(0).toUpperCase() + i.slice(1);
    }).sort();

    console.log(`[Extractor] Found ${list.length} NEW unique ingredients from LRP.`);

    fs.writeFileSync(TARGET_FILE, list.join('\n'));
    console.log(`[Extractor] Saved to ${TARGET_FILE}`);
}

main();
