
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// ---------------------------------------------------------
// COPY OF SAFETY.TS LOGIC (Simplified for JS)
// ---------------------------------------------------------

const INGREDIENT_RISKS = {
    // ... (I will fill this with keys found in safety.ts via regex later or just minimal set for now? 
    // No, I need the REAL set to know what is KNOWN.
    // I will use a placeholder or read safety.ts and eval it? No, unsafe/complex.
    // I will manually map the keys I saw earlier or just assume I need to improve coverage.)
};

// ... Wait, coping the WHOLE safety.ts is hard.
// Better strategy: Read safety.ts text, extract keys using Regex.
// Keys in `INGREDIENT_RISKS` are known.
// Keys in `TURKISH_TO_INCI` are known (normalized).
// Keys in `SUFFIX_RISKS` are known patterns.

const SAFETY_TS_PATH = path.join(__dirname, '../src/lib/safety.ts');
const safetyTsContent = fs.readFileSync(SAFETY_TS_PATH, 'utf8');

// Extract keys from INGREDIENT_RISKS
const knownIngredients = new Set();
const riskMatch = safetyTsContent.match(/INGREDIENT_RISKS: Record<string, SafetyRating> = \{([\s\S]*?)\};/);
if (riskMatch && riskMatch[1]) {
    const lines = riskMatch[1].split('\n');
    lines.forEach(line => {
        const match = line.match(/'([^']+)':/);
        if (match) knownIngredients.add(match[1]);
    });
}

// Extract keys from TURKISH_TO_INCI
const transMatch = safetyTsContent.match(/TURKISH_TO_INCI: Record<string, string> = \{([\s\S]*?)\};/);
const turkishMap = new Map();
if (transMatch && transMatch[1]) {
    const lines = transMatch[1].split('\n');
    lines.forEach(line => {
        const match = line.match(/'([^']+)':\s*'([^']+)'/);
        if (match) turkishMap.set(match[1], match[2]);
    });
}

// Extract Suffixes
const suffixes = [];
const suffixMatch = safetyTsContent.match(/SUFFIX_RISKS: Record<string, SafetyRating> = \{([\s\S]*?)\};/);
if (suffixMatch && suffixMatch[1]) {
    const lines = suffixMatch[1].split('\n');
    lines.forEach(line => {
        const match = line.match(/'([^']+)':/);
        if (match) suffixes.push(match[1]);
    });
}

// ---------------------------------------------------------
// ANALYZE
// ---------------------------------------------------------

const ingredientCounts = {};

products.forEach(p => {
    if (p.ingredients) {
        p.ingredients.split(',').forEach(i => {
            const raw = i.trim().toLowerCase();
            if (raw.length < 2) return;
            ingredientCounts[raw] = (ingredientCounts[raw] || 0) + 1;
        });
    }
});

const unknownList = [];

Object.keys(ingredientCounts).forEach(raw => {
    let lower = raw;
    let known = false;

    // Check Turkish Map
    if (turkishMap.has(lower)) {
        lower = turkishMap.get(lower); // Normalize to INCI
    }

    // Check Known List
    if (knownIngredients.has(lower)) {
        known = true;
    }

    // Check Suffixes
    if (!known) {
        for (const s of suffixes) {
            if (lower.includes(s)) {
                known = true;
                break;
            }
        }
    }

    // Check Heuristics (Simple)
    if (!known) {
        if (lower.includes('extract') || lower.includes('oil') || lower.includes('water') || lower.includes('juice') || lower.includes('leaf') || lower.includes('root')) {
            known = true; // Natural heuristic
        }
    }

    if (!known) {
        unknownList.push({ name: raw, count: ingredientCounts[raw] });
    }
});

// Sort by frequency
unknownList.sort((a, b) => b.count - a.count);

console.log(`Total Unknown Ingredients: ${unknownList.length}`);
console.log('Top 50 Unknowns:');
unknownList.slice(0, 50).forEach(u => console.log(`${u.count} x ${u.name}`));

