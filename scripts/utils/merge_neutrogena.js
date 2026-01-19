const fs = require('fs');
const path = require('path');

const NEW_PRODUCTS_FILE = path.join(__dirname, '../../data/neutrogena_products.json');
const TARGET_FILE = path.join(__dirname, '../../src/lib/product_data.json');

function main() {
    if (!fs.existsSync(NEW_PRODUCTS_FILE)) {
        console.error('New products file not found.');
        return;
    }

    const newProducts = JSON.parse(fs.readFileSync(NEW_PRODUCTS_FILE, 'utf8'));
    let currentProducts = [];

    if (fs.existsSync(TARGET_FILE)) {
        currentProducts = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
    }

    console.log(`Current products: ${currentProducts.length}`);
    console.log(`New products to merge: ${newProducts.length}`);

    let added = 0;
    newProducts.forEach(p => {
        // Deduplicate by URL or Title
        const exists = currentProducts.some(cp => cp.url === p.url || cp.title === p.title);
        if (!exists) {
            // Ensure ID is unique if we were using IDs, but here we likely rely on index or loose structure
            // But let's add a robust ID just in case
            p.id = `neutrogena_${Math.random().toString(36).substr(2, 9)}`;

            // Normalize ingredients key if needed (the scraper used 'ingredients' string)
            // The app might expect an array?
            // Checking product_data.json structure: "ingredients": "Aqua, ..." (String) or Array?
            // Earlier view showed it as String in the JSON file.
            // Let's keep it as is.

            p.image = p.image || "https://placehold.co/300x300?text=Neutrogena";

            currentProducts.push(p);
            added++;
        }
    });

    fs.writeFileSync(TARGET_FILE, JSON.stringify(currentProducts, null, 2));
    console.log(`Successfully merged ${added} new Neutrogena products. Total: ${currentProducts.length}`);
}

main();
