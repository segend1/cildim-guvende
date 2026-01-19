const fs = require('fs');
const path = require('path');

const MAIN_DATA_PATH = path.join(__dirname, '../../src/lib/product_data.json');
const SNP_DATA_PATH = path.join(__dirname, '../../data/snp_products.json');

function mergeSNP() {
    console.log('Reading data...');
    let mainData = [];
    try {
        mainData = JSON.parse(fs.readFileSync(MAIN_DATA_PATH, 'utf8'));
    } catch (e) {
        console.log('Main data not found or invalid, creating new array.');
    }

    let snpData = [];
    try {
        snpData = JSON.parse(fs.readFileSync(SNP_DATA_PATH, 'utf8'));
    } catch (e) {
        console.error('SNP data not found!');
        return;
    }

    console.log(`Current products (Total): ${mainData.length}`);

    // Remove old SNP products if any
    const initialCount = mainData.length;
    mainData = mainData.filter(p => !p.brand || p.brand.toLowerCase() !== 'snp beauty');
    const removedCount = initialCount - mainData.length;
    console.log(`Removed ${removedCount} old SNP products.`);

    // Add new products
    let addedCount = 0;
    snpData.forEach(p => {
        if (!p.title || !p.ingredients) return;

        const newProduct = {
            id: `snp_${Math.random().toString(36).substr(2, 9)}`,
            name: p.title,
            title: p.title,
            brand: 'SNP Beauty',
            image: p.image,
            ingredients: p.ingredients,
            description: `SNP Beauty ${p.title} - ${p.ingredients.substring(0, 100)}...`
        };

        mainData.push(newProduct);
        addedCount++;
    });

    console.log(`Successfully merged ${addedCount} new SNP products. Total: ${mainData.length}`);

    fs.writeFileSync(MAIN_DATA_PATH, JSON.stringify(mainData, null, 2));
}

mergeSNP();
