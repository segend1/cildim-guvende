const fs = require('fs');
const path = require('path');

const MAIN_DATA_PATH = path.join(__dirname, '../../src/lib/product_data.json');
const FRUDIA_DATA_PATH = path.join(__dirname, '../../data/frudia_products.json');

function mergeFrudia() {
    console.log('Reading data...');
    let mainData = [];
    try {
        mainData = JSON.parse(fs.readFileSync(MAIN_DATA_PATH, 'utf8'));
    } catch (e) {
        console.log('Main data not found or invalid, creating new array.');
    }

    let frudiaData = [];
    try {
        frudiaData = JSON.parse(fs.readFileSync(FRUDIA_DATA_PATH, 'utf8'));
    } catch (e) {
        console.error('Frudia data not found!');
        return;
    }

    console.log(`Current products (Total): ${mainData.length}`);

    // Remove old Frudia products if any (clean slate)
    const initialCount = mainData.length;
    mainData = mainData.filter(p => !p.brand || p.brand.toLowerCase() !== 'frudia');
    const removedCount = initialCount - mainData.length;
    console.log(`Removed ${removedCount} old Frudia products.`);

    // Add new products
    let addedCount = 0;
    frudiaData.forEach(p => {
        if (!p.title || !p.ingredients) return;

        const newProduct = {
            id: `frudia_${Math.random().toString(36).substr(2, 9)}`,
            name: p.title, // Standardize on 'name' for the app
            title: p.title, // Keep title for compatibility if needed
            brand: 'Frudia',
            image: p.image,
            ingredients: p.ingredients,
            description: `Frudia ${p.title} - ${p.ingredients.substring(0, 100)}...`
        };

        mainData.push(newProduct);
        addedCount++;
    });

    console.log(`Successfully merged ${addedCount} new Frudia products. Total: ${mainData.length}`);

    fs.writeFileSync(MAIN_DATA_PATH, JSON.stringify(mainData, null, 2));
}

mergeFrudia();
