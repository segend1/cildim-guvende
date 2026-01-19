const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const url = 'https://www.cerave.com.tr/cilt-bakimi'; // Main hub

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Get all links that look like sub-categories
    const links = await page.$$eval('a', els => els.map(a => a.href));

    const categoryLinks = [...new Set(links)].filter(l =>
        l.includes('cerave.com.tr/cilt-bakimi/') &&
        !l.includes('facebook') &&
        !l.includes('instagram') &&
        !l.includes('youtube') &&
        l !== url // key point: sub-pages
    );

    console.log(`Found ${categoryLinks.length} potential category/product links.`);
    console.log(categoryLinks.join('\n'));

    await browser.close();
})();
