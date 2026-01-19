'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBrands } from '@/lib/api';
import { ArrowRight } from 'lucide-react';

export default function BrandsPage() {
    const [brands, setBrands] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBrands() {
            const data = await getBrands();
            setBrands(data);
            setLoading(false);
        }
        loadBrands();
    }, []);

    if (loading) {
        return (
            <div className="container py-8 max-w-screen-2xl">
                <h1 className="text-3xl font-bold mb-8">Markalar</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-24 rounded-lg bg-muted animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-screen-2xl">
            <h1 className="text-3xl font-bold mb-8">Markalar</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.map((brand) => (
                    <Link
                        key={brand}
                        href={`/brands/${encodeURIComponent(brand.toLowerCase())}`}
                        className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-all hover:bg-accent/5"
                    >
                        <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{brand}</h2>
                        <span className="text-sm text-muted-foreground flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Ürünleri Gör <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
