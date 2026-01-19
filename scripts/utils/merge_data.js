const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw');
const MASTER_FILE = path.join(__dirname, '..', '..', 'data', 'master.json');

function mergeData() {
    console.log('[Merger] Starting data normalization...');
    let allProducts = [];

    if (fs.existsSync(RAW_DIR)) {
        const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));

        for (const file of files) {
            console.log(`[Merger] Processing ${file}...`);
            const rawData = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf-8'));

            // Validate & Clean
            const cleanData = rawData.map(p => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                image: p.image,
                ingredients: p.ingredients,
                url: p.url,
                scraped_at: p.scraped_at,
                source: p.source
            }));

            allProducts = allProducts.concat(cleanData);
        }
    }

    fs.writeFileSync(MASTER_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Merger] Successfully wrote ${allProducts.length} items to ${MASTER_FILE}`);

    // Deploy to App
    const APP_DATA_FILE = path.join(__dirname, '..', '..', 'src', 'lib', 'product_data.json');
    fs.writeFileSync(APP_DATA_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Merger] Deploying data to App: ${APP_DATA_FILE}`);
}

mergeData();
