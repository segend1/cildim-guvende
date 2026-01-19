
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

const SUSPICIOUS_KEYWORDS = [
    'http', 'www', 'faydalar', 'kullanım', 'stok', 'sepete', 'kargo',
    'ücretsiz', 'tl', 'adet', 'incele', 'puan', 'yorum', 'sk', 'yıldız',
    'gönderim', 'iade', 'garanti', 'menşei', 'yerli', 'üretim', 'barkod',
    'kategori', 'marka', 'hakkında', 'tanıtım', 'açıklama', 'özellikler'
];

console.log(`Scanning ${products.length} products...`);
let suspiciousCount = 0;

products.forEach(p => {
    let reasons = [];
    const text = p.ingredients || "";

    // Check 1: Too short or empty
    if (text.length < 5) {
        // reasons.push("Too short/empty");
    }

    // Check 2: Suspicious keywords
    const lower = text.toLowerCase();
    const foundKeywords = SUSPICIOUS_KEYWORDS.filter(k => lower.includes(k));
    if (foundKeywords.length > 0) {
        reasons.push(`Keywords: ${foundKeywords.join(', ')}`);
    }

    // Check 3: Too long individual "ingredient" (split by comma)
    const parts = text.split(',');
    const longParts = parts.filter(part => part.length > 100);
    if (longParts.length > 0) {
        reasons.push(`Long segments (>100 chars): ${longParts.length} found`);
    }

    // Check 4: Contains newlines (often indicates description text)
    if (text.includes('\n')) {
        reasons.push("Contains newlines");
    }

    if (reasons.length > 0) {
        console.log(`\n[${p.id}] ${p.name}`);
        console.log(`  Issues: ${reasons.join(' | ')}`);
        console.log(`  Preview: ${text.substring(0, 100)}...`);
        suspiciousCount++;
    }
});

console.log(`\nTotal suspicious products: ${suspiciousCount}`);
