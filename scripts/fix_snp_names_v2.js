
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../src/lib/product_data.json');

function fixSnpNames() {
    try {
        const rawData = fs.readFileSync(DATA_PATH, 'utf8');
        let products = JSON.parse(rawData);
        let modifiedCount = 0;

        products = products.map(product => {
            if (product.brand === 'SNP Beauty' || (product.brand && product.brand.toLowerCase() === 'snp beauty')) {
                let changed = false;

                // Check and fix 'title' field
                if (product.title && typeof product.title === 'string') {
                    const originalTitle = product.title;
                    const newTitle = originalTitle.replace(/^P[0-9A-Z]+\s+/, '');
                    if (newTitle !== originalTitle) {
                        console.log(`Renaming title: "${originalTitle}" -> "${newTitle}"`);
                        product.title = newTitle;
                        changed = true;
                    }
                }

                // Check and fix 'name' field
                if (product.name && typeof product.name === 'string') {
                    const originalName = product.name;
                    const newName = originalName.replace(/^P[0-9A-Z]+\s+/, '');
                    if (newName !== originalName) {
                        console.log(`Renaming name: "${originalName}" -> "${newName}"`);
                        product.name = newName;
                        changed = true;
                    }
                }

                if (changed) modifiedCount++;
            }
            return product;
        });

        if (modifiedCount > 0) {
            fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), 'utf8');
            console.log(`Successfully updated ${modifiedCount} SNP Beauty products (both title and name).`);
        } else {
            console.log('No SNP Beauty products needed renaming.');
        }

    } catch (error) {
        console.error('Error fixing SNP names:', error);
    }
}

fixSnpNames();
