import { Suspense } from 'react';
import Search from '@/components/Search';
import FAQ from '@/components/FAQ';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <section className="flex-1 flex flex-col items-center justify-center py-12 md:py-24 lg:py-32 px-4 md:px-6 relative overflow-hidden">

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 max-w-3xl z-10">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Cildin Ne Kadar <span className="text-primary">Güvende?</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            <strong>Kozmetik içerikleri inceleme</strong> platformu Cildim Güvende ile cildinize değer verin.
            <strong>Doğal kozmetik</strong> arayışınızda, ürünlerin analizini yapın ve gelişmiş <strong>kozmetik karşılaştırma</strong> aracımızla en güvenli seçimi yapın.
            Doğal kozmetik içerikleri ve sağlık skorları hakkında anında bilgi edinin.
          </p>


          <div className="w-full pt-4">
            <Suspense fallback={<div className="h-14 w-full bg-secondary/20 rounded-lg animate-pulse"></div>}>
              <Search />
            </Suspense>
          </div>

          {/* Quick Links / Popular Categories */}
          <div className="w-full flex flex-wrap justify-center gap-2 pt-4">
            <p className="w-full text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Popüler Kategoriler</p>
            {[
              { name: 'Güneş Kremi', slug: 'sun-care' },
              { name: 'Temizleyici', slug: 'cleanser' },
              { name: 'Nemlendirici', slug: 'face-care' },
              { name: 'Serum', slug: 'serum' },
            ].map((cat) => (
              <a
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="px-4 py-2 text-sm bg-background border border-border/50 rounded-full shadow-sm hover:bg-secondary/50 hover:border-primary/20 transition-all duration-300"
              >
                {cat.name}
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground pt-8">
            <span className="px-3 py-1 rounded-full bg-secondary/50 border border-secondary">✨ İçerik Analizi</span>
            <span className="px-3 py-1 rounded-full bg-secondary/50 border border-secondary">🛡️ Risk Puanlama</span>
            <span className="px-3 py-1 rounded-full bg-secondary/50 border border-secondary">⚖️ Ürün Karşılaştırma</span>
          </div>

          <div className="w-full pt-20">
            <FAQ />
          </div>
        </div>
      </section>
    </div>
  );
}
