const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');

function deduplicate() {
    if (!fs.existsSync(PRODUCTS_FILE)) {
        console.error('File not found');
        return;
    }

    const rawData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const products = JSON.parse(rawData);

    console.log(`Initial count: ${products.length}`);

    const uniqueMap = new Map();
    const duplicates = [];

    products.forEach(p => {
        // Create a unique key based on name and brand
        // Fallback to title if name is missing
        const name = (p.name || p.title || '').toLowerCase().trim();
        const brand = (p.brand || '').toLowerCase().trim();

        if (!name) return; // Skip empty?

        const key = `${brand}|${name}`;

        if (uniqueMap.has(key)) {
            duplicates.push(p.name || p.title);
        } else {
            uniqueMap.set(key, p);
        }
    });

    const uniqueProducts = Array.from(uniqueMap.values());
    console.log(`Unique count: ${uniqueProducts.length}`);
    console.log(`Removed ${duplicates.length} duplicates.`);

    if (duplicates.length > 0) {
        console.log('Sample duplicates removed:', duplicates.slice(0, 5));
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(uniqueProducts, null, 2));
        console.log(`Saved clean data to ${PRODUCTS_FILE}`);
    } else {
        console.log('No duplicates found.');
    }
}

deduplicate();
