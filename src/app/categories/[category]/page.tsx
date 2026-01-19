import { getProductsByCategory, getCategories } from '@/lib/api';
import { analyzeProductIngredients } from '@/lib/safety';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, AlertTriangle, AlertOctagon, Leaf } from 'lucide-react';

interface CategoryPageProps {
    params: Promise<{
        category: string;
    }>;
}

export async function generateStaticParams() {
    const categories = await getCategories();
    return categories.map((cat) => ({
        category: cat.id,
    }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params;
    const products = await getProductsByCategory(category);
    const categories = await getCategories();

    const currentCategory = categories.find(c => c.id === category);
    const categoryName = currentCategory?.name || category;

    // Analyze all products
    const productsWithAnalysis = products.map(product => {
        const analysis = product.ingredients_text
            ? analyzeProductIngredients(product.ingredients_text)
            : null;
        return { ...product, analysis };
    });

    return (
        <div className="container py-6 lg:py-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
                <div className="flex-1 space-y-4">
                    <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
                        {categoryName}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {products.length} ürün bulundu
                    </p>
                </div>
            </div>
            <hr className="my-8" />

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-muted-foreground">Bu kategoride henüz ürün bulunmamaktadır.</p>
                    <Link
                        href="/"
                        className="mt-4 text-primary hover:underline"
                    >
                        Ana sayfaya dön
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {productsWithAnalysis.map((product) => {
                        const riskColor = product.analysis?.totalRisk === 'high' ? 'bg-red-500' :
                            product.analysis?.totalRisk === 'moderate' ? 'bg-yellow-500' : 'bg-green-500';

                        const riskText = product.analysis?.totalRisk === 'high' ? 'Düşük Puan' :
                            product.analysis?.totalRisk === 'moderate' ? 'Orta Puan' : 'Yüksek Puan';

                        const RiskIcon = product.analysis?.totalRisk === 'high' ? AlertOctagon :
                            product.analysis?.totalRisk === 'moderate' ? AlertTriangle : ShieldCheck;

                        return (
                            <Link
                                key={product.code}
                                href={`/product/${product.code}`}
                                className="group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="relative aspect-square overflow-hidden bg-muted">
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.product_name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-muted">
                                            <span className="text-muted-foreground">Resim yok</span>
                                        </div>
                                    )}

                                    {/* Rating Badges */}
                                    {product.analysis && (
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {/* Risk Badge */}
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${riskColor} text-white text-xs font-bold shadow-md`}>
                                                <RiskIcon className="w-3 h-3" />
                                                <span>{riskText}</span>
                                            </div>

                                            {/* Natural Score Badge */}
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-600 text-white text-xs font-bold shadow-md">
                                                <Leaf className="w-3 h-3" />
                                                <span>%{product.analysis.naturalScore} Doğal</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold line-clamp-2 mb-1">
                                        {product.product_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {product.brands}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
