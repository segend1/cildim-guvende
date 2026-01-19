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
          Kullandığın kozmetik ürünlerinin içeriğini analiz et, cildin için uygun olanı bul ve daha sağlıklı seçimler yap.


          <div className="w-full pt-4">
            <Suspense fallback={<div className="h-14 w-full bg-secondary/20 rounded-lg animate-pulse"></div>}>
              <Search />
            </Suspense>
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
