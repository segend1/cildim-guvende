const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../src/lib/product_data.json');

const BRANDS = [
    { name: 'Nivea', site: 'nivea.com.tr' },
    { name: 'Frudia', site: 'frudia.com' },
    { name: 'Vichy', site: 'vichy.com.tr' },
    { name: 'La Roche Posay', site: 'laroche-posay.com.tr' },
    { name: "d'Alba", site: 'dalba.com' }
];

function cleanQuery(name) {
    return name
        .replace(/\d+\s?ML/gi, '') // Remove 100 ML
        .replace(/\d+\s?ml/gi, '')
        .replace(/SPF\d+/gi, '') // Remove SPF50
        .replace(/YÜZ KREMİ/gi, '') // Generic
        .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/gi, '') // Special chars
        .replace(/\s+/g, ' ')
        .trim();
}

(async () => {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox'] //, '--window-size=1280,800', '--user-data-dir=./tmp/chrome'] // potential persistence
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const brandConfig of BRANDS) {
        const missing = data.filter(p =>
            (p.brand === brandConfig.name || (p.title && p.title.toLowerCase().includes(brandConfig.name.toLowerCase()))) &&
            (!p.image || p.image === "" || p.image.includes('placeholder'))
        );

        if (missing.length === 0) continue;
        console.log(`\n--- Processing ${brandConfig.name} (${missing.length} missing) ---`);

        let updatedForBrand = 0;

        for (const [index, product] of missing.entries()) {
            const rawName = product.name || product.title;
            const cleaned = cleanQuery(rawName.replace(new RegExp(brandConfig.name, 'gi'), ''));

            // Search Query: site:nivea.com.tr cellular filler
            const searchQuery = `site:${brandConfig.site} ${cleaned}`;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;

            console.log(`[${index + 1}/${missing.length}] Q: "${cleaned}"`);

            try {
                await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 });

                // Heuristic: Check if we got "Looks like there aren't many matches" or empty grid
                // Find first valid image
                const imageUrl = await page.evaluate(() => {
                    // Google Images structure changes often. 
                    // Look for thumbnails in the main grid (usually inside div[data-id] or similar)
                    const imgs = Array.from(document.querySelectorAll('img'));
                    // Filter: must be http, not data:image (unless likely high res), not google logo
                    // The main results usually have defined height/width in older layouts, or specific classes
                    // We'll trust the first "large enough" image that isn't the logo
                    const candidates = imgs.filter(img => img.width > 80 && img.height > 80 && !img.src.includes('google') && !img.src.includes('gstatic.com/images?q=tbn')); /* generic thumbs */

                    // Actually, getting the thumbnail (src) is better than nothing
                    // Let's take the first non-logo image
                    const result = imgs.find(img => img.src && img.src.startsWith('http') && !img.src.includes('google') && img.width > 50);
                    return result ? result.src : null;
                });

                if (imageUrl) {
                    console.log(`  Found: YES`);
                    const productRef = data.find(p => p.id === product.id);
                    if (productRef) {
                        productRef.image = imageUrl;
                        updatedForBrand++;
                    }
                } else {
                    console.log('  Found: NO');
                }

                await new Promise(r => setTimeout(r, 1000));

            } catch (err) {
                console.error(`  Error: ${err.message}`);
            }
        }

        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
        console.log(`Saved ${updatedForBrand} updates for ${brandConfig.name}.`);
    }

    await browser.close();
    console.log('\nDone.');

})();
