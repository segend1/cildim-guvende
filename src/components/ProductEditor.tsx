'use client';

import { useState } from 'react';
import { updateProduct } from '@/app/actions'; // Adjust path if needed

interface ProductEditorProps {
    product: any;
}

export default function ProductEditor({ product }: ProductEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: product.name || product.title,
        brand: product.brand,
        image: product.image || product.image_url,
        ingredients: product.ingredients
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!confirm('Kaydetmek istediğinize emin misiniz?')) return;
        setLoading(true);
        try {
            await updateProduct(product.id, data);
            alert('Ürün başarıyla güncellendi!');
            setIsOpen(false);
            window.location.reload(); // Force refresh to see new analysis
        } catch (err) {
            alert('Hata: ' + err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-2 rounded-full shadow-lg font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
                ✏️ Düzenle
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <h2 className="text-xl font-bold">Ürün Düzenle</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">✕</button>
                </div>

                <div className="p-6 space-y-4 flex-1">
                    <div>
                        <label className="block text-sm font-medium mb-1">Ürün Adı</label>
                        <input
                            name="name"
                            className="w-full p-2 border rounded-lg bg-background"
                            value={data.name || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Marka</label>
                            <input
                                name="brand"
                                className="w-full p-2 border rounded-lg bg-background"
                                value={data.brand || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Görsel URL</label>
                            <input
                                name="image"
                                className="w-full p-2 border rounded-lg bg-background"
                                value={data.image || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {data.image && (
                        <div className="flex justify-center p-2 bg-gray-50 rounded-lg">
                            <img src={data.image} className="h-20 object-contain" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">İçerik Listesi (Virgülle ayrılmış)</label>
                        <textarea
                            name="ingredients"
                            className="w-full p-2 border rounded-lg bg-background h-48 font-mono text-xs"
                            value={data.ingredients || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Kaydediliyor...' : 'Kaydet ve Analiz Et'}
                    </button>
                </div>
            </div>
        </div>
    );
}
