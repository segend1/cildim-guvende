
import { Metadata } from 'next';
import { getProduct } from '@/lib/api';
import ProductDetail from '@/components/ProductDetail';
import Script from 'next/script';

interface PageProps {
    params: Promise<{ id: string }>;
}

// 1. Generate Dynamic Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Ürün Bulunamadı | Cildim Güvende',
            description: 'Aradığınız ürün veritabanımızda bulunamadı.'
        };
    }

    const title = `${product.product_name} Analizi ve İçerik Detayları | ${product.brands}`;
    const description = `${product.brands} markasına ait ${product.product_name} ürününün içerik analizi, risk puanı ve detaylı incelemesi. Kozmetik ürün güvenliği hakkında bilgi edinin.`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: product.image_url ? [product.image_url] : [],
        },
    };
}

// 2. Server Component
export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return (
            <div className="min-h-screen pt-24 flex flex-col justify-center items-center bg-background">
                <h1 className="text-2xl font-bold mb-4 text-foreground">Ürün Bulunamadı</h1>
                <p className="text-muted-foreground">Aradığınız ürün veritabanımızda mevcut değil.</p>
            </div>
        );
    }

    // 3. Structured Data (JSON-LD)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.product_name,
        image: product.image_url ? [product.image_url] : [],
        description: `${product.product_name} içerik analizi ve güvenlik raporu.`,
        brand: {
            '@type': 'Brand',
            name: product.brands
        },
        offers: {
            '@type': 'Offer',
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock'
        }
    };

    return (
        <>
            {/* Inject JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Render Client Component */}
            <ProductDetail product={product} />
        </>
    );
}
