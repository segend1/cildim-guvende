
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, Product } from '@/lib/api';
import { analyzeProductIngredients, RiskLevel, SafetyRating } from '@/lib/safety';
import { cn } from '@/lib/utils';
import { AlertTriangle, ShieldCheck, HelpCircle, ChevronRight, Check, AlertOctagon, Leaf, FlaskConical, TestTube } from 'lucide-react';
import ProductEditor from '@/components/ProductEditor';
import EditableText from '@/components/EditableText';
import EditableImage from '@/components/EditableImage';
import { isLoggedIn } from '@/app/admin/login/auth';

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeProductIngredients> | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'risk' | 'all' | 'safe'>('risk');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const adminStatus = await isLoggedIn();
                setIsAdmin(adminStatus);

                if (params.id) {
                    const data = await getProduct(params.id as string);
                    setProduct(data);
                    if (data?.ingredients_text) {
                        setAnalysis(analyzeProductIngredients(data.ingredients_text));
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 flex flex-col justify-center items-center bg-background">
                <h1 className="text-2xl font-bold mb-4 text-foreground">Ürün Bulunamadı</h1>
                <p className="text-muted-foreground">Aradığınız ürün veritabanımızda mevcut değil.</p>
            </div>
        );
    }

    const riskColor =
        analysis?.totalRisk === 'high' ? 'text-red-500' :
            analysis?.totalRisk === 'moderate' ? 'text-yellow-500' :
                'text-green-500';

    const riskBg =
        analysis?.totalRisk === 'high' ? 'bg-red-500/10 border-red-500/20' :
            analysis?.totalRisk === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/20' :
                'bg-green-500/10 border-green-500/20';

    const groupedIngredients = {
        high: analysis?.analysis.filter(i => i.rating.risk === 'high') || [],
        moderate: analysis?.analysis.filter(i => i.rating.risk === 'moderate') || [],
        low: analysis?.analysis.filter(i => i.rating.risk === 'low') || [],
        unknown: analysis?.analysis.filter(i => i.rating.risk === 'unknown') || []
    };

    const riskCount = groupedIngredients.high.length + groupedIngredients.moderate.length;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="glass-card p-6 md:p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start animate-fade-in-up">
                    <div className="w-full md:w-1/3 aspect-square relative bg-white rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-4">
                        <EditableImage
                            id={product.code}
                            value={product.image_url || ''}
                            alt={product.product_name}
                            isAdmin={isAdmin}
                        />
                    </div>

                    <div className="flex-1 w-full space-y-4 text-center md:text-left">
                        <div>
                            <EditableText
                                id={product.code}
                                field="brand"
                                value={product.brands}
                                isAdmin={isAdmin}
                                as="div"
                                className="text-sm font-medium text-primary uppercase tracking-wider inline-block"
                                href={`/brands/${encodeURIComponent(product.brands)}`}
                            />
                            <EditableText
                                id={product.code}
                                field="name"
                                value={product.product_name}
                                isAdmin={isAdmin}
                                as="h1"
                                className="text-3xl md:text-4xl font-bold text-foreground mt-1 leading-tight"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            {/* Risk Badge */}
                            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md", riskBg)}>
                                {analysis?.totalRisk === 'high' ? <AlertOctagon className="w-5 h-5 text-red-500" /> :
                                    analysis?.totalRisk === 'moderate' ? <AlertTriangle className="w-5 h-5 text-yellow-500" /> :
                                        <ShieldCheck className="w-5 h-5 text-green-500" />}
                                <span className={cn("font-bold capitalize", riskColor)}>
                                    {analysis?.totalRisk === 'high' ? 'Düşük Puan' :
                                        analysis?.totalRisk === 'moderate' ? 'Orta Puan' :
                                            'Yüksek Puan'}
                                </span>
                            </div>

                            {/* Natural Score Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-600 backdrop-blur-md">
                                <Leaf className="w-5 h-5" />
                                <span className="font-bold">
                                    %{analysis?.naturalScore || 0} Doğal
                                </span>
                            </div>

                            <Link
                                href={`/compare?p1=${product.code}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-medium"
                            >
                                <span className="hidden md:inline">Karşılaştır</span>
                                <span className="md:hidden">VS</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Bu ürün toplam <strong>{analysis?.analysis.length}</strong> bileşen içeriyor.
                            Bunlardan <strong>{riskCount}</strong> tanesi dikkat edilmesi gereken maddeler sınıfındadır.
                        </p>
                    </div>
                </div>

                {/* Analysis Tabs */}
                <div className="glass-card p-6 rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-border/50">
                        <button
                            onClick={() => setActiveTab('risk')}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                activeTab === 'risk'
                                    ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
                                    : "text-muted-foreground hover:bg-secondary"
                            )}
                        >
                            Düşük Puanlılar ({riskCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('safe')}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                activeTab === 'safe'
                                    ? "bg-green-500/10 text-green-500 ring-1 ring-green-500/20"
                                    : "text-muted-foreground hover:bg-secondary"
                            )}
                        >
                            Yüksek Puanlılar ({groupedIngredients.low.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                activeTab === 'all'
                                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                    : "text-muted-foreground hover:bg-secondary"
                            )}
                        >
                            Tüm Liste ({analysis?.analysis.length})
                        </button>
                    </div>

                    <div className="space-y-3 min-h-[300px]">
                        {activeTab === 'risk' && (
                            <>
                                {groupedIngredients.high.length === 0 && groupedIngredients.moderate.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
                                        <p>Harika! Bu üründe bilinen yüksek veya orta riskli madde bulunamadı.</p>
                                    </div>
                                ) : (
                                    <>
                                        {groupedIngredients.high.map((item, idx) => (
                                            <IngredientRow key={`h-${idx}`} item={item} />
                                        ))}
                                        {groupedIngredients.moderate.map((item, idx) => (
                                            <IngredientRow key={`m-${idx}`} item={item} />
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === 'safe' && (
                            <>
                                {groupedIngredients.low.map((item, idx) => (
                                    <IngredientRow key={`l-${idx}`} item={item} />
                                ))}
                            </>
                        )}

                        {activeTab === 'all' && (
                            <>
                                {analysis?.analysis.map((item, idx) => (
                                    <IngredientRow key={`a-${idx}`} item={item} />
                                ))}
                            </>
                        )}
                    </div>
                </div>

            </div>
            {product && isAdmin && <ProductEditor product={product} />}
        </div>
    );
}

function IngredientRow({ item }: { item: { name: string, rating: SafetyRating } }) {
    const colorClass =
        item.rating.risk === 'high' ? 'text-red-600 bg-red-500/5 border-red-500/10' :
            item.rating.risk === 'moderate' ? 'text-orange-600 bg-orange-500/5 border-orange-500/10' :
                item.rating.risk === 'low' ? 'text-green-600 bg-green-500/5 border-green-500/10' :
                    'text-gray-500 bg-gray-500/5 border-gray-500/10';

    const icon =
        item.rating.risk === 'high' ? <AlertOctagon className="w-4 h-4" /> :
            item.rating.risk === 'moderate' ? <AlertTriangle className="w-4 h-4" /> :
                item.rating.risk === 'low' ? <Check className="w-4 h-4" /> :
                    <HelpCircle className="w-4 h-4" />;

    // Origin Icon
    const originIcon =
        item.rating.origin === 'natural' ? <Leaf className="w-3 h-3 text-green-500" /> :
            item.rating.origin === 'bio-identical' ? <TestTube className="w-3 h-3 text-blue-500" /> :
                item.rating.origin === 'synthetic' ? <FlaskConical className="w-3 h-3 text-purple-500" /> :
                    null;

    const originText =
        item.rating.origin === 'natural' ? 'Doğal' :
            item.rating.origin === 'bio-identical' ? 'Doğala Özdeş' :
                item.rating.origin === 'synthetic' ? 'Sentetik' : '-';

    // Clean name presentation
    const displayName = item.name.replace(/^[^\w]+|[^\w]+$/g, '');

    return (
        <div className={cn("flex items-start gap-3 p-3 rounded-xl border transition-colors hover:bg-secondary/40", colorClass)}>
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm truncate">{displayName || 'Bilinmeyen Madde'}</div>
                    {originIcon && (
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-white/50 border border-black/5 dark:bg-black/20 dark:border-white/10 opacity-70">
                            {originIcon}
                            <span>{originText}</span>
                        </div>
                    )}
                </div>
                <div className="text-xs opacity-80 mt-0.5 font-medium leading-relaxed">
                    {item.rating.risk === 'unknown' ? 'Kozmetik ürünlerde bilinen bir zararı yoktur.' : item.rating.description}
                </div>
            </div>
            <div className="shrink-0 text-[10px] font-bold uppercase tracking-wider opacity-60 px-2 py-1">
                {item.rating.risk === 'unknown' ? '?' : item.rating.risk === 'moderate' ? 'Orta Puan' : item.rating.risk === 'high' ? 'Düşük Puan' : 'Yüksek Puan'}
            </div>
        </div>
    );
}
