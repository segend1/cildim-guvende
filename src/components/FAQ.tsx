'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "Cildim Güvende Puanı nasıl hesaplanıyor?",
        answer: "Cildim Güvende Puanı, gelişmiş yapay zeka algoritmaları ve uluslararası bilimsel veritabanlarından elde edilen veriler ışığında hesaplanmaktadır. Her ürünün içeriği detaylıca analiz edilir ve 0'dan 100'e kadar bilimsel bir Cildim Güvende Puanı oluşturulur."
    },
    {
        question: "Analizler neye dayanıyor?",
        answer: "İçerik analizlerimiz, Avrupa Birliği Kozmetik Regülasyonları, Amerikan FDA verileri ve bağımsız bilimsel araştırmaların derlendiği veritabanlarına dayanır. Bu veriler ışığında ürünler, güncel bilimsel literatüre göre tarafsız olarak değerlendirilir."
    },
    {
        question: "Aradığım ürünü bulamazsam ne yapmalıyım?",
        answer: "Veritabanımız sürekli genişliyor ancak henüz her ürün ekli olmayabilir. Böyle bir durumda, ürünün arka yüzündeki 'Ingredients' (İçindekiler) listesinin fotoğrafını çekip veya metnini kopyalayıp 'İçerik Analizi' sayfamızdan manuel analiz yapabilirsiniz. (Bu özellik şu an bakım aşamasındadır ve aktif değildir.)"
    },
    {
        question: "Bu site tıbbi tavsiye verir mi?",
        answer: "Hayır. 'Cildim Güvende' sadece ürünlerin içerik listelerini analiz ederek kimyasallar hakkında bilgi verir ve derecelendirir. İçeriklerde hata olabilir. Cilt hastalıklarınız veya alerjik reaksiyonlarınız için mutlaka bir dermatoloğa başvurmalısınız."
    },
    {
        question: "Hizmeti kullanmak ücretli mi?",
        answer: "Hayır, Cildim Güvende platformundaki tüm analiz, arama ve karşılaştırma özellikleri tamamen ücretsizdir."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="w-full max-w-3xl mx-auto py-12 px-4">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Sıkça Sorulan Sorular</h2>
                <p className="text-muted-foreground mt-2">
                    Aklınıza takılan soruların yanıtlarını burada bulabilirsiniz.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={cn(
                            "glass-card rounded-2xl overflow-hidden transition-all duration-300 border",
                            openIndex === index ? "border-primary/30 shadow-md bg-secondary/30" : "border-border/50 hover:bg-secondary/20"
                        )}
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex items-center justify-between p-5 text-left font-medium text-lg focus:outline-none"
                        >
                            <span>{faq.question}</span>
                            <ChevronDown
                                className={cn(
                                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                                    openIndex === index && "rotate-180 text-primary"
                                )}
                            />
                        </button>
                        <div
                            className={cn(
                                "grid transition-all duration-300 ease-out",
                                openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}
                        >
                            <div className="overflow-hidden">
                                <div className="p-5 pt-0 text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
