const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/dermokil_urls.txt');

(async () => {
    // Launch browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Shopify stores usually support pagination via ?page=2
    // Strategy: Loop until no products are found.
    const baseUrl = 'https://dermokil.com/collections/all';
    let productLinks = new Set();
    let pageNum = 1;
    let hasNextPage = true;

    console.log(`Starting discovery on ${baseUrl}`);

    while (hasNextPage) {
        const url = `${baseUrl}?page=${pageNum}`;
        console.log(`Navigating to ${url}...`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait a bit for everything to settle
            await new Promise(r => setTimeout(r, 2000));

            // Select product links. 
            // In Shopify, usually /products/something
            const links = await page.$$eval('a', els => els.map(a => a.href));

            const newLinks = links.filter(l =>
                l.includes('/products/') &&
                !l.includes('#') &&
                !l.includes('?variant=') // Remove specific variants if possible to avoid dupes early
            );

            if (newLinks.length === 0) {
                console.log('No product links found on this page. Stopping.');
                hasNextPage = false;
                break;
            }

            // Check if we actually added anything new. 
            // If the site redirects ?page=999 to homepage or last page, we might get loops.
            // Or if page is empty.
            let addedCount = 0;
            newLinks.forEach(l => {
                // Remove query params for uniqueness
                const cleanUrl = l.split('?')[0];
                if (!productLinks.has(cleanUrl)) {
                    productLinks.add(cleanUrl);
                    addedCount++;
                }
            });

            console.log(`Found ${newLinks.length} links (${addedCount} new). Total unique: ${productLinks.size}`);

            if (addedCount === 0 && productLinks.size > 0) {
                console.log('No new unique links found. Assuming end of pagination.');
                hasNextPage = false;
            } else {
                pageNum++;
            }

            // Safety break
            if (pageNum > 50) {
                console.log('Hit safety limit of 50 pages.');
                hasNextPage = false;
            }

        } catch (e) {
            console.error(`Error on page ${pageNum}:`, e.message);
            hasNextPage = false;
        }
    }

    const finalLinks = Array.from(productLinks);
    fs.writeFileSync(OUTPUT_FILE, finalLinks.join('\n'));
    console.log(`Saved ${finalLinks.length} URLs to ${OUTPUT_FILE}`);

    await browser.close();
})();
