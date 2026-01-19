const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

class BaseScraper {
    constructor(brandName) {
        this.brandName = brandName;
        this.agent = new https.Agent({ rejectUnauthorized: false });
        this.products = [];
        this.rawDataPath = path.join(__dirname, '..', '..', 'data', 'raw', `${brandName}_raw.json`);
    }

    async fetchHtml(url) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
                agent: this.agent
            }, (res) => {
                let data = '';
                // Follow redirects
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    let loc = res.headers.location;
                    if (!loc.startsWith('http')) {
                        const baseUrl = new URL(url).origin;
                        loc = baseUrl + (loc.startsWith('/') ? '' : '/') + loc;
                    }
                    console.log(`[${this.brandName}] Redirecting to ${loc}`);
                    resolve(this.fetchHtml(loc));
                    return;
                }
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
        });
    }

    loadHtml(html) {
        return cheerio.load(html);
    }

    saveRawData() {
        fs.writeFileSync(this.rawDataPath, JSON.stringify(this.products, null, 2));
        console.log(`[${this.brandName}] Saved ${this.products.length} items to ${this.rawDataPath}`);
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = BaseScraper;
