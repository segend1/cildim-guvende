const fs = require('fs');
const path = require('path');

const MAIN_DATA_PATH = path.join(__dirname, '../../src/lib/product_data.json');
const TPS_DATA_PATH = path.join(__dirname, '../../data/tps_products.json');

function mergeTPS() {
    console.log('Reading data...');
    let mainData = [];
    try {
        mainData = JSON.parse(fs.readFileSync(MAIN_DATA_PATH, 'utf8'));
    } catch (e) {
        console.log('Main data not found or invalid, creating new array.');
    }

    let tpsData = [];
    try {
        tpsData = JSON.parse(fs.readFileSync(TPS_DATA_PATH, 'utf8'));
    } catch (e) {
        console.error('TPS data not found!');
        return;
    }

    console.log(`Current products (Total): ${mainData.length}`);

    // Remove old TPS products if any
    const initialCount = mainData.length;
    mainData = mainData.filter(p => !p.brand || p.brand.toLowerCase() !== 'the purest solutions');
    const removedCount = initialCount - mainData.length;
    console.log(`Removed ${removedCount} old TPS products.`);

    // Add new products
    let addedCount = 0;
    tpsData.forEach(p => {
        if (!p.title || !p.ingredients) return;

        const newProduct = {
            id: `tps_${Math.random().toString(36).substr(2, 9)}`,
            name: p.title,
            title: p.title,
            brand: 'The Purest Solutions',
            image: p.image,
            ingredients: p.ingredients,
            description: `The Purest Solutions ${p.title} - ${p.ingredients.substring(0, 100)}...`
        };

        mainData.push(newProduct);
        addedCount++;
    });

    console.log(`Successfully merged ${addedCount} new TPS products. Total: ${mainData.length}`);

    fs.writeFileSync(MAIN_DATA_PATH, JSON.stringify(mainData, null, 2));
}

mergeTPS();
