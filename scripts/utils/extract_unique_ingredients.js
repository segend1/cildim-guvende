const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../../src/lib/product_data.json');
const OUTPUT_FILE = path.join(__dirname, '../../data/unique_ingredients.json');
const OUTPUT_CSV = path.join(__dirname, '../../data/unique_ingredients.csv');

function extractIngredients() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('Product data file not found!');
        return;
    }

    const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`Processing ${products.length} products...`);

    const ingredientCounts = {};
    const productMap = {}; // ingredient -> list of product IDs (optional debugging)

    products.forEach(p => {
        if (!p.ingredients) return;

        // Normalize and split
        // Removing content inside parentheses usually helps dedup e.g. "Water (Aqua)" vs "Water"
        // But for scoring, specificity might matter. Let's keep it simple first: comma split.

        let rawIngredients = p.ingredients.split(',').map(i => i.trim());

        rawIngredients.forEach(ing => {
            // Basic cleanup
            let clean = ing
                .replace(/\.$/, '') // remove trailing dot
                .trim();

            if (clean.length < 2) return; // skip garbage

            // Normalize for counting (case insensitive)
            const key = clean.toLowerCase();

            // Store the most common display casing? Or just lowercase?
            // Let's store the first seen display name for now, or just UpperCase first letter.

            if (!ingredientCounts[key]) {
                ingredientCounts[key] = {
                    name: clean, // Keep the first variation we see
                    count: 0
                };
            }

            ingredientCounts[key].count++;
        });
    });

    // Convert to sorted array
    const sortedIngredients = Object.values(ingredientCounts).sort((a, b) => b.count - a.count);

    console.log(`Found ${sortedIngredients.length} unique ingredients.`);

    // Write JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedIngredients, null, 2));

    // Write CSV for easy copy-pasting to Excel/Sheets for the user
    const csvContent = 'Ingredient,Frequency\n' + sortedIngredients.map(i => `"${i.name.replace(/"/g, '""')}",${i.count}`).join('\n');
    fs.writeFileSync(OUTPUT_CSV, csvContent);

    console.log(`Saved to ${OUTPUT_FILE} and ${OUTPUT_CSV}`);
}

extractIngredients();
