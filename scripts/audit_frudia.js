
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

const frudia = products.filter(p => p.brand && p.brand.toLowerCase() === 'frudia');

console.log(`Total Frudia Products: ${frudia.length}`);

let missingIngredients = 0;
let suspiciousCount = 0;

frudia.forEach(p => {
    if (!p.ingredients || p.ingredients.length < 10) {
        missingIngredients++;
        console.log(`[MISSING] ${p.name}`);
    } else {
        const count = p.ingredients.split(',').length;
        if (count > 50) {
            suspiciousCount++;
            console.log(`\n[SUSPICIOUS] ${p.name || 'Unknown'} - ${count} ingredients`);
            console.log(p.ingredients);
        }
    }
});

console.log('-----------------------------------');
console.log(`Missing Ingredients: ${missingIngredients}`);
console.log(`Suspiciously Long Lists: ${suspiciousCount}`);
console.log(`Seemingly OK: ${frudia.length - missingIngredients - suspiciousCount}`);
