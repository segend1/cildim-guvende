
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../src/lib/product_data.json');

function fixSnpNames() {
    try {
        const rawData = fs.readFileSync(DATA_PATH, 'utf8');
        let products = JSON.parse(rawData);
        let modifiedCount = 0;

        products = products.map(product => {
            if (product.brand === 'SNP Beauty') {
                const nameField = product.title ? 'title' : (product.name ? 'name' : null);

                if (nameField) {
                    const originalName = product[nameField];
                    // Regex to match the code prefix: Starts with P, followed by alphanumeric chars, ending with space
                    // Example: "P0000FNP Snp Bird's..." -> "Snp Bird's..."
                    const newName = originalName.replace(/^P[0-9A-Z]+\s+/, '');

                    if (newName !== originalName) {
                        console.log(`Renaming: "${originalName}" -> "${newName}"`);
                        product[nameField] = newName;
                        modifiedCount++;
                    }
                }
            }
            return product;
        });

        if (modifiedCount > 0) {
            fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), 'utf8');
            console.log(`Successfully updated ${modifiedCount} SNP Beauty products.`);
        } else {
            console.log('No SNP Beauty products needed renaming.');
        }

    } catch (error) {
        console.error('Error fixing SNP names:', error);
    }
}

fixSnpNames();
