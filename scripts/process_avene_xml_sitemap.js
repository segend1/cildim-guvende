const https = require('https');
const fs = require('fs');
const path = require('path');

const SITEMAP_URL = 'https://www.eau-thermale-avene.com.tr/sitemap.xml';
const OUTPUT_FILE = path.join(__dirname, '../data/avene_urls.txt');

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        });
    });
}

(async () => {
    try {
        console.log(`Fetching ${SITEMAP_URL}...`);
        const xml = await fetch(SITEMAP_URL);

        // Simple regex parse for <loc>
        const locs = [];
        const regex = /<loc>(.*?)<\/loc>/g;
        let match;
        while ((match = regex.exec(xml)) !== null) {
            locs.push(match[1]);
        }

        console.log(`Found ${locs.length} URLs in sitemap.`);
        console.log(locs.join('\n'));

        // If these are sub-sitemaps, fetch them
        let allLocs = [];
        for (const loc of locs) {
            if (loc.endsWith('.xml')) {
                console.log(`Fetching sub-sitemap ${loc}...`);
                const subXml = await fetch(loc);
                let subMatch;
                // Reset regex lastIndex for new string
                regex.lastIndex = 0;
                while ((subMatch = regex.exec(subXml)) !== null) {
                    allLocs.push(subMatch[1]);
                }
            } else {
                allLocs.push(loc);
            }
        }

        console.log(`Total URLs found: ${allLocs.length}`);

        // Filter for products
        const products = allLocs.filter(l => l.includes('/p/'));
        console.log(`Filtered ${products.length} product URLs (/p/).`);

        fs.writeFileSync(OUTPUT_FILE, products.join('\n'));
        console.log(`Saved to ${OUTPUT_FILE}`);

    } catch (e) {
        console.error(e);
    }
})();
