
export type RiskLevel = 'low' | 'moderate' | 'high' | 'unknown';
export type Origin = 'natural' | 'synthetic' | 'bio-identical' | 'unknown';

export interface SafetyRating {
    risk: RiskLevel;
    origin: Origin;
    description: string;
}

// Comprehensive list of ingredients with Risk and Origin
const INGREDIENT_RISKS: Record<string, SafetyRating> = {
    // HIGH RISK (Kırmızı Listesi)
    'paraben': { risk: 'high', origin: 'synthetic', description: 'Endokrin (hormon) sistemini bozma potansiyeli taşıyan tartışmalı koruyucu.' },
    'methylparaben': { risk: 'high', origin: 'synthetic', description: 'Paraben türevi. Cilt tarafından kolayca emilir, hormon taklidi yapabilir.' },
    'propylparaben': { risk: 'high', origin: 'synthetic', description: 'Paraben türevi. Uzun zincirli yapısı nedeniyle hormon bozucu etkisi daha yüksektir.' },
    'triclosan': { risk: 'high', origin: 'synthetic', description: 'Bakteri direncine yol açabilen ve tiroid hormonlarını etkileyebilen ajan.' },
    'formaldehyde': { risk: 'high', origin: 'synthetic', description: 'Kesinleşmiş kanserojen. Solunum yollarını ve cildi tahriş eder.' },
    'dmdm hydantoin': { risk: 'high', origin: 'synthetic', description: 'Zamanla formaldehit serbest bırakan koruyucu. Alerji ve tahriş potansiyeli.' },
    'imidazolidinyl urea': { risk: 'high', origin: 'synthetic', description: 'Formaldehit salıcı. Egzama ve kontakt dermatit tetikleyicisi olabilir.' },
    'diazolidinyl urea': { risk: 'high', origin: 'synthetic', description: 'Formaldehit salıcı. Hassas ciltler için uyarılar mevcuttur.' },
    'phthalate': { risk: 'high', origin: 'synthetic', description: 'Plastikleştirici. Üreme sistemi toksisitesi şüphesi taşır.' },
    'hydroquinone': { risk: 'high', origin: 'synthetic', description: 'Cilt beyazlatıcı. Hücre toksisitesi nedeniyle AB\'de limitli kullanımdır.' },
    'methylisothiazolinone': { risk: 'high', origin: 'synthetic', description: 'MIT. Çok güçlü bir temas alerjenidir. Durulanan ürünlerde bile hassasiyet yaratabilir.' },
    'methylchloroisothiazolinone': { risk: 'high', origin: 'synthetic', description: 'CIT. Güçlü alerjen. Genellikle MIT ile karışım halinde kullanılır.' },
    'butylphenyl methylpropional': { risk: 'high', origin: 'synthetic', description: 'Lilial. Üreme sağlığına etkisi nedeniyle inceleme altındadır.' },
    'bha': { risk: 'high', origin: 'synthetic', description: 'Hormon etkisi şüphesi olan antioksidan koruyucu.' },
    'coal tar': { risk: 'high', origin: 'synthetic', description: 'Kömür katranı. Saç boyalarında bulunur, sağlık endişeleri mevcuttur.' },
    'per- and polyfluoroalkyl substances': { risk: 'high', origin: 'synthetic', description: 'PFAS ("Sonsuz kimyasallar"). Vücutta birikim yapabilir.' },

    // MODERATE RISK (Sarı Listesi - Dikkat)
    'bht': { risk: 'moderate', origin: 'synthetic', description: 'BHA alternatifi. Düşük dozda güvenli sayılsa da birikim konusu tartışmalı.' },
    'sulfate': { risk: 'moderate', origin: 'synthetic', description: 'Sülfatlar. Cildin doğal bariyerini aşındırıp kuruluğa neden olabilir.' },
    'sodium lauryl sulfate': { risk: 'moderate', origin: 'synthetic', description: 'SLS. Güçlü yağ sökücü. Cildi tahriş edebilir ve kurutabilir.' },
    'sodium laureth sulfate': { risk: 'moderate', origin: 'synthetic', description: 'SLES. SLS\'nin yumuşatılmış hali ama yine de hassas ciltleri yorabilir.' },
    'alcohol denat': { risk: 'moderate', origin: 'synthetic', description: 'Denatüre Alkol. Cildi kurutur ve bariyeri zayıflatabilir. Emilimi artırır.' },
    'fragrance': { risk: 'moderate', origin: 'synthetic', description: 'Parfüm. İçeriği ticari sırdır. Alerji ve baş ağrısı tetikleyicisi olabilir.' },
    'parfum': { risk: 'moderate', origin: 'synthetic', description: 'Bilinmeyen koku bileşenleri. Kontakt dermatit olasılığı.' },
    'perfume': { risk: 'moderate', origin: 'synthetic', description: 'Sentetik koku vericiler.' },
    'propylene glycol': { risk: 'moderate', origin: 'synthetic', description: 'Nem tutucu. Genellikle güvenlidir ancak egzama eğilimli ciltlerde tepki yapabilir.' },
    'talc': { risk: 'moderate', origin: 'natural', description: 'Talk minerali. Asbestten iyi arındırılmamışsa sağlık endişesi taşır. Solunmamalı.' },
    'edta': { risk: 'low', origin: 'synthetic', description: 'Şelasyon ajanı. Cilt emilimini artırabilir.' },
    'disodium edta': { risk: 'low', origin: 'synthetic', description: 'Cilt emilimini artırabilir.' },
    'tetrasodium edta': { risk: 'low', origin: 'synthetic', description: 'Şelasyon ajanı. Cilt bariyerini etkileyebilir.' },
    'phenoxyethanol': { risk: 'moderate', origin: 'synthetic', description: 'Paraben alternatifi koruyucu. Yüksek konsantrasyonda tahriş edici.' },
    'limonene': { risk: 'moderate', origin: 'natural', description: 'Narenciye kabuğunda bulunur. Havayla temas edip okside olursa alerjenleşir.' },
    'linalool': { risk: 'moderate', origin: 'natural', description: 'Lavanta bileşeni. Doğal olsa da yaygın bir temas alerjenidir.' },
    'citronellol': { risk: 'moderate', origin: 'natural', description: 'Gül kokusu veren doğal bileşen. Alerjen potansiyeli.' },
    'geraniol': { risk: 'moderate', origin: 'natural', description: 'Itır çiçeği bileşeni. Hassas ciltlerde reaksiyon yapabilir.' },
    'retinol': { risk: 'moderate', origin: 'synthetic', description: 'A Vitamini. Çok etkilidir ancak cildi soyar, kızartır ve güneşe duyarlı yapar.' },
    'salicylic acid': { risk: 'moderate', origin: 'natural', description: 'BHA. Gözenek temizler ancak aşırı kullanımda kuruluk ve soyulma yapar.' },
    'glycolic acid': { risk: 'moderate', origin: 'natural', description: 'AHA. Cildi yeniler ama güneş hassasiyetini ciddi oranda artırır.' },
    'benzophenone': { risk: 'moderate', origin: 'synthetic', description: 'Kimyasal güneş filtresi. Hormon taklidi yapma şüphesi.' },
    'oxybenzone': { risk: 'moderate', origin: 'synthetic', description: 'Güneş koruyucu. Ciltten kana karışabilir ve hormon etkisi yapabilir.' },
    'homosalate': { risk: 'moderate', origin: 'synthetic', description: 'Kimyasal filtre. Vücutta birikme potansiyeli vardır.' },
    'octocrylene': { risk: 'moderate', origin: 'synthetic', description: 'Güneş koruyucu. Alerjik reaksiyonlara neden olabilir.' },
    'peg': { risk: 'moderate', origin: 'synthetic', description: 'Polietilen Glikol. 1,4-dioxane kirliliği şüphesi taşır. İnsan sağlığı için limitli kullanımı önerilir.' },
    'ceteareth-20': { risk: 'moderate', origin: 'synthetic', description: 'Emülgatör. 1,4-dioxane ve etilen oksit kalıntı şüphesi taşıyabilir.' },
    '1,2-hexanediol': { risk: 'low', origin: 'synthetic', description: 'Güvenli çözücü ve koruyucu yardımcı.' },
    'carbomer': { risk: 'low', origin: 'synthetic', description: 'Kıvam artırıcı polimer. Ciltte kalıntı bırakmaz, güvenlidir.' },
    'pentylene glycol': { risk: 'low', origin: 'synthetic', description: 'Nemlendirici ve koruyucu. Hassas ciltler için güvenlidir.' },
    'sodium hydroxide': { risk: 'moderate', origin: 'synthetic', description: 'pH ayarlayıcı. Yüksek dozda tahriş edicidir, ürünlerde nötralize edilir.' },
    'arginine': { risk: 'low', origin: 'bio-identical', description: 'Amino asit. Cildi onarır ve nemlendirir.' },
    'chlorphenesin': { risk: 'moderate', origin: 'synthetic', description: 'Koruyucu. Bazı ciltlerde hassasiyet yapabilir.' },
    'dipropylene glycol': { risk: 'low', origin: 'synthetic', description: 'Çözücü ve viskozite düzenleyici.' },
    'hydrogenated lecithin': { risk: 'low', origin: 'natural', description: 'Soya bazlı cilt yumuşatıcı ve onarıcı.' },
    'adenosine': { risk: 'low', origin: 'bio-identical', description: 'Maya kökenli yaşlanma karşıtı bileşen.' },
    'acrylates/c10-30 alkyl acrylate crosspolymer': { risk: 'low', origin: 'synthetic', description: 'Stabilizatör polimer. Güvenlidir.' },
    'peg-100 stearate': { risk: 'moderate', origin: 'synthetic', description: 'PEG türevi yumuşatıcı. 1,4-dioxane kirliliği şüphesi taşır.' },
    'hydroxyacetophenone': { risk: 'low', origin: 'synthetic', description: 'Antioksidan ve yatıştırıcı.' },
    'hydroxyethylcellulose': { risk: 'low', origin: 'natural', description: 'Selüloz türevi doğal kıvam artırıcı.' },
    'polysorbate 20': { risk: 'moderate', origin: 'synthetic', description: 'Emülgatör. Kirlilik şüphesi (Etilen oksit) taşıyabilir.' },
    'polysorbate 60': { risk: 'moderate', origin: 'synthetic', description: 'Emülgatör. Kirlilik şüphesi taşıyabilir.' },

    // LOW RISK (Yeşil Listesi - Güvenli)
    'water': { risk: 'low', origin: 'natural', description: 'Saf su. En temel ve zararsız çözücü.' },
    'aqua': { risk: 'low', origin: 'natural', description: 'Su. Hayat kaynağı, kozmetiklerin bazı.' },
    'glycerin': { risk: 'low', origin: 'natural', description: 'Bitkisel veya hayvansal yağlardan elde edilen klasik nemlendirici.' },
    'hyaluronic acid': { risk: 'low', origin: 'bio-identical', description: 'Cildin kendi yapısında bulunur. Ağırlığının 1000 katı su tutar.' },
    'sodium hyaluronate': { risk: 'low', origin: 'bio-identical', description: 'Hyaluronik asidin tuzu. Derine daha iyi iner.' },
    'niacinamide': { risk: 'low', origin: 'synthetic', description: 'B3 Vitamini. Bariyeri onarır, gözenekleri sıkılaştırır, leke açar.' },
    'ceramide': { risk: 'low', origin: 'bio-identical', description: 'Cilt hücrelerini bir arada tutan harç. Bariyer için kritiktir.' },
    'panthenol': { risk: 'low', origin: 'synthetic', description: 'Pro-Vitamin B5. Cildi yatıştırır, onarır ve nemlendirir.' },
    'tocopherol': { risk: 'low', origin: 'natural', description: 'Saf E Vitamini. Cildi oksitlenmeye (yaşlanmaya) karşı korur.' },
    'ascorbic acid': { risk: 'low', origin: 'natural', description: 'Saf C Vitamini. Kollajen üretimini destekler, cildi aydınlatır.' },
    'shea butter': { risk: 'low', origin: 'natural', description: 'Karite ağacı yağı. Yoğun onarıcı ve besleyicidir.' },
    'butyrospermum parkii': { risk: 'low', origin: 'natural', description: 'Shea Yağı (Latincesi). Cildi yumuşatır.' },
    'aloe barbadensis': { risk: 'low', origin: 'natural', description: 'Aloe Vera. Güneş yanığı ve tahriş için birebir yatıştırıcı.' },
    'jojoba': { risk: 'low', origin: 'natural', description: 'Jojoba yağı. Cildin kendi sebumuna en yakın yağdır. Gözenek tıkamaz.' },
    'squalane': { risk: 'low', origin: 'natural', description: 'Zeytinden veya şeker kamışından elde edilen hafif, uyumlu yağ.' },
    'centella asiatica': { risk: 'low', origin: 'natural', description: 'Gotu Kola. Yara iyileştirici ve kızarıklık giderici efsanevi bitki.' },
    'allantoin': { risk: 'low', origin: 'natural', description: 'Karakafes otundan elde edilen, tahriş önleyici bileşen.' },
    'zinc oxide': { risk: 'low', origin: 'natural', description: 'Mineral filtre ve cilt koruyucu.' },
    'titanium dioxide': { risk: 'low', origin: 'natural', description: 'Mineral güneş koruyucu (nano olmayan).' },
    'caprylic/capric triglyceride': { risk: 'low', origin: 'natural', description: 'Hindistan cevizinden türetilen, yağlı his bırakmayan nemlendirici.' },
    'cetearyl alcohol': { risk: 'low', origin: 'natural', description: 'Bitkisel kaynaklı yağ alkolü. Cildi yumuşatır, kurutmaz.' },
    'stearic acid': { risk: 'low', origin: 'natural', description: 'Bitkisel yağ asidi. Kremlere kıvam verir.' },
    'xanthan gum': { risk: 'low', origin: 'natural', description: 'Şekerin fermantasyonuyla elde edilen doğal kıvam artırıcı.' },
    'kaolin': { risk: 'low', origin: 'natural', description: 'Doğal beyaz kil. Yağı dengeler, nazikçe temizler.' },
    'green tea': { risk: 'low', origin: 'natural', description: 'Yeşil çay. Antioksidan deposudur, cildi sakinleştirir.' },
    'camellia sinensis': { risk: 'low', origin: 'natural', description: 'Çay bitkisi. Polifenol bakımından zengindir.' },
    'lactic acid': { risk: 'low', origin: 'natural', description: 'Sütten veya bitkilerden elde edilen nazik AHA. Nem verir.' },
    'silica': { risk: 'low', origin: 'natural', description: 'Doğal mineral. Fazla yağı emer, matlaştırır.' },
    'caprylyl glycol': { risk: 'low', origin: 'synthetic', description: 'Hindistan cevizinden de türetilebilir. Hem nemlendirici hem koruyucu.' },
    'dimethicone': { risk: 'low', origin: 'synthetic', description: 'En yaygın silikon. Cildin üstünü kaplar, pürüzsüz gösterir. Toksik değildir.' },
    'ethylhexylglycerin': { risk: 'low', origin: 'synthetic', description: 'Doğal koruyucuları güçlendiren güvenli bir katkı maddesi.' },
    'mica': { risk: 'low', origin: 'natural', description: 'Doğal taş tozu. Ürünlere ışıltı ve parlaklık katar.' },
    'tocopheryl acetate': { risk: 'low', origin: 'synthetic', description: 'E Vitamininin daha stabil formu. Antioksidan etkilidir.' },
    'butylene glycol': { risk: 'low', origin: 'synthetic', description: 'Güvenli çözücü. Dokuyu inceltir ve nemi çeker.' },
    'citric acid': { risk: 'low', origin: 'natural', description: 'Limon tuzu asidi. pH dengesini ayarlar.' },
    'potassium sorbate': { risk: 'low', origin: 'synthetic', description: 'Gıda ürünlerinde de kullanılan hafif bir koruyucu.' },
    'sodium benzoate': { risk: 'low', origin: 'synthetic', description: 'Doğada yaban mersininde bulunur. Güvenli koruyucu.' },
    'lecithin': { risk: 'low', origin: 'natural', description: 'Soya veya ayçiçeğinden elde edilir. Hücre zarlarını onarır.' },
    'glyceryl stearate': { risk: 'low', origin: 'natural', description: 'Bitkisel yağlardan elde edilen kıvam verici.' },
    'sodium chloride': { risk: 'low', origin: 'natural', description: 'Sofra tuzu. Şampuanlarda kıvam artırır.' },
    'propanediol': { risk: 'low', origin: 'natural', description: 'Mısır şekerinden elde edilen nemlendirici solvent.' },
    'magnesium stearate': { risk: 'low', origin: 'natural', description: 'Pudraların topaklanmasını önleyen mineral tuz.' },

    'phytosterols': { risk: 'low', origin: 'natural', description: 'Bitkisel kolesterol. Cilt bariyerini güçlendirir.' },
    'betaine': { risk: 'low', origin: 'natural', description: 'Pancar kökenli nemlendirici.' },
    'c12-15 alkyl benzoate': { risk: 'low', origin: 'synthetic', description: 'Yumuşatıcı ester. Yağlı his bırakmaz.' },
    'ceramide np': { risk: 'low', origin: 'bio-identical', description: 'Cilt bariyeri onarıcı seramid.' },
    'cetyl alcohol': { risk: 'low', origin: 'natural', description: 'Yağ alkolü. Cildi yumuşatır, tahriş etmez.' },
    'alcohol denat.': { risk: 'moderate', origin: 'synthetic', description: 'Kurutucu alkol. Cilt bariyerine zarar verebilir.' },
    'polyglyceryl-10 laurate': { risk: 'low', origin: 'natural', description: 'Bitkisel emülgatör.' },
    'stearyl alcohol': { risk: 'low', origin: 'natural', description: 'Yağ alkolü. Yumuşatıcı.' },
    'coco-caprylate/caprate': { risk: 'low', origin: 'natural', description: 'Hindistan cevizi kökenli silikon alternatifi.' },
    'sodium hyaluronate crosspolymer': { risk: 'low', origin: 'bio-identical', description: 'Çapraz bağlı hyaluronik asit. Uzun süre nem verir.' },
    'tromethamine': { risk: 'low', origin: 'synthetic', description: 'pH ayarlayıcı organik amin.' },
    'cocamidopropyl betaine': { risk: 'moderate', origin: 'synthetic', description: 'Köpürtücü. Safsızlık varsa alerji potansiyeli olabilir.' },
    'tocopheryl glucoside': { risk: 'low', origin: 'synthetic', description: 'E vitamini türevi antioksidan.' },
    'sodium acetylated hyaluronate': { risk: 'low', origin: 'bio-identical', description: 'Süper hyaluronik asit. Daha iyi emilir.' },
    'bis-ethylhexyloxyphenol methoxyphenyl triazine': { risk: 'low', origin: 'synthetic', description: 'Yeni nesil güvenli güneş filtresi (Tinosorb S).' },
    'sodium polyacrylate': { risk: 'low', origin: 'synthetic', description: 'Süper emici polimer.' },
    'sorbitan isostearate': { risk: 'low', origin: 'natural', description: 'Bitkisel emülgatör.' },
    'sodium citrate': { risk: 'low', origin: 'natural', description: 'Limon tuzu tuzu. pH dengeler.' },
    'erythritol': { risk: 'low', origin: 'natural', description: 'Fermente şeker nemlendirici.' },
    'butyl methoxydibenzoylmethane': { risk: 'moderate', origin: 'synthetic', description: 'Avobenzone. Güneş koruyucu. Stabilite sorunu olabilir.' },
    'potassium cetyl phosphate': { risk: 'low', origin: 'synthetic', description: 'Emülgatör.' },
    'ethylhexyl triazone': { risk: 'low', origin: 'synthetic', description: 'Güvenli UVB filtresi.' },
    'sorbitol': { risk: 'low', origin: 'natural', description: 'Meyve şekeri nemlendirici.' },
    'octyldodecanol': { risk: 'low', origin: 'synthetic', description: 'Yağ alkolü yumuşatıcı.' },
    'triethanolamine': { risk: 'moderate', origin: 'synthetic', description: 'pH ayarlayıcı. Alerjen potansiyeli ve nitrosamin riski.' },
    'sodium pca': { risk: 'low', origin: 'natural', description: 'Cildin doğal nem faktörü.' },
    'madecassoside': { risk: 'low', origin: 'natural', description: 'Centella asiatica özü. Güçlü onarıcı.' },
    'glucose': { risk: 'low', origin: 'natural', description: 'Şeker. Nem bağlayıcı.' },
    'glyceryl stearate se': { risk: 'low', origin: 'natural', description: 'Kendi kendine emülsiyon yapan form.' },
    'cholesterol': { risk: 'low', origin: 'bio-identical', description: 'Cilt bariyeri bileşeni.' },
    'cellulose gum': { risk: 'low', origin: 'natural', description: 'Selüloz sakızı.' },
    'beeswax': { risk: 'low', origin: 'natural', description: 'Balmumu. Koruyucu tabaka oluşturur.' },
    'cera alba': { risk: 'low', origin: 'natural', description: 'Balmumu.' },
    'dimethicone/vinyl dimethicone crosspolymer': { risk: 'low', origin: 'synthetic', description: 'Silikon elastomer. İpeksi his verir.' },
};

// Generic checks for classes of ingredients if strict match fails
const SUFFIX_RISKS: Record<string, SafetyRating> = {
    'paraben': { risk: 'high', origin: 'synthetic', description: 'Paraben türevi koruyucu.' },
    'ethicone': { risk: 'moderate', origin: 'synthetic', description: 'Silikon türevi. Ciltte birikme yapabilir, geri dönüştürülemez.' },
    'siloxane': { risk: 'moderate', origin: 'synthetic', description: 'Silikon türevi bileşik.' },
    'extract': { risk: 'low', origin: 'natural', description: 'Bitkisel öz (Ekstrakt).' },
    'oil': { risk: 'low', origin: 'natural', description: 'Doğal veya bitkisel yağ.' },
    'ferment': { risk: 'low', origin: 'natural', description: 'Fermantasyon ürünü (Probiyotik).' },
    'water': { risk: 'low', origin: 'natural', description: 'Su bazlı bileşen.' },
    'acid': { risk: 'low', origin: 'synthetic', description: 'Asit bileşeni (pH düzenleyici).' },
};


import scientificDb from '../../data/scientific_ingredients.json';
import bulkDb from './ingredients.json';

// Map Scientific DB to easy lookup
const DB_INGREDIENTS: Record<string, SafetyRating> = {};

// 1. Load High-Quality Scientific Data (ECHA/Prop65)
(scientificDb as any[]).forEach(item => {
    let risk: RiskLevel = 'low';
    if (item.risk_score >= 7) risk = 'high';
    else if (item.risk_score >= 4) risk = 'moderate';

    let origin: Origin = 'unknown';
    if (item.tags.includes('vitamin') || item.tags.includes('natural')) origin = 'natural';

    DB_INGREDIENTS[item.name.toLowerCase()] = {
        risk,
        origin,
        description: item.analysis
    };
});

// 2. Load Bulk Data (Sebamed & others)
(bulkDb as any[]).forEach(item => {
    const lowerName = item.name.toLowerCase();
    if (!DB_INGREDIENTS[lowerName]) {
        let risk: RiskLevel = 'low';
        if (item.risk_score >= 7) risk = 'high';
        else if (item.risk_score >= 4) risk = 'moderate';

        let origin: Origin = 'unknown';
        if (Array.isArray(item.tags)) {
            if (item.tags.includes('vitamin') || item.tags.includes('natural')) origin = 'natural';
        }

        DB_INGREDIENTS[lowerName] = {
            risk,
            origin,
            description: item.analysis || 'Analiz edildi.'
        };
    }
});

// Normalization Helper for Turkish Characters
const TURKISH_TO_INCI: Record<string, string> = {
    'su': 'aqua',
    'gliserin': 'glycerin',
    'dibütil adipat': 'dibutyl adipate',
    'oktokrilen': 'octocrylene',
    'titanyum dioksit': 'titanium dioxide',
    'c12-15 alkil benzoat': 'c12-15 alkyl benzoate',
    'bütil metoksidibenzoilmetan': 'butyl methoxydibenzoylmethane',
    'dietilamino hidroksibenzoil heksil benzoat': 'diethylamino hydroxybenzoyl hexyl benzoate',
    'vp/eikosen kopolimer': 'vp/eicosene copolymer',
    'pantenol': 'panthenol',
    'mikrokristalin selüloz': 'microcrystalline cellulose',
    'tokoferil asetat': 'tocopheryl acetate',
    'bis-etilheksiloksifenol metoksifenil triazin': 'bis-ethylhexyloxyphenol methoxyphenyl triazine',
    'etilheksilgliserin': 'ethylhexylglycerin',
    'silika': 'silica',
    'benzil alkol': 'benzyl alcohol',
    'selüloz sakızı': 'cellulose gum',
    'parfüm': 'parfum',
    'gliseril stearat': 'glyceryl stearate',
    'setearil alkol': 'cetearyl alcohol',
    'ksantan sakızı': 'xanthan gum',
    'sorbik asit': 'sorbic acid',
    'disodyum edta': 'disodium edta',
    'lauril glukosid': 'lauryl glucoside',
    'fenoksietanol': 'phenoxyethanol',
    'lesitin': 'lecithin'
};

function normalizeIngredientName(name: string): string {
    const lower = name.toLowerCase().trim();

    // 1. Direct Dictionary Lookup (Best for Turkish translations)
    if (TURKISH_TO_INCI[lower]) return TURKISH_TO_INCI[lower];

    // 2. Generic Character Normalization
    return lower
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .trim();
}

export function analyzeIngredient(ingredientName: string): SafetyRating {
    let lowerName = ingredientName.toLowerCase().trim();

    // Improved Cleaning: Remove content in parentheses, e.g., "Parkii (Shea) Butter" -> "Parkii Butter"
    // Also extract pure name if "Extract (Green tea)" etc.
    // Actually simplicity: remove all parenthesized text for lookup
    const cleanKey = lowerName.replace(/\([^\)]+\)/g, '').replace(/\s+/g, ' ').trim();

    const normalizedName = normalizeIngredientName(cleanKey);

    if (!cleanKey) return { risk: 'unknown', origin: 'unknown', description: 'Bilinmiyor' };

    // 0. CHECK MANUAL LIST FIRST (Highest Priority for Descriptions)
    // We want our custom written descriptions to override bulk DB data
    if (INGREDIENT_RISKS[lowerName]) return INGREDIENT_RISKS[lowerName];
    if (INGREDIENT_RISKS[cleanKey]) return INGREDIENT_RISKS[cleanKey];
    if (INGREDIENT_RISKS[normalizedName]) return INGREDIENT_RISKS[normalizedName];

    // 1. CHECK SCIENTIFIC DB (Try exact, then clean, then normalized)
    if (DB_INGREDIENTS[lowerName]) return DB_INGREDIENTS[lowerName];
    if (DB_INGREDIENTS[cleanKey]) return DB_INGREDIENTS[cleanKey];
    if (DB_INGREDIENTS[normalizedName]) return DB_INGREDIENTS[normalizedName];

    // 2. Partial match in dictionary keys
    for (const [key, rating] of Object.entries(INGREDIENT_RISKS)) {
        if (cleanKey.includes(key) || normalizedName.includes(key)) {
            return rating;
        }
    }

    // 3. Suffix/Category broad checks
    for (const [suffix, rating] of Object.entries(SUFFIX_RISKS)) {
        if (lowerName.endsWith(suffix) || lowerName.includes(suffix)) {
            return rating;
        }
    }

    // 4. Heuristics for Origin and Risk
    if (lowerName.includes('extract') || lowerName.includes('leaf') || lowerName.includes('root') || lowerName.includes('juice')) {
        return { risk: 'low', origin: 'natural', description: 'Bitkisel kaynaklı doğal içerik.' };
    }

    if (/\d/.test(lowerName) || lowerName.length > 25) {
        return { risk: 'unknown', origin: 'synthetic', description: 'Sentetik yapılı karmaşık bileşen.' };
    }

    return { risk: 'unknown', origin: 'unknown', description: 'Analiz edilemedi.' };
}

export function analyzeProductIngredients(ingredientsText: string) {
    if (!ingredientsText) return { totalRisk: 'unknown' as RiskLevel, naturalScore: 0, healthScore: 0, analysis: [] };

    const rawList = ingredientsText.split(/,|;/).filter(s => s.trim().length > 1);
    const list = rawList.map(s => s.trim().replace(/\.$/, ''));

    const analysis = list.map(name => ({
        name,
        rating: analyzeIngredient(name)
    }));

    const highRisks = analysis.filter(i => i.rating.risk === 'high').length;
    const moderateRisks = analysis.filter(i => i.rating.risk === 'moderate').length;

    let totalRisk: RiskLevel = 'low';
    if (highRisks > 0) totalRisk = 'high';
    else if (moderateRisks > 2) totalRisk = 'moderate';

    let naturalPoints = 0;
    let healthScore = 100;

    analysis.forEach(i => {
        // Natural Score Calc
        if (i.rating.origin === 'natural') naturalPoints += 1;
        else if (i.rating.origin === 'bio-identical') naturalPoints += 0.8;

        // Health Score Calc
        if (i.rating.risk === 'high') healthScore -= 20;
        else if (i.rating.risk === 'moderate') healthScore -= 5;
    });

    const naturalScore = analysis.length > 0
        ? Math.round((naturalPoints / analysis.length) * 100)
        : 0;

    healthScore = Math.max(0, healthScore);

    return { totalRisk, naturalScore, healthScore, analysis };
}
