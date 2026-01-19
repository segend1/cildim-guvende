const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUTPUT_FILE = path.join(__dirname, '../data/cerave_products.json');

const CATEGORY_URLS = [
    'https://www.cerave.com.tr/cilt-bakimi/yuz-temizleyicileri',
    'https://www.cerave.com.tr/cilt-bakimi/yuz-nemlendiricileri',
    'https://www.cerave.com.tr/cilt-bakimi/vucut-temizleyicileri',
    'https://www.cerave.com.tr/cilt-bakimi/vucut-nemlendiricileri',
    'https://www.cerave.com.tr/cilt-bakimi/serumlar',
    'https://www.cerave.com.tr/cilt-bakimi/spf-yuz-kremleri',
    'https://www.cerave.com.tr/cilt-bakimi/akneye-egilim-gosterme',
    'https://www.cerave.com.tr/cilt-bakimi/tahris-olmus-cilt-hissi',
    'https://www.cerave.com.tr/cilt-bakimi/hassas-ciltler',
    'https://www.cerave.com.tr/cilt-bakimi/karma-cilt',
    'https://www.cerave.com.tr/cilt-bakimi/kuru-cilt',
    'https://www.cerave.com.tr/cilt-bakimi/normal-ciltler',
    'https://www.cerave.com.tr/cilt-bakimi/yagli-ciltler',
    'https://www.cerave.com.tr/cilt-bakimi/hyaluronik-asit',
    'https://www.cerave.com.tr/cilt-bakimi/laktik-asit',
    'https://www.cerave.com.tr/cilt-bakimi/niasinamid',
    'https://www.cerave.com.tr/cilt-bakimi/retinol',
    'https://www.cerave.com.tr/cilt-bakimi/salisilik-asitli-urunler'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeProduct(page, url) {
    console.log(`[Product] Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(1500);

        // 1. Title
        const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'Unknown Product');

        // 2. Image
        const image = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => '');

        // 3. Ingredients
        // Look for Accordion trigger "İÇERİKLER"
        // Based on debug: div.accordion__title containing text
        let ingredientsRaw = '';

        const triggers = await page.$$('.accordion__title');
        let targetTrigger = null;

        for (const t of triggers) {
            const text = await page.evaluate(el => el.innerText, t);
            if (text && text.includes('İÇERİKLER')) {
                targetTrigger = t;
                break;
            }
        }

        if (targetTrigger) {
            console.log('[Product] Found Ingredients accordion. Clicking...');

            // Click to expand
            try {
                await targetTrigger.click();
            } catch (e) {
                await page.evaluate(el => el.click(), targetTrigger);
            }
            await sleep(1000);

            // Content is usually the next sibling or inside the parent .accordion container
            // Let's try to find the content container relative to the trigger
            // Usually trigger is inside .accordion, content is also inside .accordion but hidden?
            // Or trigger siblings?
            // Let's inspect the parent for content div
            ingredientsRaw = await page.evaluate(trigger => {
                const parent = trigger.closest('.accordion');
                if (parent) {
                    // Start valid selector logic: look for text content in the parent that is NOT the title
                    // Note: CeraVe might put content in .accordion__content or similar
                    const content = parent.querySelector('.accordion__content, .component-content');
                    return content ? content.innerText : parent.innerText;
                }
                return '';
            }, targetTrigger);

        } else {
            console.log('[Product] Ingredients accordion NOT found.');
        }

        // Cleanup
        let cleanIngredients = ingredientsRaw;
        // Remove the title itself if included
        cleanIngredients = cleanIngredients.replace(/İÇERİKLER/g, '').replace(/\n/g, ' ').trim();

        const product = {
            url,
            title,
            image,
            ingredients: cleanIngredients,
            brand: 'CeraVe'
        };

        console.log(`[Product] Scraped: ${title} (${cleanIngredients.length} chars)`);
        return product;

    } catch (error) {
        console.error(`[Product] Error scraping ${url}:`, error.message);
        return null;
    }
}


async function scrapeCategory(page, categoryUrl) {
    console.log(`[Category] Navigating to ${categoryUrl}...`);
    await page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // CeraVe likely uses lazy load or pagination?
    // Let's scroll a bit
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
    // Look for links inside product tiles. Usually have class 'product-card' or similar.
    // Debug didn't give tiles, so let's be generic but filter strictly like Neutrogena
    const links = await page.$$eval('a', els => els.map(a => a.href));

    const uniqueLinks = [...new Set(links)].filter(link =>
        link.includes('cerave.com.tr/cilt-bakimi/') &&
        link !== categoryUrl &&
        // Exclude categories (simple endsWith check against known categories)
        !link.endsWith('/yuz-temizleyicileri') &&
        !link.endsWith('/yuz-nemlendiricileri') &&
        !link.endsWith('/vucut-temizleyicileri') &&
        !link.endsWith('/vucut-nemlendiricileri') &&
        !link.endsWith('/serumlar') &&
        !link.endsWith('/gunes-koruyucular') &&
        // Exclude other site pages
        !link.includes('satin-alma-noktalari') &&
        !link.includes('sss') &&
        !link.includes('iletisim') &&
        !link.includes('politikasi') &&
        !link.includes('hakkinda') &&
        !link.includes('facebook') &&
        !link.includes('#')
    );

    console.log(`[Category] Found ${uniqueLinks.length} potential product links.`);
    return uniqueLinks;
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let allProducts = [];
    let allLinks = new Set();

    // 1. Gather Links
    for (const catUrl of CATEGORY_URLS) {
        const links = await scrapeCategory(page, catUrl);
        links.forEach(l => allLinks.add(l));
    }

    const linkArray = Array.from(allLinks);
    console.log(`[Main] Total unique products to scrape: ${linkArray.length}`);

    // 2. Scrape
    for (let i = 0; i < linkArray.length; i++) {
        const link = linkArray[i];
        console.log(`[Main] Processing ${i + 1}/${linkArray.length}: ${link}`);
        const product = await scrapeProduct(page, link);
        if (product && product.ingredients.length > 20) {
            allProducts.push(product);
        }

        if (i % 5 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
            console.log(`[Main] Saved ${allProducts.length} products so far.`);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Main] Done.`);
    await browser.close();
})();
