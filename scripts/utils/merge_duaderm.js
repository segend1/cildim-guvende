const fs = require('fs');
const path = require('path');

const MAIN_DATA_FILE = path.join(__dirname, '../../src/lib/product_data.json');
const NEW_DATA_FILE = path.join(__dirname, '../../data/duaderm_products.json');

function generateId() {
    return 'duaderm-' + Math.random().toString(36).substr(2, 9);
}

function merge() {
    console.log('Reading files...');
    let mainData = [];
    if (fs.existsSync(MAIN_DATA_FILE)) {
        mainData = JSON.parse(fs.readFileSync(MAIN_DATA_FILE, 'utf8'));
    }

    if (!fs.existsSync(NEW_DATA_FILE)) {
        console.error('New data file not found!');
        return;
    }

    const newData = JSON.parse(fs.readFileSync(NEW_DATA_FILE, 'utf8'));
    console.log(`Loaded ${newData.length} new products.`);

    let addedCount = 0;
    let skippedCount = 0;

    newData.forEach(p => {
        // Validation: Must have ingredients or valid title
        if (!p.ingredients || p.ingredients.length < 10) {
            console.log(`Skipping invalid/empty product: ${p.title} (${p.url})`);
            skippedCount++;
            return;
        }

        // Check duplicate by URL
        const exists = mainData.find(existing => existing.url === p.url);
        if (exists) {
            console.log(`Skipping duplicate URL: ${p.title}`);
            skippedCount++;
            return;
        }

        const newProduct = {
            id: generateId(),
            ...p,
            scraped_at: new Date().toISOString(),
            source: 'official'
        };

        mainData.push(newProduct);
        addedCount++;
    });

    fs.writeFileSync(MAIN_DATA_FILE, JSON.stringify(mainData, null, 2));
    console.log(`Merge complete. Added: ${addedCount}, Skipped: ${skippedCount}. Total products: ${mainData.length}`);
}

merge();
