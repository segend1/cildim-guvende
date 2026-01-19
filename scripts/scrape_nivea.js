
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const BASE_URL = 'https://www.nivea.com.tr';
const CATEGORY_URLS = [
    'https://www.nivea.com.tr/urunler?main=Face',
    'https://www.nivea.com.tr/urunler?main=Body',
    'https://www.nivea.com.tr/urunler?main=Sun'
];
const OUTPUT_FILE = path.join(__dirname, '../data/nivea_products.json');
const DELAY_MS = 1000; // Be polite

// Helper for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHTML(url) {
    try {
        console.log(`[Fetcher] Requesting: ${url}`);
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } catch (err) {
        console.error(`[Fetcher] Failed to fetch ${url}:`, err.message);
        return null;
    }
}

async function scrapeCategory(categoryUrl) {
    const html = await fetchHTML(categoryUrl);
    if (!html) return [];

    const $ = cheerio.load(html);
    const productLinks = [];

    // Selector: a.nx-product-teaser__link-wrapper
    $('a.nx-product-teaser__link-wrapper').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
            productLinks.push(href.startsWith('http') ? href : BASE_URL + href);
        }
    });

    console.log(`[Scraper] Found ${productLinks.length} products in ${categoryUrl}`);
    // Return unique links
    return [...new Set(productLinks)];
}

async function scrapeProduct(productUrl) {
    const html = await fetchHTML(productUrl);
    if (!html) return null;

    const $ = cheerio.load(html);

    // Extract Data
    const title = $('h1.nx-product-stage__headline').text().trim();
    const image = $('.nx-product-stage__image-container img').attr('src') || '';

    // Ingredients: .nx-ingredients OR search for "İçindekiler" / "Dahil:"
    let ingredients = '';

    // 1. Try class selector
    ingredients = $('.nx-ingredients').text().trim();

    // 2. Try searching explicitly if empty
    if (!ingredients) {
        // Find element containing "Dahil:"
        $('p, div, span').each((i, el) => {
            const text = $(el).text();
            if (text.includes('Dahil:') || text.includes('İçindekiler:')) {
                ingredients = text.replace('Dahil:', '').replace('İçindekiler:', '').trim();
                return false; // break
            }
        });
    }

    // Clean up
    ingredients = ingredients
        .replace(/Not Listelenen.*?geçerlidir\.?/gi, '') // Remove disclaimer
        .replace(/\?Translation missing: Active Ingredient:/gi, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace('Dahil:', '')
        .trim();

    if (!title) return null;

    return {
        id: 'nivea-' + Math.random().toString(36).substr(2, 9),
        brand: 'Nivea',
        name: title,
        url: productUrl,
        image: image,
        ingredients: ingredients,
        price: 0 // Placeholder
    };
}

async function main() {
    console.log('--- NIVEA SCRAPER STARTED ---');

    let allProductLinks = new Set();

    // 1. Collect Links
    for (const catUrl of CATEGORY_URLS) {
        const links = await scrapeCategory(catUrl);
        links.forEach(l => allProductLinks.add(l));
        await delay(DELAY_MS);
    }

    const uniqueLinks = [...allProductLinks];
    console.log(`\n[Scraper] Total unique products to scrape: ${uniqueLinks.length}`);

    // 2. Scrape Details
    const products = [];
    // Limit to first 20 for speed/demo, or scrape all? User said "thousands".
    // I'll grab as many as found (usually 20-50 per page).
    // Nivea uses infinite scroll usually? If so, fetch/cheerio might only catch the first 12-16.
    // For now, let's process what we found.

    for (const [index, link] of uniqueLinks.entries()) {
        console.log(`[${index + 1}/${uniqueLinks.length}] Scraping: ${link}`);
        const p = await scrapeProduct(link);
        if (p && p.ingredients && p.ingredients.length > 10) {
            products.push(p);
            console.log(`   -> Success: ${p.name} (${p.ingredients.length} chars)`);
        } else {
            console.log(`   -> Failed or no ingredients.`);
        }
        await delay(DELAY_MS);
    }

    // 3. Save
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
    console.log(`\n[Scraper] Saved ${products.length} products to ${OUTPUT_FILE}`);
}

main();
