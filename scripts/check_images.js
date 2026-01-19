const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/lib/product_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const missingImages = data.filter(p => !p.image || p.image === "" || p.image.includes('placeholder'));

console.log(`Total Products: ${data.length}`);
console.log(`Missing Images: ${missingImages.length}`);

const byBrand = {};
missingImages.forEach(p => {
    const brand = p.brand || "Unknown";
    if (!byBrand[brand]) byBrand[brand] = [];
    byBrand[brand].push(p.name || p.title);
});

console.log('\nMissing Images by Brand:');
Object.keys(byBrand).forEach(b => {
    console.log(`\n[${b}] (${byBrand[b].length})`);
    byBrand[b].slice(0, 5).forEach(n => console.log(`  - ${n}`));
    if (byBrand[b].length > 5) console.log(`  ... and ${byBrand[b].length - 5} more`);
});
