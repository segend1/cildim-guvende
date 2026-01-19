const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/product_data.json'), 'utf8'));
const neutrogena = data.filter(p => (p.brand && p.brand.toLowerCase() === 'neutrogena') || (p.title && p.title.toLowerCase().includes('neutrogena')));

console.log(`Found ${neutrogena.length} Neutrogena products.`);
neutrogena.forEach(p => {
    console.log(`- ${p.name || p.title} [Ingredients: ${p.ingredients ? 'YES' : 'NO'}]`);
});
