const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const MAIN_FILE = path.join(__dirname, '../../src/lib/product_data.json');
const SOURCE_FILE = path.join(DATA_DIR, 'dalba_products.json');

function merge() {
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error('Source file not found:', SOURCE_FILE);
        return;
    }

    const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
    let mainData = [];

    if (fs.existsSync(MAIN_FILE)) {
        mainData = JSON.parse(fs.readFileSync(MAIN_FILE, 'utf8'));
    }

    console.log(`Loaded ${sourceData.length} products from d'Alba source.`);
    console.log(`Existing database has ${mainData.length} products.`);

    // Remove existing d'Alba entries to avoid duplicates/stale data
    mainData = mainData.filter(p => p.brand !== "d'Alba");
    console.log(`Filtered existing database, now ${mainData.length} products.`);

    let addedCount = 0;
    sourceData.forEach(p => {
        // Only add if it has a title
        if (p.title) {
            // Ensure brand is set
            p.brand = "d'Alba";

            // Clean up ingredients slightly if needed (normalize spaces)
            if (p.ingredients) {
                p.ingredients = p.ingredients.replace(/\s+/g, ' ').trim();
            }

            mainData.push(p);
            addedCount++;
        }
    });

    fs.writeFileSync(MAIN_FILE, JSON.stringify(mainData, null, 2), 'utf8');
    console.log(`Successfully merged ${addedCount} d'Alba products.`);
    console.log(`Total products is now: ${mainData.length}`);
}

merge();
