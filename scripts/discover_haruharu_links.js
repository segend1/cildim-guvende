const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = 'https://haruharuwonder.com/collections/all';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Handle pagination? For now, let's just grab all product links on the page.
    // The links are usually in <a> tags within product cards.
    // I'll grab all links that look like /products/...

    // Auto-scroll to load lazy images/content if needed, though for links it might not be strictly necessary if they are in DOM.
    // But sometimes infinite scroll is used.
    // I'll assume standard pagination or load-all might be needed. 
    // For a first pass, I'll just scrape the current page.

    const links = await page.$$eval('a', els => els.map(a => a.href));

    const productLinks = [...new Set(links)].filter(l =>
        l.includes('/products/') &&
        !l.includes('facebook') &&
        !l.includes('instagram') &&
        !l.includes('youtube') &&
        !l.includes('twitter') &&
        !l.includes('pinterest')
    );

    console.log(`Found ${productLinks.length} product links.`);

    const fs = require('fs');
    const path = require('path');
    const OUT_FILE = path.join(__dirname, '../data/haruharu_urls.txt');
    fs.writeFileSync(OUT_FILE, productLinks.join('\n'));
    console.log(`Saved to ${OUT_FILE}`);

    await browser.close();
})();
