
const fs = require('fs');
const path = require('path');

// Mock browser-like environment for safety.ts? 
// No, safety.ts is TypeScript. I cannot run it directly in Node.js easily without compilation.
// However, I can read the product_data.json if it *already* has analysis.
// Wait, product_data.json HAS `analysis` field, which contains `detailed_ingredients`.
// Does `detailed_ingredients` in product_data.json contain `origin`?
// Let's check the structure of product_data.json again.

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

// We need to re-run the logic because `apply_scores.js` (which wrote product_data) 
// might NOT have written the full `rating` object with origin into `detailed_ingredients`?
// Let's check `apply_scores.js` output structure.
// It writes: return { name: ing, score: score };
// It does NOT write 'origin'.
// But `page.tsx` calls `analyzeProductIngredients` (from safety.ts) on the fly!
// So `product_data.json` does NOT store the origin. The FRONTEND calculates it.
// To "fix" the origins, I must update `src/lib/safety.ts`.

// So, to find what's missing, I need to extract all unique ingredients from product_data.json
// and run them against the logic in `safety.ts`.
// Since I can't run TS easily, I'll extract unique ingredients and save them to a file.
// Then I will check which ones match existing keys in `safety.ts` (by reading safety.ts text).

const uniqueIngredients = new Set();

products.forEach(p => {
    if (p.ingredients) {
        p.ingredients.split(',').forEach(i => {
            const clean = i.trim().toLowerCase();
            if (clean.length > 1) uniqueIngredients.add(clean);
        });
    }
});

console.log(`Total unique ingredients: ${uniqueIngredients.size}`);
console.log(Array.from(uniqueIngredients).slice(0, 20)); // Preview
