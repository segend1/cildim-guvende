'use client';

import Link from 'next/link';
import { Search, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

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
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">

                {/* Desktop Logo & Nav */}
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <span className="font-bold hidden sm:inline-block">Cildim Güvende</span>
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

                {/* Mobile Logo (Centered or Left) */}
                <div className="flex md:hidden">
                    <Link className="flex items-center space-x-2" href="/">
                        <span className="font-bold">Cildim Güvende</span>
                    </Link>
                </div>

                {/* Mobile Hamburger Button */}
                <div className="flex flex-1 items-center justify-end space-x-2 md:hidden">
                    <button
                        className="p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </button>
                </div>

                {/* Spacer for desktop layout balance */}
                <div className="hidden md:flex flex-1 items-center justify-end"></div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border/40 bg-background">
                    <div className="container py-4 grid gap-4">
                        <button
                            className="flex items-center justify-between text-sm font-medium transition-colors hover:text-foreground/80"
                            onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                        >
                            <span>Kategoriler</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isMobileCategoryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMobileCategoryOpen && (
                            <div className="grid gap-2 pl-4 border-l-2 border-border/50 ml-1">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/categories/${cat.id}`}
                                        className="text-sm text-foreground/60 hover:text-foreground transition-colors py-1"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <Link
                            className="text-sm font-medium transition-colors hover:text-foreground/80"
                            href="/compare"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Karşılaştır
                        </Link>
                        <Link
                            className="text-sm font-medium transition-colors hover:text-foreground/80"
                            href="/brands"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Markalar
                        </Link>
                        <Link
                            className="text-sm font-medium transition-colors hover:text-foreground/80"
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Ara
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

