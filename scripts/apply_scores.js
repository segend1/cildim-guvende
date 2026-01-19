const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/lib/product_data.json');
const SCORES_FILE = path.join(__dirname, '../data/scored_ingredients.csv');

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    const data = [];

    // Simple state machine for CSV parsing
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        let currentField = '';
        let insideQuote = false;
        const fields = [];

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            const nextChar = line[j + 1];

            if (char === '"') {
                if (insideQuote && nextChar === '"') {
                    currentField += '"';
                    j++; // Skip next quote
                } else {
                    insideQuote = !insideQuote;
                }
            } else if (char === ',' && !insideQuote) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        fields.push(currentField); // Last field

        if (fields.length >= 3) {
            data.push({
                name: fields[0],
                count: fields[1],
                score: fields[2],
                note: fields[3]
            });
        }
    }
    return data;
}

function applyScores() {
    if (!fs.existsSync(PRODUCTS_FILE) || !fs.existsSync(SCORES_FILE)) {
        console.error('Missing input files');
        return;
    }

    console.log('Loading scores...');
    const csvContent = fs.readFileSync(SCORES_FILE, 'utf8');
    const scoredList = parseCSV(csvContent);

    // Create Map for fast lookup: Normalized Name -> Score
    const scoreMap = new Map();
    scoredList.forEach(item => {
        if (item.score !== '*') {
            // Store by normalized key
            scoreMap.set(item.name.toLowerCase().trim(), parseInt(item.score));
        }
    });

    console.log(`Loaded ${scoreMap.size} scored ingredients.`);

    console.log('Processing products...');
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

    let updatedCount = 0;

    const updatedProducts = products.map(product => {
        if (!product.ingredients) {
            return {
                ...product,
                analysis: null
            };
        }

        const rawIngredients = product.ingredients.split(',').map(s => s.trim()).filter(s => s);

        let totalScore = 0;
        let scoredCount = 0;
        let minScore = 10;
        let maxScore = 0;
        let unknownCount = 0;
        let naturalCount = 0; // Scores 1-2

        const detailedIngredients = rawIngredients.map(ing => {
            const cleanKey = ing.toLowerCase().trim()
                .replace(/\([^\)]+\)/g, '')
                .trim();

            let score = scoreMap.get(cleanKey);

            // Try raw if clean fail
            if (score === undefined) {
                score = scoreMap.get(ing.toLowerCase().trim());
            }

            if (score !== undefined) {
                totalScore += score;
                scoredCount++;
                if (score < minScore) minScore = score;
                if (score > maxScore) maxScore = score;
                if (score <= 2) naturalCount++;
                return { name: ing, score: score };
            } else {
                unknownCount++;
                return { name: ing, score: null };
            }
        });

        // If no ingredients scored, reset min/max default
        if (scoredCount === 0) {
            minScore = 0;
            maxScore = 0;
        }

        const avgScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : 0;
        const naturalnessRatio = scoredCount > 0 ? Math.round((naturalCount / scoredCount) * 100) : 0;

        updatedCount++;

        return {
            ...product,
            analysis: {
                total_ingredients: rawIngredients.length,
                scored_ingredients: scoredCount,
                unknown_ingredients: unknownCount,
                min_score: minScore,
                max_score: maxScore,
                avg_score: parseFloat(avgScore),
                naturalness_ratio: naturalnessRatio,
                detailed_ingredients: detailedIngredients
            }
        };
    });

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
    console.log(`Updated ${updatedCount} products. Saved to ${PRODUCTS_FILE}`);
}

applyScores();
