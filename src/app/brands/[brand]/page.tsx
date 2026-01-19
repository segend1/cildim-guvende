'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProductsByBrand, type Product } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function BrandDetailPage() {
    const params = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const brandName = decodeURIComponent(params.brand as string);

    useEffect(() => {
        async function loadProducts() {
            if (brandName) {
                const data = await getProductsByBrand(brandName);
                setProducts(data);
            }
            setLoading(false);
        }
        loadProducts();
    }, [brandName]);

    return (
        <div className="container py-8 max-w-screen-2xl space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/brands" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold capitalize">{brandName}</h1>
                    <p className="text-muted-foreground">{products.length} ürün bulundu</p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4">
                    {products.map((product) => (
                        <Link
                            key={product.code}
                            href={`/product/${product.code}`}
                            className="group block p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.product_name} className="w-16 h-16 object-contain rounded-md bg-white p-1" />
                                ) : (
                                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">Resim Yok</div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">{product.product_name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{product.brands}</span>
                                        {product.categories && (
                                            <>
                                                <span>•</span>
                                                <span>{product.categories}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {products.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            Bu markaya ait ürün bulunamadı.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
