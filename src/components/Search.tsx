'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { searchProducts, type Product } from '@/lib/api';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const searchParams = useSearchParams();

    const performSearch = useCallback(async (term: string) => {
        if (!term.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await searchProducts(term);
            setResults(data);
        } catch (err) {
            setError('Arama sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    }, []);

    // Initialize from URL
    useEffect(() => {
        const q = searchParams.get('q');
        if (q && !hasSearched && !query) {
            setQuery(q);
            performSearch(q);
        }
    }, [searchParams, performSearch, hasSearched, query]);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim() && query !== searchParams.get('q')) {
                performSearch(query);
            } else if (!query.trim()) {
                // only clear if user cleared it manually, not on initial load
                if (hasSearched && !searchParams.get('q')) {
                    setResults([]);
                    setHasSearched(false);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, performSearch, searchParams, hasSearched]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Trigger immediately on Enter, clearing the timer effectively by forcing the effect or just calling it.
            // Actually, standard debounce is fine for this UX. 
            // If we want immediate, we can just let it be or force it.
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-card rounded-lg border border-border shadow-sm">
                    <SearchIcon className="ml-4 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ürün adı, barkod veya içerik ara..."
                        className="w-full bg-transparent border-0 py-4 px-4 text-lg placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                    />
                    <button
                        disabled={loading}
                        className="mr-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ara'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}

            {hasSearched && results.length === 0 && !loading && !error && (
                <div className="text-center text-muted-foreground py-8">
                    Sonuç bulunamadı.
                </div>
            )}

            <div className="grid gap-4">
                {results.map((product) => (
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
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">{product.product_name || 'İsimsiz Ürün'}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{product.brands || 'Bilinmeyen Marka'}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
