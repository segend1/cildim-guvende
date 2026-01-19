const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const INPUT_FILE = path.join(__dirname, '../ingredients_neutrogena.txt');
const OUTPUT_FILE = path.join(__dirname, '../../data', 'ingredients.json');

async function fetchIngredientData(name) {
    console.log(`[Fetcher] Analyzing: ${name}...`);

    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // Mock Logic for Demo Purposes - Expanded for Neutrogena context
    let risk_score = 0;
    let analysis = "Otomatik analiz verisi.";
    let tags = [];

    const lower = name.toLowerCase();

    if (lower.includes('sulfate') || lower.includes('paraben') || lower.includes('bht') || lower.includes('edta')) {
        risk_score = 7;
        analysis = "Potansiyel irritan veya tartışmalı bileşen.";
        tags = ["riskli", "dikkat"];
    } else if (lower.includes('retinol')) {
        risk_score = 5;
        analysis = "Güçlü aktif bileşen. Güneş hassasiyeti yaratabilir. Hamilelikte dikkat.";
        tags = ["aktif", "dikkat", "anti-aging"];
    } else if (lower.includes('fragrance') || lower.includes('parfum')) {
        risk_score = 6;
        analysis = "Hassas ciltlerde alerji riski.";
        tags = ["alerjen"];
    } else if (lower.includes('aqua') || lower.includes('extract') || lower.includes('glycerin') || lower.includes('oil')) {
        risk_score = 0;
        analysis = "Güvenli, nemlendirici veya doğal bileşen.";
        tags = ["doğal", "güvenli"];
    } else {
        risk_score = 2;
        analysis = "Genel kozmetik bileşen. Bilinen major risk yok.";
        tags = ["genel"];
    }

    return {
        id: `ING_${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        category: "Unknown",
        risk_score: risk_score,
        benefit_score: 0,
        comedogenic_rating: 0,
        source: "Simulation (User Script Port)",
        analysis: analysis,
        is_vegan: true,
        tags: tags
    };
}

async function main() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Input file not found: ${INPUT_FILE}`);
        return;
    }

    const targets = fs.readFileSync(INPUT_FILE, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    console.log(`[Fetcher] Found ${targets.length} target ingredients.`);

    // Load existing DB
    let database = [];
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            database = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
            console.log(`[Fetcher] Loaded ${database.length} existing ingredients.`);
        } catch (e) {
            console.error("Error reading existing DB, starting fresh.");
        }
    }

    let addedCount = 0;
    for (const target of targets) {
        // Check duplication (Case insensitive)
        if (database.some(item => item.name.toLowerCase() === target.toLowerCase())) {
            // console.log(`[Fetcher] Skipping known ingredient: ${target}`);
            continue;
        }

        try {
            const data = await fetchIngredientData(target);
            database.push(data);
            addedCount++;
        } catch (error) {
            console.error(`Error fetching ${target}:`, error);
        }
    }

    // Save to the master ingredients file which safety.ts reads
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));

    // Also deploy to src/lib for the app to pick up immediately (Standard Architecture rule)
    const APP_LIB_FILE = path.join(__dirname, '..', '..', 'src', 'lib', 'ingredients.json');
    fs.writeFileSync(APP_LIB_FILE, JSON.stringify(database, null, 2));

    console.log(`[Fetcher] Complete! Added ${addedCount} new ingredients. Total: ${database.length}`);
}

main();
