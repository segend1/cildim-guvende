const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUTPUT_FILE = path.join(__dirname, '../data/neutrogena_products.json');

const CATEGORY_URLS = [
    // Face Sub-categories
    'https://www.neutrogena.com.tr/yuz-bakimi/kuru-ciltler',
    'https://www.neutrogena.com.tr/yuz-bakimi/yagli-cilt',
    'https://www.neutrogena.com.tr/yuz-bakimi/yaslanma-karsiti',
    'https://www.neutrogena.com.tr/yuz-bakimi/hassas-cilt',
    'https://www.neutrogena.com.tr/yuz-bakimi/sivilceli-ciltler',
    'https://www.neutrogena.com.tr/yuz-bakimi/siyah-nokta',
    'https://www.neutrogena.com.tr/yuz-bakimi/leke-karsiti',
    'https://www.neutrogena.com.tr/yuz-bakimi/makyaj-temizleyiciler',
    // Body Sub-categories
    'https://www.neutrogena.com.tr/vucut-bakimi/kuru-ciltler',
    'https://www.neutrogena.com.tr/vucut-bakimi/cok-kuru-ciltler',
    'https://www.neutrogena.com.tr/vucut-bakimi/hassas-ciltler',
    'https://www.neutrogena.com.tr/vucut-bakimi/el-bakimi',
    'https://www.neutrogena.com.tr/vucut-bakimi/ayak-bakimi'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to escape special characters in CSS ID selectors (specifically colon)
function escapeSelector(id) {
    return '#' + id.replace(/:/g, '\\:');
}

async function scrapeProduct(page, url) {
    console.log(`[Product] Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(2000);

        // 1. Get Title
        const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'Unknown Product');

        // 2. Get Image
        const image = await page.$eval('img', el => el.src).catch(() => '');
        // Note: Simple 'img' might catch logo, but usually main product image is prominent. 
        // Refinement: Look for image in product gallery container if needed. 
        // For now, let's try a specific class if possible, or fallback.
        // Based on HTML provided earlier: class "vds-image" inside a card? 
        // Let's rely on standard meta og:image for better reliability
        const metaImage = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => '');


        // 3. Click "İçindekiler" and extract text
        let ingredientsRaw = '';

        // Find all buttons
        const buttons = await page.$$('button');
        let ingredientBtn = null;

        for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text && (text.includes('İçindekiler') || text.toLowerCase().includes('çindekiler'))) {
                ingredientBtn = btn;
                break;
            }
        }

        if (ingredientBtn) {
            console.log('[Product] Found Ingredients button. Clicking...');

            // Get aria-controls ID before clicking, just in case
            const controlledId = await page.evaluate(el => el.getAttribute('aria-controls'), ingredientBtn);

            try {
                await ingredientBtn.click();
            } catch (e) {
                console.log('[Product] Standard click failed, attempting eval click...');
                await page.evaluate(el => el.click(), ingredientBtn);
            }
            await sleep(2000);

            if (controlledId) {
                // Construct selector carefully
                // We use document.getElementById to avoid CSS selector escaping issues entirely
                ingredientsRaw = await page.evaluate((id) => {
                    const el = document.getElementById(id);
                    return el ? el.innerText : '';
                }, controlledId);
            } else {
                // Fallback: look for text structure nearby?
                console.log('[Product] Button has no aria-controls.');
            }
        } else {
            console.log('[Product] "İçindekiler" button NOT found.');
        }

        // Cleanup Ingredients
        let cleanIngredients = '';
        if (ingredientsRaw) {
            cleanIngredients = ingredientsRaw
                .replace(/^İçindekiler\s*/i, '') // Remove header
                .replace(/\n/g, ' ')
                .trim();
        }

        const product = {
            url,
            title,
            image: metaImage || image,
            ingredients: cleanIngredients,
            brand: 'Neutrogena'
        };

        console.log(`[Product] Scraped: ${title} (${cleanIngredients.length} chars ingredients)`);
        return product;

    } catch (error) {
        console.error(`[Product] Error scraping ${url}:`, error.message);
        return null;
    }
}

async function scrapeCategory(page, categoryUrl) {
    console.log(`[Category] Navigating to ${categoryUrl}...`);
    await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Scroll to load lazy items
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
    await sleep(2000);

    // Extract product links
    // Neutrogena generic grid links usually inside <a> tags
    // Let's grab all links, filter by domain + product pattern (usually no pattern? or specific parent class?)
    // Debug HTML showed links in grids..
    // We will look for unique links that are NOT the category link itself.

    const links = await page.$$eval('a', els => els.map(a => a.href));
    // Filter for actual product pages.
    // Usually they are distinct from /yuz-bakimi (category).
    // Let's filter distinct URLs that start with the base URL and contain more path segments
    const uniqueLinks = [...new Set(links)].filter(link =>
        link.includes('neutrogena.com.tr') &&
        link !== categoryUrl &&
        // EXCLUDE known category patterns
        !link.includes('/tum-urun-aileleri') &&
        !link.includes('/cilt-tipi') &&
        !link.includes('/ihtiyac') &&
        !link.includes('/seri') &&
        !link.includes('/guzellik-ve-cilt') && // Blog/Articles
        // Exclude exact category matches
        !link.endsWith('/yuz-bakimi') &&
        !link.endsWith('/vucut-bakimi') &&
        // Exclude common sub-category list pages
        !['kuru-cilt', 'yagli-cilt', 'hassas-cilt', 'sivilce', 'siyah-nokta', 'yaslanma-karsiti', 'leke', 'temizleyiciler', 'nemlendiriciler', 'maskeler', 'tonikler', 'dudak-bakimi'].some(k => link.endsWith(k)) &&
        !['kuru-ciltler', 'yagli-ciltler', 'hassas-ciltler', 'normal-ciltler', 'cok-kuru-ciltler'].some(k => link.endsWith(k)) &&
        // Exclude generic site pages
        !link.includes('site-haritasi') &&
        !link.includes('bize-ulasin') &&
        !link.includes('yasal-uyari') &&
        !link.includes('surdurulebilirlik') &&
        !link.includes('cerez-politikasi') &&
        !link.includes('gizlilik-politikasi') &&
        !link.includes('sss') &&
        // Exclude social/junk
        !link.includes('facebook') &&
        !link.includes('instagram') &&
        !link.includes('youtube') &&
        !link.includes('#')
    );

    console.log(`[Category] Found ${uniqueLinks.length} potential product links.`);

    // Limit for safety during dev/test? User said "tüm ürünler" (all products).
    // Let's take first 30 per category to start.
    return uniqueLinks.slice(0, 30);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let allProducts = [];

    // 1. Get ALL Links from Categories
    let allLinks = new Set();
    for (const catUrl of CATEGORY_URLS) {
        const links = await scrapeCategory(page, catUrl);
        links.forEach(l => allLinks.add(l));
    }

    const linkArray = Array.from(allLinks);
    console.log(`[Main] Total unique products to scrape: ${linkArray.length}`);

    // 2. Scrape Each Product
    for (let i = 0; i < linkArray.length; i++) {
        const link = linkArray[i];
        console.log(`[Main] Processing ${i + 1}/${linkArray.length}: ${link}`);
        const product = await scrapeProduct(page, link);
        if (product && product.ingredients) { // Only save if ingredients found? Or save all?
            // Save even if empty ingredients to know we tried
            allProducts.push(product);
        }

        // Save intermediate results
        if (i % 5 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
            console.log(`[Main] Saved ${allProducts.length} products so far.`);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Main] Done.`);
    await browser.close();
})();
