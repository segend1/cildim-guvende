const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/snp_urls.txt');
const BASE_URL = 'https://snpbeauty.com/product/list.html?cate_no=296'; // Shop All

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    let allLinks = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const url = `${BASE_URL}&page=${currentPage}`;
        console.log(`Scanning Page ${currentPage}: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

            // Extract links
            // Selector from subagent: ul.rn_prd_list > li .name a
            const links = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('ul.rn_prd_list > li .name a'));
                return anchors.map(a => a.href)
                    .filter(href => href.includes('/product/detail.html'));
            });

            if (links.length === 0) {
                console.log('No products found on this page. Stopping.');
                hasNextPage = false;
            } else {
                console.log(`  Found ${links.length} products.`);
                allLinks.push(...links);
                currentPage++;

                // Safety limit
                if (currentPage > 20) hasNextPage = false;
            }
        } catch (e) {
            console.log('Error scanning page:', e.message);
            hasNextPage = false;
        }
    }

    const uniqueLinks = [...new Set(allLinks)];
    console.log(`Total Unique Products: ${uniqueLinks.length}`);

    fs.writeFileSync(OUTPUT_FILE, uniqueLinks.join('\n'));
    await browser.close();
})();
