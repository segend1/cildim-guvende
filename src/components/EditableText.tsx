'use client';

import { useState, useEffect } from 'react';
import { patchProduct } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

interface EditableTextProps {
    id: string;
    field: string;
    value: string;
    isAdmin: boolean;
    className?: string;
    as?: 'h1' | 'p' | 'span' | 'div';
    multiline?: boolean;
    onUpdate?: () => void;
    href?: string;
}

export default function EditableText({
    id, field, value: initialValue, isAdmin, className, as: Component = 'div', multiline = false, onUpdate, href
}: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = async () => {
        if (value === initialValue) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            await patchProduct(id, field, value);
            setIsEditing(false);
            if (onUpdate) onUpdate(); // Trigger refresh if needed
        } catch (error) {
            alert('Hata: ' + error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        if (href) {
            return (
                <Link href={href} className={cn("hover:underline", className)}>
                    <Component>{value}</Component>
                </Link>
            );
        }
        return <Component className={className}>{value}</Component>;
    }

    if (isEditing) {
        if (multiline) {
            return (
                <textarea
                    className={cn("w-full p-2 border rounded shadow-inner bg-background text-foreground", className)}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    rows={10}
                />
            );
        }
        return (
            <input
                className={cn("w-full p-2 border rounded shadow-inner bg-background text-foreground", className)}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
            />
        );
    }

    return (
        <Component
            className={cn("cursor-pointer hover:bg-yellow-100/10 hover:outline hover:outline-dashed hover:outline-yellow-500 rounded px-1 transition-all relative group", className)}
            onClick={() => setIsEditing(true)}
            title="Düzenlemek için tıklayın"
        >
            {value}
            <span className="absolute -top-3 -right-3 invisible group-hover:visible bg-yellow-500 text-black p-1 rounded-full shadow-sm">
                <Pencil className="w-3 h-3" />
            </span>
        </Component>
    );
}
