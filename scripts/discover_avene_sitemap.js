const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        // Correct Avene sitemap URL
        const url = 'https://www.eau-thermale-avene.com.tr/site-haritasi';

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract all links
        const links = await page.$$eval('a', els => els.map(a => a.href));

        console.log(`Found ${links.length} total links.`);

        // Filter for potential product pages. 
        // User screenshot showed: eau-thermale-avene.com.tr/p/fluid-spf-50-...
        // So /p/ is likely the product identifier.
        const productLinks = [...new Set(links)].filter(l =>
            l.includes('/p/') &&
            !l.includes('facebook') &&
            !l.includes('instagram')
        );

        console.log(`Found ${productLinks.length} product links (containing /p/).`);
        console.log(productLinks.join('\n'));

        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
