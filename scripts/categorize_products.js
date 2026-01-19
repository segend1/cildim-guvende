const fs = require('fs');
const path = require('path');

// Load product data
const productDataPath = path.join(__dirname, '../src/lib/product_data.json');
const products = require(productDataPath);

// Category definitions with keywords
const categoryRules = [
    {
        id: 'sun-care',
        name: 'Güneş Koruyucu',
        keywords: ['güneş', 'sun', 'spf', 'uv', 'bronz']
    },
    {
        id: 'deodorant',
        name: 'Deodorant',
        keywords: ['deodorant', 'stick', 'roll-on', 'anti-perspirant', 'antiperspirant']
    },
    {
        id: 'acne-care',
        name: 'Sivilce Bakımı',
        keywords: ['sivilce', 'acne', 'effaclar', 'clear face', 'akne', 'siyah nokta', 'blackhead']
    },
    {
        id: 'eye-care',
        name: 'Göz Bakımı',
        keywords: ['göz', 'eye', 'eyes', 'halka', 'dark circle']
    },
    {
        id: 'hand-care',
        name: 'El Bakımı',
        keywords: ['el', 'hand', 'main', 'tırnak', 'nail']
    },
    {
        id: 'serum',
        name: 'Serum',
        keywords: ['serum']
    },
    {
        id: 'cleanser',
        name: 'Temizleyici',
        keywords: ['temizleme', 'temizleyici', 'cleansing', 'cleanser', 'jel', 'gel', 'foam', 'köpük', 'micellar', 'misel', 'peeling', 'scrub']
    },
    {
        id: 'body-care',
        name: 'Vücut Bakımı',
        keywords: ['vücut', 'body', 'lotion', 'losyon', 'balsam', 'balm', 'süt', 'milk']
    },
    {
        id: 'face-care',
        name: 'Yüz Bakımı',
        keywords: ['yüz', 'face', 'krem', 'cream', 'creme', 'nemlendirici', 'moisturizer', 'gece', 'night', 'gündüz', 'day', 'bb', 'cc', 'fluid', 'maske', 'mask']
    }
];

function categorizeProduct(product) {
    const name = (product.name || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    const searchText = `${name} ${brand}`;

    // Check each category rule in order (order matters - more specific first)
    for (const rule of categoryRules) {
        for (const keyword of rule.keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                return rule.id;
            }
        }
    }

    // Default category if no match found
    return 'other';
}

// Categorize all products
let categorized = 0;
let uncategorized = 0;
const categoryStats = {};

products.forEach(product => {
    const category = categorizeProduct(product);
    product.category = category;

    if (category === 'other') {
        uncategorized++;
    } else {
        categorized++;
    }

    // Track stats
    categoryStats[category] = (categoryStats[category] || 0) + 1;
});

// Save updated product data
fs.writeFileSync(productDataPath, JSON.stringify(products, null, 2), 'utf-8');

// Print statistics
console.log('\n=== Kategorizasyon Tamamlandı ===\n');
console.log(`Toplam ürün sayısı: ${products.length}`);
console.log(`Kategorize edilen: ${categorized}`);
console.log(`Kategorisiz (other): ${uncategorized}`);
console.log('\nKategori dağılımı:');

Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
        const rule = categoryRules.find(r => r.id === category);
        const name = rule ? rule.name : 'Diğer';
        console.log(`  ${name} (${category}): ${count}`);
    });

console.log('\n✓ Veriler kaydedildi:', productDataPath);
