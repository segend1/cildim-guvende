
import { MetadataRoute } from 'next';
// @ts-ignore
import products from '@/lib/product_data.json';

type Product = {
    id: string;
    brand?: string;
    category?: string;
    scraped_at?: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cildimguvende.com';

    // 1. Static Routes
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
    ];

    // 2. Product Routes
    const productRoutes = (products as Product[]).map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.scraped_at ? new Date(product.scraped_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 3. Category Routes
    const categories = new Set<string>();
    (products as Product[]).forEach(p => {
        if (p.category) categories.add(p.category);
    });

    const categoryRoutes = Array.from(categories).map((category) => ({
        url: `${baseUrl}/categories/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. Brand Routes
    const brands = new Set<string>();
    (products as Product[]).forEach(p => {
        if (p.brand) brands.add(p.brand);
    });

    const brandRoutes = Array.from(brands).map((brand) => ({
        url: `${baseUrl}/brands/${encodeURIComponent(brand)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        ...routes,
        ...categoryRoutes,
        ...brandRoutes,
        ...productRoutes,
    ];
}
