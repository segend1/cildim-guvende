const fs = require('fs');
const path = require('path');

const MAIN_DATA_PATH = path.join(__dirname, '../../src/lib/product_data.json');
const VICHY_DATA_PATH = path.join(__dirname, '../../data/vichy_products.json');

function mergeVichy() {
    console.log('Reading data...');
    let mainData = [];
    try {
        mainData = JSON.parse(fs.readFileSync(MAIN_DATA_PATH, 'utf8'));
    } catch (e) {
        console.log('Main data not found or invalid, creating new array.');
    }

    let vichyData = [];
    try {
        vichyData = JSON.parse(fs.readFileSync(VICHY_DATA_PATH, 'utf8'));
    } catch (e) {
        console.error('Vichy data not found!');
        return;
    }

    console.log(`Current products (Total): ${mainData.length}`);

    // Remove old Vichy products if any (clean slate)
    const initialCount = mainData.length;
    mainData = mainData.filter(p => !p.brand || p.brand.toLowerCase() !== 'vichy');
    const removedCount = initialCount - mainData.length;
    console.log(`Removed ${removedCount} old Vichy products.`);

    // Add new products
    let addedCount = 0;
    vichyData.forEach(p => {
        if (!p.title || !p.ingredients) return;

        const newProduct = {
            id: `vichy_${Math.random().toString(36).substr(2, 9)}`,
            name: p.title,
            title: p.title,
            brand: 'Vichy',
            image: p.image,
            ingredients: p.ingredients,
            description: `Vichy ${p.title} - ${p.ingredients.substring(0, 100)}...`
        };

        mainData.push(newProduct);
        addedCount++;
    });

    console.log(`Successfully merged ${addedCount} new Vichy products. Total: ${mainData.length}`);

    fs.writeFileSync(MAIN_DATA_PATH, JSON.stringify(mainData, null, 2));
}

mergeVichy();
