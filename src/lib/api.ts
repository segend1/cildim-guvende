
import products from './product_data.json';
import { Product as ScrapedProduct } from './types';

// Adapter to match existing UI interface if needed, or update types.
// For now, let's map the ScrapedProduct to the App's Product interface.

export interface Product {
    code: string;
    product_name: string;
    brands: string;
    image_url?: string;
    ingredients_text?: string;
    categories?: string; // Added to match UI expectation
}

// Helper type to handle raw JSON variance
interface RawProduct extends ScrapedProduct {
    title?: string;
    category?: string;
}

export async function searchProducts(query: string): Promise<Product[]> {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();

    const results = (products as RawProduct[])
        .filter(p => {
            const name = p.name || p.title || '';
            const brand = p.brand || '';
            return name.toLowerCase().includes(lowerQuery) ||
                brand.toLowerCase().includes(lowerQuery);
        })
        .map(p => ({
            code: p.id,
            product_name: p.name || p.title || 'Unknown Product',
            brands: p.brand,
            image_url: p.image,
            ingredients_text: p.ingredients,
            categories: 'Cosmetics'
        }));

    return results;
}

export async function getProduct(code: string): Promise<Product | null> {
    const found = (products as RawProduct[]).find(p => p.id === code);

    if (found) {
        return {
            code: found.id,
            product_name: found.name || found.title || 'Unknown Product',
            brands: found.brand,
            image_url: found.image,
            ingredients_text: found.ingredients,
            categories: 'Cosmetics'
        };
    }

    return null;
}

export async function getBrands(): Promise<string[]> {
    const brandSet = new Set<string>();
    (products as RawProduct[]).forEach(p => {
        if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet).sort();
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
    const results = (products as RawProduct[])
        .filter(p => p.brand && p.brand.toLowerCase() === brand.toLowerCase())
        .map(p => ({
            code: p.id,
            product_name: p.name || p.title || 'Unknown Product',
            brands: p.brand,
            image_url: p.image,
            ingredients_text: p.ingredients,
            categories: 'Cosmetics'
        }));
    return results;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
    const results = (products as RawProduct[])
        .filter(p => p.category && p.category === category)
        .map(p => ({
            code: p.id,
            product_name: p.name || p.title || 'Unknown Product',
            brands: p.brand,
            image_url: p.image,
            ingredients_text: p.ingredients,
            categories: 'Cosmetics'
        }));
    return results;
}

export async function getCategories(): Promise<{ id: string, name: string, count: number }[]> {
    const categoryMap = new Map<string, { name: string, count: number }>();

    const categoryNames: { [key: string]: string } = {
        'sun-care': 'Güneş Koruyucu',
        'face-care': 'Yüz Bakımı',
        'body-care': 'Vücut Bakımı',
        'cleanser': 'Temizleyici',
        'deodorant': 'Deodorant',
        'acne-care': 'Sivilce Bakımı',
        'eye-care': 'Göz Bakımı',
        'hand-care': 'El Bakımı',
        'serum': 'Serum',
        'other': 'Diğer'
    };

    (products as RawProduct[]).forEach(p => {
        if (p.category) {
            const existing = categoryMap.get(p.category);
            if (existing) {
                existing.count++;
            } else {
                categoryMap.set(p.category, {
                    name: categoryNames[p.category] || p.category,
                    count: 1
                });
            }
        }
    });

    return Array.from(categoryMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count);
}

