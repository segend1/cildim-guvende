const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const url = 'https://www.cerave.com.tr/site-haritasi';

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Use $$eval correctly
        const links = await page.$$eval('a', els => els.map(a => a.href));

        const visibleLinks = [...new Set(links)].filter(l =>
            l.includes('cerave.com.tr/cilt-bakimi/') &&
            !l.includes('facebook') &&
            !l.includes('twitter') &&
            l !== 'https://www.cerave.com.tr/cilt-bakimi'
        );

        console.log(`Found ${visibleLinks.length} links.`);
        console.log(visibleLinks.join('\n'));

        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
