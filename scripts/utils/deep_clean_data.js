
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../../src/lib/product_data.json');
const INGREDIENTS_FILE = path.join(__dirname, '../../src/lib/ingredients.json');
const RAW_INGREDIENTS_FILE = path.join(__dirname, '../../data/ingredients.json');

// Patterns that indicate TRASH (Marketing text, not ingredients)
const TRASH_PATTERNS = [
    /unu içermez/i,
    /şunu içermez/i,
    /does not contain/i,
    /parabenler/i, // Plural usually indicates a claim "No Parabens"
    /mineral yağı aqua/i, // Specific concatenation error
    /mevcut üretim/i,
    /not listelenen/i,
    /bilimsel bulgular/i,
    /her durumda geçerlidir/i,
    /koruyucular/i, // "No preservatives"
    /renklendiriciler/i,
    /silikonlar/i,
    /mineral yağlar/i,
    /hayvansal kökenli/i
    // Add more as needed
];

// Patterns to FIX (Split merged items)
const SPLIT_PATTERNS = [
    { regex: /Mineral Yağı Aqua/i, fix: "Aqua" }, // Just keep Aqua, Mineral Oil was likely "No Mineral Oil"
    { regex: /Parfum Aqua/i, fix: "Parfum" }, // Assume last is real or split?
    { regex: /Water Aqua/i, fix: "Aqua" }
];

function cleanString(str) {
    if (!str) return str;

    // 1. Remove specific trash sentences/fragments
    let cleaned = str;

    // "unu içermez Parabenler" -> Remove.
    // "şunu içermez mineral yağ aqua" -> Remove.

    // Strategy: If a segment (comma separated) matches a trash pattern, kill it.
    // If the whole string is the ingredient list, we need to be careful.
    // In product_data.json, `ingredients` is a long string.

    // Let's first look at the `ingredients.json` keys (individual names).
    return cleaned;
}

function cleanIngredientsDB(filePath) {
    if (!fs.existsSync(filePath)) return;

    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const initialCount = data.length;

    data = data.filter(item => {
        const name = item.name.toLowerCase();

        // Strict Trash Filter
        for (const pattern of TRASH_PATTERNS) {
            if (pattern.test(name)) {
                console.log(`[Cleaner] Removing trash ingredient: "${item.name}" matches ${pattern}`);
                return false;
            }
        }

        // Length sanity check (ingredients rarely > 80 chars unless chemical name)
        if (name.length > 100) {
            console.log(`[Cleaner] Removing long text: "${item.name.substr(0, 50)}..."`);
            return false;
        }

        return true;
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`[Cleaner] ${path.basename(filePath)}: Removed ${initialCount - data.length} items.`);
}

function cleanProductData() {
    if (!fs.existsSync(PRODUCTS_FILE)) return;

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    let cleanCount = 0;

    products.forEach(p => {
        if (!p.ingredients) return;

        let original = p.ingredients;
        let modified = original;

        // 1. Remove "şunu içermez..." blocks completely if they appear at the end or begin
        // "Aqua, Glycerin. Şunu içermez: Paraben, Alkol."
        // Regex to replace "Şunu içermez.*" ?

        modified = modified.replace(/Şunu içermez.*$/gim, '');
        modified = modified.replace(/unu içermez.*$/gim, '');

        // Specific concatenations mentioned by user
        // Specific concatenations mentioned by user
        modified = modified.replace(/Mineral Yağı Aqua/gi, 'Aqua');

        // LRP Normalization
        // Replace bullets with commas
        modified = modified.replace(/•/g, ',');
        // Replace "AQUA / WATER" with "AQUA"
        modified = modified.replace(/AQUA \/ WATER/gi, 'AQUA');

        // Remove known LRP garbage
        const LRP_GARBAGE = [
            "43 kadın aninda ve uzun süreli̇ etki̇li̇li̇ği̇ kanitlanmiştir",
            "Türkiye temsili 443 dermatologla gerçekleştirilen",
            "Ana menü giriş effaclar",
            "Laboratuvarlara geri dönüp yeniden formülasyon",
            "Başlamak için QR kodunu mobil cihazınızla tarayın"
        ];

        // Split by comma to filter out garbage sentences
        const parts = modified.split(',').map(s => s.trim()).filter(s => {
            if (!s) return false;
            // Check against blacklisted phrases
            if (LRP_GARBAGE.some(g => s.includes(g.substr(0, 20)))) return false;
            // Remove generally long sentences (>150 chars) if they contain spaces (chemical names usually don't have many spaces unless complex)
            if (s.length > 150 && s.split(' ').length > 5) return false;
            return true;
        });

        modified = parts.join(', ');

        // Remove specific "Parabenler" text if it's floating
        modified = modified.replace(/Parabenler/gi, '');
        modified = modified.replace(/Sentetik renklendiriciler/gi, '');

        // General cleanup of double spaces/commas
        modified = modified.replace(/,\s*,/g, ',');
        modified = modified.replace(/\s+/g, ' ').trim();

        if (original !== modified) {
            p.ingredients = modified;
            cleanCount++;
        }
    });

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`[Cleaner] Cleaned ingredient lists in ${cleanCount} products.`);
}

function main() {
    console.log('--- DEEP CLEAN START ---');
    cleanIngredientsDB(INGREDIENTS_FILE);
    cleanIngredientsDB(RAW_INGREDIENTS_FILE);
    cleanProductData();
    console.log('--- DEEP CLEAN DONE ---');
}

main();
