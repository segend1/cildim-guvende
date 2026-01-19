'use client';

import React, { useState, useMemo } from 'react';

type Product = {
    id?: string;
    name?: string; // Some data uses name, some title
    title?: string;
    brand: string;
    image: string;
    ingredients: string;
    scraped_at?: string;
    url?: string;
};

export default function ProductsTable({ data }: { data: Product[] }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 50;

    const filteredData = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return data.filter(p => {
            const title = (p.title || p.name || '').toLowerCase();
            const brand = (p.brand || '').toLowerCase();
            const ingredients = (p.ingredients || '').toLowerCase();
            return title.includes(lowerSearch) ||
                brand.includes(lowerSearch) ||
                ingredients.includes(lowerSearch);
        });
    }, [data, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Product Ingredients Database</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by name, brand, or ingredients..."
                    className="w-full p-2 border border-gray-300 rounded"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <p className="text-sm text-gray-500 mt-1">
                    Showing {filteredData.length} products
                </p>
            </div>

            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Image</th>
                            <th scope="col" className="px-6 py-3">Brand</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                            <th scope="col" className="px-6 py-3">Ingredients</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((product, idx) => (
                            <tr key={product.id || `product-${idx}`} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    {product.image ? (
                                        <img src={product.image} alt={product.title || product.name} className="w-16 h-16 object-cover rounded" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">No Img</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {product.brand}
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                    <div className="font-bold">{product.title || product.name || 'Untitled'}</div>
                                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs block mb-1">
                                        View Source
                                    </a>

                                    {(product as any).analysis && (
                                        <div className="mt-2 space-y-1">
                                            <div className="text-xs">
                                                <span className="font-semibold text-gray-600">CildimGüvende Puanı:</span>
                                                {(() => {
                                                    const avg = (product as any).analysis.avg_score;
                                                    let label = "Orta";
                                                    let color = "text-yellow-600";

                                                    // Score 1-10 where 1 is Safe.
                                                    // "MySkinSafe Score" implies High is Good.
                                                    // So Low Numeric (1-3) -> High Safety (Yüksek)
                                                    if (avg < 3.5) {
                                                        label = "Yüksek Puan";
                                                        color = "text-green-600";
                                                    } else if (avg > 6.5) {
                                                        label = "Düşük Puan";
                                                        color = "text-red-600";
                                                    } else {
                                                        label = "Orta Puan";
                                                    }

                                                    return (
                                                        <span className={`ml-1 font-bold ${color}`}>
                                                            {label} <span className="text-gray-400 font-normal">({avg})</span>
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="text-xs">
                                                <span className="font-semibold text-gray-600">Doğallık Oranı:</span>
                                                <span className={`ml-1 font-bold ${(product as any).analysis.naturalness_ratio >= 80 ? 'text-green-600' :
                                                    (product as any).analysis.naturalness_ratio >= 50 ? 'text-yellow-600' : 'text-gray-600'
                                                    }`}>
                                                    {(product as any).analysis.naturalness_ratio}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 max-w-lg">
                                    <details className="cursor-pointer">
                                        <summary className="font-medium text-gray-600 truncate max-w-xs text-xs mb-2">
                                            Show Ingredients ({(product as any).analysis ? (product as any).analysis.total_ingredients : '?'})
                                        </summary>

                                        <div className="mt-2 text-xs leading-relaxed max-h-60 overflow-y-auto pr-2">
                                            {(product as any).analysis && (product as any).analysis.detailed_ingredients ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {(product as any).analysis.detailed_ingredients.map((ing: any, idx: number) => {
                                                        let scoreClass = "bg-gray-100 text-gray-600"; // Unknown
                                                        if (ing.score !== null) {
                                                            if (ing.score <= 2) scoreClass = "bg-green-100 text-green-800 border-green-200";
                                                            else if (ing.score <= 6) scoreClass = "bg-yellow-50 text-yellow-800 border-yellow-200";
                                                            else scoreClass = "bg-red-50 text-red-800 border-red-200";
                                                        }

                                                        return (
                                                            <span key={idx} className={`inline-block border px-1.5 py-0.5 rounded ${scoreClass}`}>
                                                                {ing.name}
                                                                {ing.score !== null && <span className="ml-1 opacity-75 font-semibold">({ing.score})</span>}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p>{product.ingredients}</p>
                                            )}
                                        </div>
                                    </details>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
