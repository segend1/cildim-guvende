import type { Metadata } from 'next';
import CompareClient from '@/components/CompareClient';

export const metadata: Metadata = {
    title: 'Kozmetik Karşılaştırma | Cildim Güvende',
    description: 'Kozmetik ürünlerini yan yana karşılaştırın. İçerik analizi, risk puanları ve doğallık oranlarını kıyaslayarak en güvenli kozmetik tercihini yapın.',
    keywords: [
        'kozmetik karşılaştırma',
        'kozmetik içerik karşılaştırma',
        'ürün kıyaslama',
        'kozmetik analiz',
        'cilt bakım ürünü karşılaştırma',
        'içerik analizi'
    ],
    openGraph: {
        title: 'Kozmetik Karşılaştırma | Cildim Güvende',
        description: 'Hangi ürün daha temiz? Kozmetik ürünlerini içeriklerine göre karşılaştırın.',
        url: 'https://cildimguvende.com/compare',
    }
};

export default function ComparePage() {
    return <CompareClient />;
}
