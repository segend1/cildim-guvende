const fs = require('fs');
const path = require('path');

const NEW_PRODUCTS_FILE = path.join(__dirname, '../../data/cerave_products.json');
const TARGET_FILE = path.join(__dirname, '../../src/lib/product_data.json');

function main() {
    if (!fs.existsSync(NEW_PRODUCTS_FILE)) {
        console.error('New products file not found.');
        return;
    }

    let newProducts = [];
    try {
        newProducts = JSON.parse(fs.readFileSync(NEW_PRODUCTS_FILE, 'utf8'));
    } catch (e) {
        console.error('Error parsing new products file:', e);
        return;
    }

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
            p.id = `cerave_${Math.random().toString(36).substr(2, 9)}`;

            // Ensure no duplicate ingredients in the string (sometimes scraped twice?)
            // Just basic cleanup if needed, but scraper seemed okay.

            p.image = p.image || "https://placehold.co/300x300?text=CeraVe";

            currentProducts.push(p);
            added++;
        }
    });

    fs.writeFileSync(TARGET_FILE, JSON.stringify(currentProducts, null, 2));
    console.log(`Successfully merged ${added} new CeraVe products. Total: ${currentProducts.length}`);
}

main();
