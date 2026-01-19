
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = 'https://www.laroche-posay.com.tr';
const CATEGORY_URLS = [
    'https://www.laroche-posay.com.tr/anthelios',
    'https://www.laroche-posay.com.tr/cilt-kusuru-duzenlemeye-yardimci-effaclar-serisi',
    'https://www.laroche-posay.com.tr/hassasiyet-yatistirici-cicaplast-serisi',
    'https://www.laroche-posay.com.tr/hassas-ciltler-icin-antioksidan-vitamin-c',
    'https://www.laroche-posay.com.tr/hassas-ciltler-icin-hyalu-b5-serisi'
];
const OUTPUT_FILE = path.join(__dirname, '../data/laroche_products.json');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeCategory(browser, categoryUrl) {
    const page = await browser.newPage();
    try {
        console.log(`[Scraper] Visiting Category: ${categoryUrl}`);
        // Block images/css to speed up? Maybe not, layout might be needed.
        await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait for cards
        try {
            await page.waitForSelector('a', { timeout: 10000 });
        } catch (e) { }

        const links = await page.evaluate((base) => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => href && href.includes('laroche-posay.com.tr') && !href.includes('google') && !href.includes('facebook'))
                .filter(href => {
                    const bad = [
                        '/iletisim', '/hakkimizda', '/giris', '/sepet', '/kategori', '/serisi',
                        '/article/', '/blog/', '/rehber/', '/sss/', '/bize-ulasin',
                        '/cilt-bakim-rutini', '/gunes-korumasi/', '/atopiye-egilim-gosterebilen-cilt/',
                        'javascript:', '.pdf', '/site-haritasi'
                    ];
                    if (bad.some(b => href.includes(b))) return false;
                    if (href.endsWith('-serisi')) return false;
                    return href.length > 30; // Heuristic
                });
        }, BASE_URL);

        const unique = [...new Set(links)];
        console.log(`[Scraper] Found ${unique.length} links.`);
        return unique;
    } catch (err) {
        console.error(`[Scraper] Category Error: ${err.message}`);
        return [];
    } finally {
        await page.close();
    }
}

async function scrapeProduct(browser, productUrl) {
    const page = await browser.newPage();
    try {
        // console.log(`[Scraper] Visiting: ${productUrl}`);
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Title
        let title = '';
        try {
            await page.waitForSelector('h1', { timeout: 5000 });
            title = await page.$eval('h1', el => el.innerText.trim());
        } catch (e) {
            // console.log('   -> Title not found');
        }

        // Image
        let image = '';
        try {
            image = await page.$eval('meta[property="og:image"]', el => el.content);
        } catch (e) { }

        // Ingredients
        // 1. Click button if exists
        try {
            const btnSelector = 'button[aria-label="show transcript"], button.product-ingredients__toggle';
            if (await page.$(btnSelector)) {
                await page.click(btnSelector);
                await delay(500); // Wait for transition
            } else {
                // Try searching by text
                const clicked = await page.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const target = btns.find(b => b.textContent && (b.textContent.includes('TÜM ÜRÜN İÇERİKLERİNİ') || b.textContent.includes('İÇİNDEKİLER')));
                    if (target) {
                        target.click();
                        return true;
                    }
                    return false;
                });
                if (clicked) await delay(500);
            }
        } catch (e) { }

        // 2. Extract text
        let ingredients = await page.evaluate(() => {
            // Try data-ioplist
            let text = '';
            const iop = document.querySelector('div[data-ioplist]');
            if (iop) text = iop.innerText;

            if (!text || text.length < 10) {
                // Fallback
                const divs = Array.from(document.querySelectorAll('div, p'));
                for (const div of divs) {
                    const t = div.innerText || '';
                    if ((t.includes('AQUA') || t.includes('WATER')) && t.length > 20 && t.length < 3000) {
                        // Likely candidate
                        // Prefer one that lists chemicals
                        if (t.includes(',')) {
                            text = t;
                            break;
                        }
                    }
                }
            }
            return text || '';
        });

        // Cleanup
        ingredients = ingredients
            .replace(/İçindekiler/gi, '')
            .replace(/TÜM ÜRÜN İÇERİKLERİNİ GÖRÜNTÜLE/gi, '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!title || !ingredients || ingredients.length < 20) return null;

        return {
            id: 'lrp-' + Math.random().toString(36).substr(2, 9),
            brand: 'La Roche Posay',
            name: title,
            url: productUrl,
            image: image,
            ingredients: ingredients,
            price: 0
        };

    } catch (err) {
        // console.error(`[Scraper] Product Error: ${err.message}`);
        return null;
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('--- LRP SCRAPER (PUPPETEER) STARTED ---');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        let allLinks = new Set();
        for (const cat of CATEGORY_URLS) {
            const links = await scrapeCategory(browser, cat);
            links.forEach(l => allLinks.add(l));
        }

        const unique = [...allLinks];
        console.log(`\n[Scraper] Total unique links: ${unique.length}`);

        const products = [];
        for (const [i, link] of unique.entries()) {
            // console.log(`[${i+1}/${unique.length}] ${link}`);
            process.stdout.write(`[${i + 1}/${unique.length}] `);

            const p = await scrapeProduct(browser, link);
            if (p) {
                products.push(p);
                console.log(`Success: ${p.name}`);
            } else {
                console.log(`Skipped`);
            }
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
        console.log(`\n[Scraper] Saved ${products.length} products.`);
    } finally {
        await browser.close();
    }
}

main();
