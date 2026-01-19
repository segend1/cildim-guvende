const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../src/lib/product_data.json');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const brand = 'Nivea';
const products = data.filter(p => (p.brand === brand || (p.title && p.title.toLowerCase().includes('nivea'))));

console.log(`Checking ${products.length} Nivea products for duplicate images...`);

const urlCounts = {};
products.forEach(p => {
    if (p.image && p.image.length > 0) {
        urlCounts[p.image] = (urlCounts[p.image] || 0) + 1;
    }
});

let cleanedCount = 0;
products.forEach(p => {
    if (p.image && urlCounts[p.image] > 3) { // If same image appears more than 3 times, it's likely the bug
        // console.log(`Unsetting image for ${p.name || p.title}: ${p.image}`);
        p.image = "";
        cleanedCount++;
    }
});

console.log(`Reset ${cleanedCount} products with suspicious duplicate images.`);

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
