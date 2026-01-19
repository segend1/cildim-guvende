
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

const brandStats = {};

products.forEach(p => {
    // Normalize brand name
    const brand = p.brand ? p.brand.trim() : 'Unknown';

    if (!brandStats[brand]) {
        brandStats[brand] = { total: 0, withIngredients: 0 };
    }

    brandStats[brand].total++;

    if (p.ingredients && p.ingredients.length > 10) {
        brandStats[brand].withIngredients++;
    }
});

const sortedBrands = Object.entries(brandStats)
    .sort((a, b) => b[1].total - a[1].total);

console.log('Brand Statistics (Total | With Ingredients)');
console.log('-------------------------------------------');

sortedBrands.forEach(([name, stats]) => {
    const percentage = Math.round((stats.withIngredients / stats.total) * 100);
    console.log(`${name.padEnd(20)}: ${stats.total.toString().padEnd(4)} | ${stats.withIngredients.toString().padEnd(4)} (${percentage}%)`);
});
