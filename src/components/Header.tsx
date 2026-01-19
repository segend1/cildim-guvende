'use client';

import Link from 'next/link';
import { Search, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const categories = [
        { id: 'sun-care', name: 'Güneş Koruyucu' },
        { id: 'face-care', name: 'Yüz Bakımı' },
        { id: 'body-care', name: 'Vücut Bakımı' },
        { id: 'cleanser', name: 'Temizleyici' },
        { id: 'serum', name: 'Serum' },
        { id: 'acne-care', name: 'Sivilce Bakımı' },
        { id: 'eye-care', name: 'Göz Bakımı' },
        { id: 'hand-care', name: 'El Bakımı' },
        { id: 'deodorant', name: 'Deodorant' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <span className="hidden font-bold sm:inline-block">Cildim Güvende</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <div className="relative group">
                            <button
                                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            >
                                Kategoriler
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className={`absolute left-0 top-full pt-2 w-48 ${isCategoryOpen ? 'block' : 'hidden'} group-hover:block`}>
                                <div className="rounded-md border bg-popover p-2 shadow-md">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/categories/${cat.id}`}
                                            className="block px-3 py-2 text-sm rounded-sm hover:bg-accent transition-colors"
                                            onClick={() => setIsCategoryOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/compare">
                            Karşılaştır
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/brands">
                            Markalar
                        </Link>
                        <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/">
                            Ara
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search Placeholder */}
                    </div>
                    <nav className="flex items-center">
                        <button className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}

