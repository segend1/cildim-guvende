const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const INPUT_FILE = path.join(__dirname, '../../data/unique_ingredients.json');
const OUTPUT_PDF = path.join(__dirname, '../../data/ingredients_list.pdf');

(async () => {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error('Ingredients file not found!');
        return;
    }

    const ingredients = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`Generating PDF for ${ingredients.length} ingredients...`);

    // Create simple HTML content
    // Multi-column layout for better paper usage
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; font-size: 10px; padding: 20px; }
            h1 { text-align: center; font-size: 16px; margin-bottom: 20px; }
            .container { column-count: 3; column-gap: 20px; }
            .item { break-inside: avoid; margin-bottom: 2px; }
        </style>
    </head>
    <body>
        <h1>Ingredient Dictionary (${ingredients.length} items)</h1>
        <div class="container">
            ${ingredients.map(i => `<div class="item">• ${i.name}</div>`).join('')}
        </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent);

    await page.pdf({
        path: OUTPUT_PDF,
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true
    });

    console.log(`PDF saved to ${OUTPUT_PDF}`);
    await browser.close();
})();
