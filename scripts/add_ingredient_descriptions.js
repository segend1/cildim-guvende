const fs = require('fs');
const path = require('path');

// İçerik açıklamaları veritabanı
const ingredientDescriptions = {
    // Su bazlı
    'aqua': 'Su. Kozmetiklerde en yaygın kullanılan çözücü ve temel bileşen.',
    'water': 'Su. Kozmetiklerde en yaygın kullanılan çözücü ve temel bileşen.',

    // Nemlendirici ve nemlendiriciler
    'glycerin': 'Yoğun nemlendirici. Cildi nemlendirir ve yumuşatır.',
    'hyaluronic acid': 'Güçlü nemlendirici. Cildin nem tutma kapasitesini artırır.',
    'sodium hyaluronate': 'Hyaluronik asidin tuzu. Cildi nemlendirir ve dolgunlaştırır.',
    'panthenol': 'Pro-vitamin B5. Cildi nemlendirir, iyileştirir ve yatıştırır.',
    'butylene glycol': 'Nemlendirici ve çözücü. Cildin nemini korur.',
    'propylene glycol': 'Nemlendirici ve çözücü. Aktif maddelerin emilimini artırır.',

    // Vitaminler
    'niacinamide': 'Vitamin B3. Gözenek görünümünü azaltır, leke karşıtı, cildi aydınlatır.',
    'tocopherol': 'Vitamin E. Antioksidan, cildi serbest radikallerden korur.',
    'tocopheryl acetate': 'Vitamin E türevi. Antioksidan etki, cildi korur.',
    'ascorbic acid': 'Vitamin C. Leke karşıtı, cilt tonu eşitleyici, antioksidan.',
    'retinol': 'Vitamin A. Yaşlanma karşıtı, kırışıklık azaltıcı, cilt yenileyici.',
    'retinyl palmitate': 'Vitamin A türevi. Cilt yenileyici, yaşlanma karşıtı.',

    // Yağlar ve emolyenlar
    'dimethicone': 'Silikon türevi. Cildi yumuşatır, pürüzsüz bir his verir.',
    'cyclomethicone': 'Silikon türevi. Hafif doku, cildi yumuşatır.',
    'cyclopentasiloxane': 'Silikon türevi. Ürünün kolayca yayılmasını sağlar.',
    'squalane': 'Bitki veya hayvan kaynaklı yağ. Yoğun nemlendirici, cildi yumuşatır.',
    'jojoba oil': 'Jojoba yağı. Doğal nemlendirici, cildi besler.',
    'shea butter': 'Shea yağı. Yoğun nemlendirici, cildi besler ve yumuşatır.',
    'butyrospermum parkii butter': 'Shea yağı. Yoğun nemlendirici, cildi besler ve yumuşatır.',
    'argan oil': 'Argan yağı. Besleyici, antioksidan içerir.',
    'coconut oil': 'Hindistan cevizi yağı. Nemlendirici, ancak gözenek tıkayıcı olabilir.',

    // Alkoller
    'alcohol denat': 'Denatüre alkol. Çabuk kuruma sağlar, hassas ciltlerde kuruluğa neden olabilir.',
    'alcohol denat.': 'Denatüre alkol. Çabuk kuruma sağlar, hassas ciltlerde kuruluğa neden olabilir.',
    'cetyl alcohol': 'Yağlı alkol. Nemlendirici ve yumuşatıcı, kurutucu değil.',
    'cetearyl alcohol': 'Yağlı alkol. Nemlendirici ve kıvam arttırıcı, kurutucu değil.',
    'stearyl alcohol': 'Yağlı alkol. Yumuşatıcı ve stabilize edici, kurutucu değil.',
    'behenyl alcohol': 'Yağlı alkol. Yumuşatıcı ve kıvam verici, kurutucu değil.',

    // Güneş filtreleri
    'titanium dioxide': 'Mineral güneş filtresi. UVA ve UVB\'den korur, fiziksel bariyer oluşturur.',
    'zinc oxide': 'Mineral güneş filtresi. UVA ve UVB\'den korur, yatıştırıcı etki.',
    'avobenzone': 'Kimyasal güneş filtresi. UVA ışınlarından korur.',
    'octinoxate': 'Kimyasal güneş filtresi. UVB ışınlarından korur.',
    'octocrylene': 'Kimyasal güneş filtresi. UVB ışınlarından korur, su direnci sağlar.',
    'homosalate': 'Kimyasal güneş filtresi. UVB ışınlarından korur.',
    'butyl methoxydibenzoylmethane': 'Avobenzone. Kimyasal güneş filtresi, UVA koruması.',
    'ethylhexyl methoxycinnamate': 'Octinoxate. Kimyasal güneş filtresi, UVB koruması.',

    // Koruyucular
    'phenoxyethanol': 'Koruyucu. Bakteri ve mantarlara karşı ürünü korur.',
    'methylparaben': 'Paraben koruyucu. Mikroorganizmalara karşı koruma sağlar.',
    'propylparaben': 'Paraben koruyucu. Mikroorganizmalara karşı koruma sağlar.',
    'benzyl alcohol': 'Koruyucu. Ürünün bozulmasını önler.',
    'sodium benzoate': 'Koruyucu. Mikrobiyal büyümeyi engeller.',
    'potassium sorbate': 'Koruyucu. Küf ve mayalara karşı etkili.',

    // Asitler (AHA, BHA)
    'salicylic acid': 'BHA. Gözenek temizleyici, akne karşıtı, yağ dengeleyici.',
    'glycolic acid': 'AHA. Ölü deri hücrelerini temizler, cilt tonunu eşitler.',
    'lactic acid': 'AHA. Hafif peeling, nemlendirici, cilt tonunu eşitler.',
    'citric acid': 'AHA. pH dengeleyici, antioksidan, hafif peeling.',
    'mandelic acid': 'AHA. Hassas ciltler için uygun, gözenek temizleyici.',

    // Antioksidanlar
    'green tea extract': 'Yeşil çay ekstresi. Güçlü antioksidan, yatıştırıcı.',
    'vitamin c': 'Vitamin C. Leke karşıtı, antioksidan, kolajen üretimini destekler.',
    'resveratrol': 'Güçlü antioksidan. Yaşlanma karşıtı, cildi korur.',
    'ferulic acid': 'Antioksidan. Vitamin C ve E\'nin etkinliğini artırır.',

    // Yatıştırıcılar
    'aloe vera': 'Aloe vera. Yatıştırıcı, nemlendirici, iltihap karşıtı.',
    'centella asiatica': 'Centella ekstresi. Yatıştırıcı, iyileştirici, tahriş azaltıcı.',
    'madecassoside': 'Centella asiatica\'dan elde edilir. Yatıştırıcı ve iyileştirici.',
    'allantoin': 'Yatıştırıcı. Cildi iyileştirir ve tahriş azaltır.',
    'bisabolol': 'Papatya\'dan elde edilir. Yatıştırıcı ve iltihap karşıtı.',
    'chamomile extract': 'Papatya ekstresi. Yatıştırıcı, iltihap karşıtı.',

    // Peptidler
    'peptides': 'Peptitler. Yaşlanma karşıtı, kolajen üretimini destekler.',
    'copper peptides': 'Bakırlı peptitler. Cilt yenileme, yara iyileştirme.',
    'matrixyl': 'Peptit kompleksi. Kırışıklık azaltıcı, cilt sıkılaştırıcı.',

    // Kil ve absorbanlar
    'kaolin': 'Beyaz kil. Yağ emici, gözenek temizleyici.',
    'bentonite': 'Kil. Detoks edici, yağ emici.',
    'charcoal': 'Aktif kömür. Toksinleri ve kirleri emer.',

    // Renklendiriciler (CI numaraları)
    'ci 77491': 'Demir oksit (kırmızı). Doğal mineral renklendirici.',
    'ci 77492': 'Demir oksit (sarı). Doğal mineral renklendirici.',
    'ci 77499': 'Demir oksit (siyah). Doğal mineral renklendirici.',
    'ci 77891': 'Titanyum dioksit. Beyaz renk pigmenti, güneş filtresi.',

    // Kıvam arttırıcılar
    'carbomer': 'Jel oluşturucu. Ürüne kıvam verir.',
    'xanthan gum': 'Doğal kıvam arttırıcı. Stabilize edici.',
    'acrylates copolymer': 'Polimer. Film oluşturucu, kıvam arttırıcı.',
    'acrylates crosspolymer': 'Polimer. Kıvam arttırıcı, doku iyileştirici.',

    // Surfaktanlar (temizleyiciler)
    'sodium lauryl sulfate': 'SLS. Güçlü temizleyici, köpürtücü, hassas ciltlerde tahrişe neden olabilir.',
    'sodium laureth sulfate': 'SLES. Temizleyici, SLS\'ye göre daha yumuşak.',
    'cocamidopropyl betaine': 'Yumuşak temizleyici. Hindistan cevizinden elde edilir.',
    'coco betaine': 'Yumuşak temizleyici. Hindistan cevizinden elde edilir.',
    'decyl glucoside': 'Yumuşak temizleyici. Bitki bazlı, hassas ciltler için uygun.',

    // Parfüm ve koku
    'parfum': 'Parfüm. Ürüne koku verir, hassas ciltlerde tahrişe neden olabilir.',
    'fragrance': 'Parfüm. Ürüne koku verir, hassas ciltlerde tahrişe neden olabilir.',
    'limonene': 'Narenciye kokulu bileşen. Alerjik reaksiyon riski olabilir.',
    'linalool': 'Kokulu bileşen. Lavanta ve diğer bitkilerde bulunur.',

    // Diğer aktif maddeler
    'ceramides': 'Seramidler. Cilt bariyerini güçlendirir, nem kaybını önler.',
    'niacinamide': 'Vitamin B3. Gözenek görünümünü azaltır, leke karşıtı.',
    'adenosine': 'Yaşlanma karşıtı. Kırışıklık azaltıcı, cildi sıkılaştırır.',
    'caffeine': 'Kafein. Şişlik azaltıcı, kan dolaşımını hızlandırır.',
};

// Normalize fonksiyonu - içerik adlarını karşılaştırmak için
function normalizeIngredientName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')  // Çoklu boşlukları tek boşluğa dönüştür
        .replace(/\./g, '')     // Noktaları kaldır
        .replace(/-/g, ' ');    // Tireleri boşluğa çevir
}

// Açıklama bul fonksiyonu
function findDescription(ingredientName) {
    const normalized = normalizeIngredientName(ingredientName);

    // Tam eşleşme ara
    if (ingredientDescriptions[normalized]) {
        return ingredientDescriptions[normalized];
    }

    // Kısmi eşleşme ara (örn: "butyrospermum parkii butter" için "shea butter")
    for (const [key, desc] of Object.entries(ingredientDescriptions)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return desc;
        }
    }

    return null;
}

// Ana fonksiyon
function addIngredientDescriptions() {
    const ingredientsPath = path.join(__dirname, '../src/lib/ingredients.json');

    console.log('📖 ingredients.json dosyası okunuyor...');
    const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf-8'));

    console.log(`✅ Toplam ${ingredients.length} içerik bulundu`);

    let updatedCount = 0;
    let unknownUpdatedCount = 0;

    ingredients.forEach(ingredient => {
        // Sadece "Orta seviye veya bilinmeyen risk." olanları güncelle
        if (ingredient.analysis === 'Orta seviye veya bilinmeyen risk.') {
            const description = findDescription(ingredient.name);

            if (description) {
                ingredient.analysis = description;
                updatedCount++;
                console.log(`  ✓ ${ingredient.name}: ${description.substring(0, 50)}...`);
            } else {
                // Açıklama bulunamayanlar için genel güvenli mesaj
                ingredient.analysis = 'Kozmetik ürünlerde bilinen bir zararı yoktur.';
                unknownUpdatedCount++;
            }
        }
    });

    console.log(`\n📝 ${updatedCount} içerik için özel açıklama eklendi`);
    console.log(`📝 ${unknownUpdatedCount} içerik için genel açıklama eklendi`);
    console.log(`\n💾 Dosya kaydediliyor...`);

    fs.writeFileSync(ingredientsPath, JSON.stringify(ingredients, null, 2), 'utf-8');

    console.log('✅ İşlem tamamlandı!');

    // İstatistikler
    const totalWithGenericDesc = ingredients.filter(i =>
        i.analysis === 'Orta seviye veya bilinmeyen risk.'
    ).length;

    console.log(`\n📊 İstatistikler:`);
    console.log(`   Toplam içerik: ${ingredients.length}`);
    console.log(`   Güncellenen: ${updatedCount + unknownUpdatedCount}`);
    console.log(`   Kalan genel açıklama: ${totalWithGenericDesc}`);
}

// Scripti çalıştır
addIngredientDescriptions();
