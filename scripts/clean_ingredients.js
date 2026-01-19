
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

let cleanCount = 0;

// Common INCI starters
const STARTERS = ['Aqua', 'Water', 'Glycerin', 'Sodium', 'Alcohol', 'Dimethicone'];

products.forEach(p => {
    if (!p.ingredients) return;

    let text = p.ingredients.trim();
    let cleaned = null;

    // Check if it's a "dirty" text (newlines, suspiciously long with description)
    if (text.includes('\n') || text.length > 500) {

        // Strategy 1: Look for "Aqua," or "Water,"
        // We find the FIRST occurrence of a common starter followed by a comma or space
        for (const start of STARTERS) {
            // Regex: Starter word at start of line or preceded by space/punctuation, matching case insensitive
            // actually usually it's "Aqua, ..."
            const idx = text.indexOf(start + ',');
            if (idx !== -1) {
                // Determine if this looks like the real start.
                // Usually ingredients are at the end.
                // We'll take substring from there.
                cleaned = text.substring(idx);
                break;
            }
            // Also check "Water (" or just "Water,"
        }

        // Strategy 2: If no "Aqua," found, look for "Ingredients:" or "İçindekiler:"
        if (!cleaned) {
            const markers = ['Ingredients:', 'İçindekiler:', 'İçerik:', 'Bileşenler:'];
            for (const m of markers) {
                const idx = text.toLowerCase().indexOf(m.toLowerCase());
                if (idx !== -1) {
                    const potential = text.substring(idx + m.length).trim();
                    // Basic validation: must have commas
                    if (potential.includes(',')) {
                        cleaned = potential;
                        break;
                    }
                }
            }
        }

        // Strategy 3: Last paragraph if it contains commas
        if (!cleaned) {
            const paragraphs = text.split(/\n+/);
            const lastPara = paragraphs[paragraphs.length - 1].trim();
            if (lastPara.includes(',') && lastPara.length > 20) {
                cleaned = lastPara;
            }
        }
    }

    if (cleaned && cleaned !== text) {
        // Post-cleaning: Remove trailing dots/garbage
        cleaned = cleaned.replace(/\.$/, '').trim();

        // Only apply if it looks shorter and "better" (higher density of commas?)
        // Or if the original was massive.
        console.log(`\n[${p.id}] Cleaning...`);
        console.log(`FROM: ${text.substring(0, 50)}... [Length: ${text.length}]`);
        console.log(`TO:   ${cleaned.substring(0, 50)}... [Length: ${cleaned.length}]`);
        p.ingredients = cleaned;
        cleanCount++;
    }
});

if (cleanCount > 0) {
    console.log(`\nSaving ${cleanCount} cleaned products...`);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
} else {
    console.log("No cleaning needed.");
}
