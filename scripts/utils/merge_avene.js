const fs = require('fs');
const path = require('path');

const MASTER_FILE = path.join(__dirname, '../../src/lib/product_data.json');
const AVENE_FILE = path.join(__dirname, '../../data/avene_products.json');

try {
    let masterData = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
    const aveneData = JSON.parse(fs.readFileSync(AVENE_FILE, 'utf8'));

    console.log(`Current products (Total): ${masterData.length}`);

    // WIPE OLD AVENE DATA
    const beforeCount = masterData.length;
    masterData = masterData.filter(p => p.brand !== 'Avene' && !p.id.startsWith('avene_'));
    const afterCount = masterData.length;
    console.log(`Removed ${beforeCount - afterCount} old Avene products.`);

    console.log(`New products to merge: ${aveneData.length}`);

    let addedCount = 0;

    // Create a Set of existing URLs for fast lookup (from OTHER brands, though unlikely to overlap)
    const existingUrls = new Set(masterData.map(p => p.url));

    aveneData.forEach(p => {
        // Skip if URL exists (sanity check)
        if (existingUrls.has(p.url)) return;

        // Create new entry
        const textToId = (text) => text.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 10);

        const newProduct = {
            id: `avene_${textToId(p.title)}`,
            title: p.title,
            brand: "Avene",
            image: p.image,
            ingredients: p.ingredients,
            url: p.url,
            scraped_at: new Date().toISOString(),
            source: 'official'
        };

        masterData.push(newProduct);
        addedCount++;
    });

    fs.writeFileSync(MASTER_FILE, JSON.stringify(masterData, null, 2));
    console.log(`Successfully merged ${addedCount} new Avene products. Total: ${masterData.length}`);

} catch (e) {
    console.error('Error merging:', e);
}
