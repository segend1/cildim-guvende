
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

let cleanCount = 0;

products.forEach(p => {
    // Target Frudia and potentially others with massive lists
    if (p.brand === 'Frudia' && p.ingredients && p.ingredients.length > 500) {
        let text = p.ingredients;

        // Pattern 1: Repeated active keys (Water, Glycerin)
        const markers = ['Water, Glycerin', 'Aqua, Glycerin', 'Water, Butylene Glycol', 'Glycerin, Water'];
        let splitIdx = -1;

        for (const m of markers) {
            const first = text.indexOf(m);
            if (first !== -1) {
                const second = text.indexOf(m, first + 10); // Look past the first one
                if (second !== -1) {
                    // Found a repeat!
                    // But wait, sometimes the second one is valid?
                    // Usually in these concat lists, it repeats the BASE ingredients.
                    // Let's check context. If it's "Water, Glycerin" appearing twice, it's 99% a merged list.

                    // We want to cut BEFORE the second occurrence.
                    // But usually there is a Variant Name before it.
                    // E.g. "...Linalool Banana Water..."
                    // We can just cut at the second 'Water'.

                    if (splitIdx === -1 || second < splitIdx) {
                        splitIdx = second;
                    }
                }
            }
        }

        // Pattern 2: Glow Juicy Jam specific (Linalool 02...)
        // It ends with "...Linalool 02SHYPAPAYA..."
        // We look for "Linalool 0" or "Linalool \d"
        const jamMatch = text.match(/Linalool\s*\d{2}/);
        if (jamMatch && jamMatch.index) {
            if (splitIdx === -1 || jamMatch.index < splitIdx) {
                // Keep "Linalool" but cut before the numbers
                splitIdx = jamMatch.index + 8; // "Linalool".length = 8
            }
        }

        if (splitIdx !== -1) {
            // Check if there's a variant name immediately preceding?
            // " Banana Water" -> We might want to cut before "Banana".
            // Hard to detect generic variant names.
            // Safest is to cut at the detected marker.
            // The score will be based on the first product in the set.

            const originalLength = text.length;
            const cleaned = text.substring(0, splitIdx).trim();

            // Clean up trailing garbage (variant name leftovers)
            // e.g. " ...Linalool Banana"
            // If the last word is not a chemical (no comma), maybe drop it?
            // Safety: The server parser ignores non-matches.

            p.ingredients = cleaned;
            cleanCount++;
            console.log(`[CLEANED] ${p.name}`);
            console.log(`   Length: ${originalLength} -> ${cleaned.length}`);
        }
    }
});

if (cleanCount > 0) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`\nSaved ${cleanCount} fixed products.`);
} else {
    console.log("No duplicate lists found.");
}
