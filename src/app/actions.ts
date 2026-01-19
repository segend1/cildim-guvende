'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const PRODUCTS_FILE = path.join(process.cwd(), 'src/lib/product_data.json');
const SCORES_FILE = path.join(process.cwd(), 'data/scored_ingredients.csv');

// Helper to parse CSV (same as apply_scores.js)
function parseCSV(csvText: string) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    const data: any[] = [];
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
                    j++;
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
        fields.push(currentField);
        if (fields.length >= 3) {
            data.push({ name: fields[0], count: fields[1], score: fields[2] });
        }
    }
    return data;
}

import { isLoggedIn } from './admin/login/auth';

export async function updateProduct(id: string, formData: { name: string, brand: string, image: string, ingredients: string }) {
    if (!(await isLoggedIn())) {
        throw new Error('Unauthorized');
    }

    console.log(`Updating product ${id}...`);

    // 1. Load Data
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const productIndex = products.findIndex((p: any) => p.id === id);

    if (productIndex === -1) {
        throw new Error('Product not found');
    }

    // 2. Load Scores
    const csvContent = fs.readFileSync(SCORES_FILE, 'utf8');
    const scoredList = parseCSV(csvContent);
    const scoreMap = new Map();
    scoredList.forEach(item => {
        if (item.score !== '*') {
            scoreMap.set(item.name.toLowerCase().trim(), parseInt(item.score));
        }
    });

    // 3. Process Ingredients
    const rawIngredients = formData.ingredients.split(',').map(s => s.trim()).filter(s => s);
    let totalScore = 0;
    let scoredCount = 0;
    let minScore = 10;
    let maxScore = 0;
    let unknownCount = 0;
    let naturalCount = 0;

    const detailedIngredients = rawIngredients.map(ing => {
        const cleanKey = ing.toLowerCase().trim().replace(/\([^\)]+\)/g, '').trim();
        let score = scoreMap.get(cleanKey);
        if (score === undefined) score = scoreMap.get(ing.toLowerCase().trim());

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

    if (scoredCount === 0) { minScore = 0; maxScore = 0; }
    const avgScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : 0;
    const naturalnessRatio = scoredCount > 0 ? Math.round((naturalCount / scoredCount) * 100) : 0;

    // 4. Update Product
    products[productIndex] = {
        ...products[productIndex],
        name: formData.name,
        // Also update title if it exists, to match name
        title: formData.name,
        brand: formData.brand,
        image: formData.image,
        image_url: formData.image, // Ensure compatibility
        ingredients: formData.ingredients,
        analysis: {
            total_ingredients: rawIngredients.length,
            scored_ingredients: scoredCount,
            unknown_ingredients: unknownCount,
            min_score: minScore,
            max_score: maxScore,
            avg_score: parseFloat(avgScore as string),
            naturalness_ratio: naturalnessRatio,
            detailed_ingredients: detailedIngredients
        },
        source: 'manual_edit'
    };

    // 5. Save
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

    // 6. Revalidate
    revalidatePath(`/product/${id}`);
    revalidatePath(`/products`);

    return { success: true };
}

export async function patchProduct(id: string, field: string, value: string) {
    if (!(await isLoggedIn())) {
        throw new Error('Unauthorized');
    }

    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const productIndex = products.findIndex((p: any) => p.id === id);

    if (productIndex === -1) throw new Error('Product not found');

    const product = products[productIndex];
    let updates: any = { [field]: value };

    // Special logic for Name change (update both name and title)
    if (field === 'name') {
        updates.title = value;
    }

    // Special logic for Ingredients re-scoring
    if (field === 'ingredients') {
        const csvContent = fs.readFileSync(SCORES_FILE, 'utf8');
        const scoredList = parseCSV(csvContent);
        const scoreMap = new Map();
        scoredList.forEach(item => {
            if (item.score !== '*') scoreMap.set(item.name.toLowerCase().trim(), parseInt(item.score));
        });

        const rawIngredients = value.split(',').map(s => s.trim()).filter(s => s);
        let totalScore = 0;
        let scoredCount = 0;
        let minScore = 10;
        let maxScore = 0;
        let unknownCount = 0;
        let naturalCount = 0;

        const detailedIngredients = rawIngredients.map(ing => {
            const cleanKey = ing.toLowerCase().trim().replace(/\([^\)]+\)/g, '').trim();
            let score = scoreMap.get(cleanKey) ?? scoreMap.get(ing.toLowerCase().trim());

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

        if (scoredCount === 0) { minScore = 0; maxScore = 0; }
        const avgScore = scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : 0;
        const naturalnessRatio = scoredCount > 0 ? Math.round((naturalCount / scoredCount) * 100) : 0;

        updates.analysis = {
            total_ingredients: rawIngredients.length,
            scored_ingredients: scoredCount,
            unknown_ingredients: unknownCount,
            min_score: minScore,
            max_score: maxScore,
            avg_score: parseFloat(avgScore as string),
            naturalness_ratio: naturalnessRatio,
            detailed_ingredients: detailedIngredients
        };
    }

    products[productIndex] = { ...product, ...updates, source: 'manual_edit' };
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

    revalidatePath(`/product/${id}`);
    revalidatePath(`/products`);

    return { success: true, product: products[productIndex] };
}
