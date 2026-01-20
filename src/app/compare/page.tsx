
'use client';


import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct, searchProducts, getProductsByCategory, categoryNames, Product } from '@/lib/api';
import { analyzeProductIngredients, RiskLevel } from '@/lib/safety';
import { cn } from '@/lib/utils';
import { AlertOctagon, AlertTriangle, ShieldCheck, Plus, X, ArrowRight, Search as SearchIcon } from 'lucide-react';
import Header from '@/components/Header';

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
            <CompareContent />
        </Suspense>
    );
}

function CompareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [p1, setP1] = useState<Product | null>(null);
    const [p2, setP2] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    // ... rest of the component


    // Search state for selecting a product
    const [isSearching, setIsSearching] = useState<'p1' | 'p2' | null>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            const p1Id = searchParams.get('p1');
            const p2Id = searchParams.get('p2');

            if (p1Id) {
                const data = await getProduct(p1Id);
                setP1(data);
            }
            if (p2Id) {
                const data = await getProduct(p2Id);
                setP2(data);
            }
            setLoading(false);
        };
        loadProducts();
    }, [searchParams]);

    // Live search for product selection
    // Live search for product selection
    // Suggestion logic
    useEffect(() => {
        if (!isSearching) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            const otherProduct = isSearching === 'p1' ? p2 : p1;
            if (otherProduct && otherProduct.categoryId) {
                try {
                    const catProducts = await getProductsByCategory(otherProduct.categoryId);
                    const filtered = catProducts.filter(p => p.code !== otherProduct.code).slice(0, 20);
                    setSuggestions(filtered);
                    // If query is empty, allow these to show
                    if (!query) setResults(filtered);
                } catch (e) {
                    console.error("Failed to fetch suggestions", e);
                }
            } else {
                setSuggestions([]);
                if (!query) setResults([]);
            }
        };
        fetchSuggestions();
    }, [isSearching, p1, p2]);

    // Search logic with debounce
    useEffect(() => {
        if (!query) {
            setResults(suggestions);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            const res = await searchProducts(query);
            setResults(res);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [query, suggestions]);

    const handleSelectProduct = (product: Product) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (isSearching === 'p1') {
            newParams.set('p1', product.code);
            setP1(product);
        } else {
            newParams.set('p2', product.code);
            setP2(product);
        }
        router.push(`/compare?${newParams.toString()}`);
        setIsSearching(null);
        setQuery('');
    };

    const removeProduct = (slot: 'p1' | 'p2') => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete(slot);
        if (slot === 'p1') setP1(null); else setP2(null);
        router.push(`/compare?${newParams.toString()}`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header manually included or rely on layout? Layout usually handles it but let's be safe */}
            <div className="pt-24 px-4 pb-12 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Ürün Karşılaştırma</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    {/* Product 1 Slot */}
                    <ProductSlot
                        product={p1}
                        slot="p1"
                        onRemove={() => removeProduct('p1')}
                        onAdd={() => setIsSearching('p1')}
                    />

                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-background border rounded-full shadow-lg font-black text-muted-foreground">
                        VS
                    </div>

                    {/* Product 2 Slot */}
                    <ProductSlot
                        product={p2}
                        slot="p2"
                        onRemove={() => removeProduct('p2')}
                        onAdd={() => setIsSearching('p2')}
                    />
                </div>

                {/* Similarity Analysis */}
                {p1 && p2 && (
                    <ComparisonAnalysis p1={p1} p2={p2} />
                )}

                {isSearching && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
                        <div className="bg-background w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">
                                    {(() => {
                                        const otherProduct = isSearching === 'p1' ? p2 : p1;
                                        if (!query && otherProduct?.categoryId) {
                                            return `Önerilenler: ${categoryNames[otherProduct.categoryId] || otherProduct.categoryId}`;
                                        }
                                        return 'Ürün Seç';
                                    })()}
                                </h3>
                                <button onClick={() => setIsSearching(null)}><X className="w-5 h-5" /></button>
                            </div>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Marka veya ürün adı ara..."
                                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 rounded-xl border-none focus:ring-2 focus:ring-primary/50 outline-none"
                                    autoFocus
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                />
                            </div>
                            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
                                {results.map(prod => (
                                    <button
                                        key={prod.code}
                                        onClick={() => handleSelectProduct(prod)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-md overflow-hidden flex-shrink-0">
                                            {prod.image_url && <img src={prod.image_url} className="w-full h-full object-contain" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm line-clamp-1">{prod.product_name}</div>
                                            <div className="text-xs text-muted-foreground">{prod.brands}</div>
                                        </div>
                                    </button>
                                ))}
                                {query && results.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">Sonuç bulunamadı</div>
                                )}
                                {!query && results.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">Önerilecek ürün bulunamadı. Lütfen arama yapın.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductSlot({ product, slot, onRemove, onAdd }: { product: Product | null, slot: string, onRemove: () => void, onAdd: () => void }) {
    if (!product) {
        return (
            <div className="h-[400px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-secondary/20 transition-colors cursor-pointer" onClick={onAdd}>
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground font-medium">Ürün Ekle</span>
            </div>
        );
    }

    const { totalRisk, healthScore } = product.ingredients_text
        ? analyzeProductIngredients(product.ingredients_text)
        : { totalRisk: 'unknown' as RiskLevel, healthScore: 0 };

    return (
        <div className="glass-card p-6 rounded-3xl relative animate-fade-in-up">
            <button onClick={onRemove} className="absolute top-4 right-4 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center h-full">
                <div className="w-32 h-32 bg-white rounded-xl mb-4 p-2">
                    {product.image_url && <img src={product.image_url} className="w-full h-full object-contain" />}
                </div>

                <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">{product.brands}</div>
                <Link href={`/product/${product.code}`} className="text-lg font-bold hover:underline line-clamp-2 mb-6">
                    {product.product_name}
                </Link>

                <div className="mt-auto flex flex-col items-center w-full">
                    <RiskBadge score={healthScore} risk={totalRisk} />
                </div>
            </div>
        </div>
    );
}

function RiskBadge({ score, risk }: { score: number, risk: RiskLevel }) {
    let colorClass = 'text-gray-500 bg-gray-500/10 border-gray-200';
    let label = 'Bilinmiyor';

    if (risk === 'unknown' && score === 0) {
        // Keep default
    } else if (score >= 80) {
        colorClass = 'text-green-600 bg-green-50 border-green-200';
        label = 'Çok İyi';
    } else if (score >= 50) {
        colorClass = 'text-yellow-600 bg-yellow-50 border-yellow-200';
        label = 'Orta';
    } else {
        colorClass = 'text-red-600 bg-red-50 border-red-200';
        label = 'Düşük';
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center border-4 text-3xl font-bold shadow-sm", colorClass)}>
                {score}
            </div>
            <span className={cn("font-medium text-sm px-3 py-1 rounded-full", colorClass)}>
                {label} ({score}/100)
            </span>
        </div>
    );
}

function ComparisonAnalysis({ p1, p2 }: { p1: Product, p2: Product }) {
    const a1 = p1.ingredients_text ? analyzeProductIngredients(p1.ingredients_text) : null;
    const a2 = p2.ingredients_text ? analyzeProductIngredients(p2.ingredients_text) : null;

    if (!a1 || !a2) return null;

    const score1 = a1.healthScore;
    const score2 = a2.healthScore;

    let winnerText = "İki ürün de benzer Cildim Güvende Puanı'na sahip.";
    let winnerClass = "text-yellow-500";

    if (score1 > score2) {
        winnerText = `${p1.product_name} daha yüksek Cildim Güvende Puanı'na sahip.`;
        winnerClass = "text-green-500";
    } else if (score2 > score1) {
        winnerText = `${p2.product_name} daha yüksek Cildim Güvende Puanı'na sahip.`;
        winnerClass = "text-green-500";
    }

    return (
        <div className="glass-card mt-8 p-8 rounded-3xl animate-fade-in-up md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Analiz Sonucu</h3>
            <p className={cn("text-lg font-medium mb-6", winnerClass)}>{winnerText}</p>

            {/* Natural Score Comparison */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-border/50">
                <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Doğallık Oranı</div>
                    <div className="text-2xl font-bold text-green-600">%{a1.naturalScore}</div>
                    <div className="h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${a1.naturalScore}%` }} />
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Doğallık Oranı</div>
                    <div className="text-2xl font-bold text-green-600">%{a2.naturalScore}</div>
                    <div className="h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${a2.naturalScore}%` }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                    <div className="font-bold mb-2 text-muted-foreground">Riskli Maddeler ({p1.product_name})</div>
                    <ul className="space-y-1">
                        {a1.analysis.filter(x => x.rating.risk === 'high' || x.rating.risk === 'moderate').map((i, idx) => (
                            <li key={idx} className={cn("flex items-center gap-2", i.rating.risk === 'high' ? "text-red-500" : "text-yellow-600")}>
                                <AlertTriangle className="w-3 h-3" /> {i.name}
                            </li>
                        ))}
                        {a1.analysis.filter(x => x.rating.risk === 'high' || x.rating.risk === 'moderate').length === 0 && (
                            <li className="text-green-500 flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Yok</li>
                        )}
                    </ul>
                </div>
                <div>
                    <div className="font-bold mb-2 text-muted-foreground">Riskli Maddeler ({p2.product_name})</div>
                    <ul className="space-y-1">
                        {a2.analysis.filter(x => x.rating.risk === 'high' || x.rating.risk === 'moderate').map((i, idx) => (
                            <li key={idx} className={cn("flex items-center gap-2", i.rating.risk === 'high' ? "text-red-500" : "text-yellow-600")}>
                                <AlertTriangle className="w-3 h-3" /> {i.name}
                            </li>
                        ))}
                        {a2.analysis.filter(x => x.rating.risk === 'high' || x.rating.risk === 'moderate').length === 0 && (
                            <li className="text-green-500 flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Yok</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
