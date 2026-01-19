const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const URLS_FILE = path.join(__dirname, '../data/avene_urls.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/avene_products.json');

async function getProductLinks() {
    console.log('[Discovery] Reading URLs from file...');
    try {
        const content = fs.readFileSync(URLS_FILE, 'utf8');
        return content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    } catch (e) {
        console.error('Could not read URLs file', e);
        return [];
    }
}

async function scrapeProduct(page, url) {
    console.log(`[Product] Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // wait a bit for dynamic content
        await new Promise(r => setTimeout(r, 2000));

        // 1. Title
        const title = await page.$eval('h1', el => el.innerText.trim()).catch(() => 'Unknown Product');

        // 2. Image
        const image = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => '');

        // 3. Ingredients
        let ingredients = '';

        // Strategy: Find the accordion button by text, click it, then extract text from the specific expanded area or by proximity.

        // 0. Close Modals & Cookies (CRITICAL)
        try {
            // Immersive modal
            const modalClose = await page.$('.c-immersive-modal__close');
            if (modalClose) {
                console.log('[Product] Closing immersive modal...');
                await modalClose.click();
                await new Promise(r => setTimeout(r, 1000));
            }

            // Cookie Banner (TAMAM)
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const tamam = buttons.find(b => b.innerText.trim().toUpperCase() === 'TAMAM');
                if (tamam) tamam.click();
            });
            await new Promise(r => setTimeout(r, 1000));

        } catch (e) { }

        // Find trigger
        try {
            // 1. Try ID selector (Most reliable)
            let trigger = await page.$('#composition_inci-trigger');

            // 2. Fallback to text search
            if (!trigger) {
                trigger = await page.evaluateHandle(() => {
                    const buttons = Array.from(document.querySelectorAll('button, div, h3, span'));
                    return buttons.find(el => el.innerText && (
                        el.innerText.includes('Bileşenlerin detayları') ||
                        el.innerText.includes('BİLEŞENLERİN DETAYLARI')
                    ));
                });
            }

            if (trigger) {
                console.log('[Product] Found trigger, clicking...');
                await trigger.click();
                await new Promise(r => setTimeout(r, 2000)); // Wait for animation

                // Scan all text in the body or near the trigger for chemical-like patterns
                ingredients = await page.evaluate((trigger) => {
                    // 1. Look in the ID content container (TRUST THIS 100%)
                    const idPanel = document.getElementById('composition_inci');
                    if (idPanel && idPanel.innerText.length > 10) {
                        return idPanel.innerText;
                    }

                    // 2. Look in the expanded accordion content (Class based)
                    const candidates = [];
                    const panels = Array.from(document.querySelectorAll('.is-open, .c-accordion__content, [aria-hidden="false"]'));
                    panels.forEach(p => candidates.push(p.innerText));

                    // 3. Look specifically at ALL Paragraphs
                    const paragraphs = Array.from(document.querySelectorAll('p'));
                    paragraphs.forEach(p => candidates.push(p.innerText));

                    // Filter for likely Ingredient Lists
                    for (const text of candidates) {
                        if (!text) continue;

                        // Check for chemical markers
                        if (text.includes('WATER') || text.includes('AQUA') || text.includes('GLYCERIN')) {
                            const separatorCount = (text.match(/[.,]/g) || []).length;
                            const upperCount = (text.match(/[A-Z]/g) || []).length;

                            if (separatorCount > 2 && upperCount > 10) {
                                const match = text.match(/(AVENE THERMAL SPRING WATER|AVENE AQUA|WATER|AQUA).*/s);
                                if (match) {
                                    let clean = match[0];
                                    const endMarkers = ['\n\n', 'Tavsiye', 'Yasal', 'BÜLTENE'];
                                    for (const m of endMarkers) {
                                        if (clean.includes(m)) clean = clean.split(m)[0];
                                    }
                                    return clean;
                                }
                                return text;
                            }
                        }
                    }
                    return '';
                }, trigger);
            }
        } catch (e) {
            console.log('[Product] Extraction failed:', e.message);
        }

        // Final cleanup
        if (ingredients) {
            ingredients = ingredients.replace('Bileşenlerin detayları', '').trim();
            if (ingredients.includes('BÜLTENE ABONE OLUN')) ingredients = ingredients.split('BÜLTENE ABONE OLUN')[0];
            if (ingredients.includes('Yasal uyarılar')) ingredients = ingredients.split('Yasal uyarılar')[0];
            if (ingredients.includes('Tavsiye')) ingredients = ingredients.split('Tavsiye')[0];
            if (ingredients.length > 5000) ingredients = ingredients.substring(0, 5000); // Sanity cap

            // NORMALIZE SEPARATORS: Replace ". " with ", "
            // Also handle newlines as separators
            ingredients = ingredients.replace(/\. /g, ', ')
                .replace(/\.\n/g, ', ')
                .replace(/\n/g, ', ')
                .replace(/\.$/, '') // Remove trailing dot
                .replace(/, ,/g, ', '); // Cleanup double commas
        }

        const product = {
            url,
            title,
            image,
            ingredients: (ingredients || '').trim(),
            brand: 'Avene'
        };

        if (product.ingredients.length > 20 && (product.ingredients.includes('WATER') || product.ingredients.includes('AQUA'))) {
            console.log(`[Product] Success: ${title} (${product.ingredients.length} chars})`);
            return product;
        } else {
            console.log(`[Product] No VALID ingredients found for ${title} (Found ${ingredients.length} chars but rejected)`);
            return null;
        }
    } catch (e) {
        console.error(`[Product] Error scraping ${url}:`, e.message);
        return null;
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Set UA
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Discover
    const links = await getProductLinks();

    // 2. Scrape
    let allProducts = [];

    // Process ALL links
    for (let i = 0; i < links.length; i++) {
        const p = await scrapeProduct(page, links[i]);
        if (p) allProducts.push(p);

        // Save intermittently
        if (i % 5 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`[Main] Done. Total: ${allProducts.length}`);
    await browser.close();
})();
