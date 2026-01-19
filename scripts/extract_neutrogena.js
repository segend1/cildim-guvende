const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/neutrogena_products.json');
const OUTPUT_FILE = path.join(__dirname, 'ingredients_neutrogena.txt');

const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

const allIngredients = new Set();

rawData.forEach(product => {
    if (product.ingredients) {
        // Neutrogena ingredients are comma separated
        const list = product.ingredients.split(',').map(i => i.trim());
        list.forEach(ing => {
            if (ing.length > 1 && !ing.includes('İçindekiler')) {
                // Remove trailing dots
                const clean = ing.replace(/\.$/, '');
                allIngredients.add(clean);
            }
        });
    }
});

const sorted = Array.from(allIngredients).sort();
fs.writeFileSync(OUTPUT_FILE, sorted.join('\n'));

console.log(`Extracted ${sorted.length} unique ingredients from ${rawData.length} products.`);
