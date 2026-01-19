'use client';

import { useState } from 'react';
import { patchProduct } from '@/app/actions';
import { Pencil } from 'lucide-react';

interface EditableImageProps {
    id: string;
    value: string;
    alt: string;
    isAdmin: boolean;
}

export default function EditableImage({ id, value: initialValue, alt, isAdmin }: EditableImageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (value === initialValue) {
            setIsEditing(false);
            return;
        }
        setLoading(true);
        try {
            await patchProduct(id, 'image', value);
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            alert('Hata: ' + error);
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center p-4 gap-2">
                <p className="text-sm font-bold">Görsel URL Düzenle</p>
                <input
                    className="w-full p-2 border rounded text-xs"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 rounded text-xs">İptal</button>
                    <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">{loading ? '...' : 'Kaydet'}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group w-full h-full">
            {initialValue ? (
                <img src={initialValue} alt={alt} className="object-contain w-full h-full" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">Görsel Yok</div>
            )}

            {isAdmin && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-2 right-2 bg-yellow-400 text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                    title="Görseli Değiştir"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
