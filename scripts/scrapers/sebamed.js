const BaseScraper = require('../utils/BaseScraper');

class SebamedScraper extends BaseScraper {
    constructor() {
        super('sebamed');
        this.baseUrl = 'https://www.sebamed.com.tr';
        this.startUrls = [
            'https://www.sebamed.com.tr/urunler/kategoriler/gunes-bakimi/yetiskin-gunes-bakimi',
            'https://www.sebamed.com.tr/urunler/kategoriler/yuz-temizleme',
            'https://www.sebamed.com.tr/urunler/kategoriler/yuz-nemlendirme',
            'https://www.sebamed.com.tr/urunler/kategoriler/vucut-bakimi'
        ];
    }

    async scrape() {
        console.log(`[Sebamed] Starting scrape...`);
        const productLinks = new Set();

        // 1. Crawl Categories
        for (const url of this.startUrls) {
            try {
                const html = await this.fetchHtml(url);
                const $ = this.loadHtml(html);

                $('.productteaser-text h2 a').each((i, el) => {
                    let href = $(el).attr('href');
                    if (href) {
                        if (!href.startsWith('http')) href = this.baseUrl + href;
                        productLinks.add(href);
                    }
                });
            } catch (e) {
                console.error(`[Sebamed] Failed category ${url}: ${e.message}`);
            }
        }
        console.log(`[Sebamed] Found ${productLinks.size} products.`);

        // 2. Scrape Details
        for (const link of productLinks) {
            try {
                await this.sleep(500); // Politeness delay
                const html = await this.fetchHtml(link);
                const $ = this.loadHtml(html);

                const name = $('.product-detail-text h1').text().trim();
                let image = $('.product-detail-image img').attr('src');
                if (image && !image.startsWith('http')) image = this.baseUrl + image;

                let ingredients = '';
                $('.product-detail-foldout').each((i, el) => {
                    const header = $(el).find('h1').text().trim();
                    if (/İçerik|İçindekiler|Ingredients/i.test(header)) {
                        ingredients = $(el).find('.product-detail-foldout-content').text().trim().replace(/\s+/g, ' ');
                    }
                });

                if (name) {
                    this.products.push({
                        id: 'sebamed-' + Math.random().toString(36).substr(2, 9),
                        name,
                        brand: 'Sebamed',
                        image,
                        ingredients,
                        url: link,
                        scraped_at: new Date().toISOString(),
                        source: 'official'
                    });
                    console.log(`[Sebamed] Scraped: ${name}`);
                }
            } catch (e) {
                console.error(`[Sebamed] Failed product ${link}: ${e.message}`);
            }
        }

        this.saveRawData();
    }
}

// Run if called directly
if (require.main === module) {
    new SebamedScraper().scrape();
}

module.exports = SebamedScraper;
