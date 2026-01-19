const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const url = 'https://www.eau-thermale-avene.com.tr/';

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scrape navigation links from header
    const links = await page.$$eval('nav a, header a', els => els.map(a => ({ href: a.href, text: a.innerText })));

    const categories = links.filter(l =>
        l.href.includes('avene.com.tr/') &&
        (l.href.includes('yuz') || l.href.includes('vucut') || l.href.includes('gunes') || l.href.includes('bebek') || l.href.includes('erkek'))
    );

    console.log(`Found ${categories.length} potential categories.`);
    console.log(JSON.stringify(categories, null, 2));

    await browser.close();
})();
