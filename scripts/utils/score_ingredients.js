const fs = require('fs');
const path = require('path');

const INGREDIENTS_FILE = path.join(__dirname, '../../data/unique_ingredients.json');
const OUTPUT_CSV = path.join(__dirname, '../../data/scored_ingredients.csv');

// --- Expanded Dictionary (Zero Error Approach) ---
const SCORE_DB = {
    // === Solvents, Bases & Humectants ===
    "water": { score: 1, note: "Essential solvent, neutral." },
    "aqua": { score: 1, note: "Essential solvent, neutral." },
    "su": { score: 1, note: "Water (Turkish)." },
    "fenoksietanol": { score: 4, note: "Phenoxyethanol (Turkish). Preservative." },
    "parfüm": { score: 8, note: "Fragrance (Turkish). High allergy risk." },
    "parfum/fragrance": { score: 8, note: "Fragrance. High allergy risk." },
    "aroma": { score: 8, note: "Flavor/Fragrance. Potential allergen." },
    "glycerin": { score: 1, note: "Excellent humectant, safe." },
    "betaine": { score: 1, note: "Gentle hydrating amino acid derivative." },
    "coco-betaine": { score: 4, note: "Surfactant. Impurities concern." },
    "coco-caprylate/caprate": { score: 1, note: "Safe emollient." },
    "butylene glycol dicaprylate/dicaprate": { score: 1, note: "Safe emollient." },
    "alcohol denat": { score: 5, note: "Drying alcohol." },
    "alcohol denat.": { score: 5, note: "Drying alcohol." },
    "aluminum hydroxide": { score: 1, note: "Safe texture enhancer/opacifier." },
    "alumina": { score: 1, note: "Safe anticaking agent." },
    "cholesterol": { score: 1, note: "Skin-identical lipid, safe." },
    "sodium pca": { score: 1, note: "Skin-identical humectant, safe." },
    "zinc pca": { score: 1, note: "Sebum regulating, safe." },
    "biotin": { score: 1, note: "Vitamin B7, safe." },
    "cyanocobalamin": { score: 1, note: "Vitamin B12, safe (pink color)." },
    "riboflavin": { score: 1, note: "Vitamin B2, safe (yellow color)." },
    "pyridoxine hcl": { score: 1, note: "Vitamin B6, safe." },
    "polyisobutene": { score: 1, note: "Synthetic polymer, safe." },
    "hydrogenated poly(c6-14 olefin)": { score: 1, note: "Safe synthetic emollient." },
    "isododecane": { score: 1, note: "Volatile emollient, safe." },
    "papain": { score: 3, note: "Enzyme exfoliant. Potential irritant." },
    "cetyl ethylhexanoate": { score: 1, note: "Safe emollient." },
    "triethoxycaprylylsilane": { score: 1, note: "Silicone coating for pigments. Safe." },
    "black strap powder": { score: 1, note: "Sugar extract exfoliant." },
    "cetearyl olivate": { score: 1, note: "Safe emulsifier." },
    "hydrolyzed sodium hyaluronate": { score: 1, note: "Low MW Hyaluronic Acid." },
    "hydroxypropyltrimonium hyaluronate": { score: 1, note: "Conditioning HA." },
    "potassium hyaluronate": { score: 1, note: "Hyaluronic Acid salt." },
    "sodium acetylated hyaluronate": { score: 1, note: "Modified HA." },
    "paraffinum liquidum": { score: 1, note: "Mineral Oil. Safe, occlusive." },
    "beeswax": { score: 1, note: "Natural wax, safe." },
    "cera alba": { score: 1, note: "Beeswax, safe." },
    "methionine": { score: 1, note: "Amino acid." },
    "cysteine": { score: 1, note: "Amino acid." },
    "hydroxyethyl urea": { score: 1, note: "Humectant." },
    "dextrin": { score: 1, note: "Carbohydrate, thickener." },
    "maltodextrin": { score: 1, note: "Carbohydrate, thickener." },
    "anhydroxylitol": { score: 1, note: "Humectant, sugar derived." },
    "xylitylglucoside": { score: 1, note: "Humectant, sugar derived." },
    "saccharide isomerate": { score: 1, note: "Humectant, sugar derived." },
    "dimethiconol": { score: 1, note: "Silicone gum. Safe." },
    "diethylhexyl butamido triazone": { score: 1, note: "Uvasorb HEB. Safe UV filter." },
    "trisodium edta": { score: 1, note: "Chelating agent." },
    "pentaerythrityl tetraethylhexanoate": { score: 1, note: "Thickener/Emollient." },
    "cellulose": { score: 1, note: "Natural thickener." },
    "bis-diglyceryl polyacyladipate-2": { score: 1, note: "Lanolin substitute, safe." },
    "barium sulfate": { score: 1, note: "Opacifier, safe." },
    "rosin": { score: 4, note: "Binder. Potential allergen." },
    "biosaccharide gum-4": { score: 1, note: "Anti-pollution film former." },
    "sodium c14-16 olefin sulfonate": { score: 4, note: "Strong surfactant. Potential irritant." },
    "behentrimonium methosulfate": { score: 2, note: "Conditioning agent. Mild." },
    "potassium cocoyl glycinate": { score: 1, note: "Gentle amino acid surfactant." },
    "hydrated silica": { score: 1, note: "Abrasive/Thickener." },
    "diisostearyl malate": { score: 1, note: "Emollient." },
    "butylene glycol": { score: 1, note: "Safe solvent/humectant (CIR evaluated)." },
    "pentylene glycol": { score: 1, note: "Safe solvent/humectant." },
    "propanediol": { score: 1, note: "Safe solvent, often corn-derived." },
    "caprylic/capric triglyceride": { score: 1, note: "Safe emollient from coconut oil." },
    "1,2-hexanediol": { score: 1, note: "Safe preservative booster/solvent." },
    "2-hexanediol": { score: 1, note: "Safe preservative booster/solvent." },
    "hexanediol": { score: 1, note: "Safe solvent." },
    "dipropylene glycol": { score: 1, note: "Safe solvent." },
    "propylene glycol": { score: 1, note: "Safe solvent/humectant." },
    "methylpropanediol": { score: 1, note: "Safe solvent, penetration enhancer." },
    "caprylyl glycol": { score: 1, note: "Safe humectant/preservative booster." },
    "squalane": { score: 1, note: "Skin-identical emollient, highly stable." },
    "squalene": { score: 1, note: "Natural lipid, unstable (oxidizes)." },
    "isopentyldiol": { score: 1, note: "Safe humectant." },
    "ethylhexyl palmitate": { score: 1, note: "Emollient, potential comedogenic." },
    "isopropyl myristate": { score: 2, note: "Emollient, comedogenic potential." },
    "isopropyl palmitate": { score: 2, note: "Emollient, comedogenic potential." },
    "dicaprylyl carbonate": { score: 1, note: "Fast-spreading emollient." },
    "dicaprylyl ether": { score: 1, note: "Safe emollient." },
    "isohexadecane": { score: 1, note: "Safe texture enhancer, solvent." },
    "hydrogenated polyisobutene": { score: 1, note: "Synthetic emollient, mineral oil substitute." },
    "triethylhexanoin": { score: 1, note: "Safe emollient." },
    "octyldodecanol": { score: 1, note: "Fatty alcohol, safe emollient." },
    "c12-15 alkyl benzoate": { score: 1, note: "Safe emollient, dispersant." },
    "dibutyl adipate": { score: 1, note: "Solvent for UV filters, safe." },
    "undecane": { score: 1, note: "Volatile emollient." },
    "tridecane": { score: 1, note: "Volatile emollient." },
    "dodecane": { score: 1, note: "Volatile emollient." },
    "glucose": { score: 1, note: "Humectant, sugar." },
    "trehalose": { score: 1, note: "Plant sugar, hydration." },
    "erythritol": { score: 1, note: "Sugar alcohol, humectant." },
    "sorbitol": { score: 1, note: "Sugar alcohol, humectant." },
    "xylitol": { score: 1, note: "Sugar alcohol, humectant." },
    "raffinose": { score: 1, note: "Sugar, humectant." },

    // === Actives, Vitamins & Antioxidants ===
    "niacinamide": { score: 1, note: "Safe, effective vitamin B3." },
    "panthenol": { score: 1, note: "Safe provitamin B5, soothing." },
    "sodium hyaluronate": { score: 1, note: "Safe humectant." },
    "hydrolyzed hyaluronic acid": { score: 1, note: "Low molecular weight HA." },
    "sodium acetylated hyaluronate": { score: 1, note: "Modified HA, deep hydration." },
    "hyaluronic acid": { score: 1, note: "Safe humectant." },
    "ceramide np": { score: 1, note: "Skin-identical lipid, safe." },
    "ceramide ap": { score: 1, note: "Skin-identical lipid, safe." },
    "ceramide eop": { score: 1, note: "Skin-identical lipid, safe." },
    "ceramide ns": { score: 1, note: "Skin-identical lipid, safe." },
    "phytosphingosine": { score: 1, note: "Lipid, antimicrobial, soothing." },
    "adenosine": { score: 1, note: "Soothing, anti-wrinkle active." },
    "allantoin": { score: 1, note: "Soothing, skin protectant." },
    "tocopherol": { score: 1, note: "Vitamin E, safe antioxidant." },
    "tocopheryl acetate": { score: 1, note: "Vitamin E derivative, safe." },
    "tocopheryl glucoside": { score: 1, note: "Stable Vitamin E, soothing." },
    "ascorbic acid": { score: 1, note: "Vitamin C, safe." },
    "magnesium ascorbyl phosphate": { score: 1, note: "Stable Vitamin C." },
    "sodium ascorbyl phosphate": { score: 1, note: "Stable Vitamin C." },
    "retinol": { score: 9, note: "Potent anti-aging. Restricted in EU/pregnancy. Irritant." },
    "retinyl palmitate": { score: 8, note: "Weaker retinoid, debated safety in sun." },
    "bakuchiol": { score: 1, note: "Natural retinol alternative, safe." },
    "salicylic acid": { score: 3, note: "Safe in limited concentrations. BHA Exfoliant." },
    "capryloyl salicylic acid": { score: 1, note: "LHA, gentle exfoliant." },
    "glycolic acid": { score: 3, note: "Safe in limited concentrations. AHA Exfoliant." },
    "lactic acid": { score: 2, note: "Safe AHA exfoliant/humectant." },
    "citric acid": { score: 2, note: "pH adjuster, AHA. Safe." },
    "malic acid": { score: 2, note: "AHA Exfoliant." },
    "tartaric acid": { score: 2, note: "AHA Exfoliant." },
    "gluconolactone": { score: 1, note: "PHA Exfoliant, gentle." },
    "lactobionic acid": { score: 1, note: "PHA Exfoliant, gentle." },
    "madecassoside": { score: 1, note: "Active from Centella, healing." },
    "asiaticoside": { score: 1, note: "Active from Centella, healing." },
    "madecassic acid": { score: 1, note: "Active from Centella, healing." },
    "asiatic acid": { score: 1, note: "Active from Centella, healing." },
    "bisabolol": { score: 1, note: "Soothing chamomile derivative." },
    "ubiquinone": { score: 1, note: "Coenzyme Q10, antioxidant." },
    "resveratrol": { score: 1, note: "Potent antioxidant." },
    "ferulic acid": { score: 1, note: "Antioxidant, stabilizes Vit C." },
    "glutathione": { score: 1, note: "Antioxidant, brightening." },
    "caffeine": { score: 1, note: "Antioxidant, circulation." },
    "dipotassium glycyrrhizate": { score: 1, note: "Licorice root active, soothing." },
    "beta-glucan": { score: 1, note: "Soothing, hydrating polysaccharide." },
    "soluble collagen": { score: 1, note: "Humectant, water binding." },
    "hydrolyzed collagen": { score: 1, note: "Humectant." },

    // === Amino Acids ===
    "arginine": { score: 1, note: "Amino acid, skin replenishing." },
    "glycine": { score: 1, note: "Amino acid." },
    "serine": { score: 1, note: "Amino acid." },
    "alanine": { score: 1, note: "Amino acid." },
    "isoleucine": { score: 1, note: "Amino acid." },
    "proline": { score: 1, note: "Amino acid." },
    "threonine": { score: 1, note: "Amino acid." },
    "histidine": { score: 1, note: "Amino acid." },
    "phenylalanine": { score: 1, note: "Amino acid." },
    "valine": { score: 1, note: "Amino acid." },
    "lysine": { score: 1, note: "Amino acid." },
    "leucine": { score: 1, note: "Amino acid." },

    // === Fatty Alcohols & Acids ===
    "cetearyl alcohol": { score: 1, note: "Fatty alcohol, safe emollient." },
    "cetyl alcohol": { score: 1, note: "Fatty alcohol, safe emollient." },
    "stearyl alcohol": { score: 1, note: "Fatty alcohol, safe emollient." },
    "behenyl alcohol": { score: 1, note: "Fatty alcohol, safe emollient." },
    "arachidyl alcohol": { score: 1, note: "Fatty alcohol, safe emollient." },
    "lauryl alcohol": { score: 1, note: "Fatty alcohol." },
    "myristyl alcohol": { score: 1, note: "Fatty alcohol." },
    "stearic acid": { score: 1, note: "Fatty acid, safe emollient/emulsifier." },
    "palmitic acid": { score: 1, note: "Fatty acid, safe emollient." },
    "myristic acid": { score: 1, note: "Fatty acid, safe emollient." },
    "lauric acid": { score: 1, note: "Fatty acid, potential clogging but safe." },
    "oleic acid": { score: 1, note: "Fatty acid, barrier disruption potential." },
    "linoleic acid": { score: 1, note: "Omega-6 fatty acid, barrier repair." },
    "linolenic acid": { score: 1, note: "Omega-3 fatty acid, barrier repair." },

    // === Emulsifiers & Surfactants ===
    "glyceryl stearate": { score: 1, note: "Safe emollient/emulsifier." },
    "glyceryl stearate se": { score: 1, note: "Safe emollient/emulsifier." },
    "glyceryl caprylate": { score: 1, note: "Safe emollient/preservative." },
    "glyceryl behenate": { score: 1, note: "Safe thickener." },
    "glyceryl dibehenate": { score: 1, note: "Safe thickener." },
    "polyglyceryl-10 laurate": { score: 1, note: "Safe emulsifier." },
    "polyglyceryl-3 methylglucose distearate": { score: 1, note: "Safe emulsifier." },
    "polyglyceryl-2 triisostearate": { score: 1, note: "Safe emulsifier." },
    "polyglyceryl-4 laurate": { score: 1, note: "Safe emulsifier." },
    "sorbitan stearate": { score: 1, note: "Safe emulsifier." },
    "sorbitan isostearate": { score: 1, note: "Safe emulsifier." },
    "sorbitan olivate": { score: 1, note: "Safe emulsifier." },
    "sorbitan oleate": { score: 1, note: "Safe emulsifier." },
    "sorbitan sesquioleate": { score: 1, note: "Safe emulsifier." },
    "tribehenin": { score: 1, note: "Skin protectant." },
    "cetearyl glucoside": { score: 1, note: "Safe emulsifier." },
    "arachidyl glucoside": { score: 1, note: "Safe emulsifier." },
    "lauryl glucoside": { score: 1, note: "Gentle surfactant." },
    "decyl glucoside": { score: 1, note: "Gentle surfactant." },
    "coco-glucoside": { score: 1, note: "Gentle surfactant." },
    "caprylyl/capryl glucoside": { score: 1, note: "Gentle surfactant." },
    "sodium lauroyl lactylate": { score: 1, note: "Safe emulsifier." },
    "sodium stearoyl glutamate": { score: 1, note: "Safe emulsifier." },
    "potassium cetyl phosphate": { score: 1, note: "Safe emulsifier." },
    "hydrogenated lecithin": { score: 1, note: "Safe skin-restoring emulsifier." },
    "lecithin": { score: 1, note: "Safe skin-restoring emulsifier." },
    "sodium laureth sulfate": { score: 3, note: "Safe if purified (SLES), potential irritation." },
    "sodium lauryl sulfate": { score: 5, note: "Strong irritant potential (SLS)." },
    "cocamidopropyl betaine": { score: 4, note: "Safe, but impurities can cause allergy." },
    "polysorbate 20": { score: 3, note: "Safe emulsifier (PEG family)." },
    "polysorbate 60": { score: 3, note: "Safe emulsifier (PEG family)." },
    "polysorbate 80": { score: 3, note: "Safe emulsifier (PEG family)." },
    "ceteareth-20": { score: 3, note: "Emulsifier (PEG family)." },
    "ceteareth-12": { score: 3, note: "Emulsifier (PEG family)." },
    "peg-100 stearate": { score: 3, note: "Safe if purified. 1,4-dioxane concern." },
    "peg-40 hydrogenated castor oil": { score: 3, note: "Safe if purified." },
    "peg-60 hydrogenated castor oil": { score: 3, note: "Safe if purified." },
    "trideceth-6": { score: 3, note: "Emulsifier (PEG family)." },
    "trideceth-10": { score: 3, note: "Emulsifier (PEG family)." },

    // === Thickeners & Texturizers ===
    "carbomer": { score: 1, note: "Safe thickener (polymer)." },
    "xanthan gum": { score: 1, note: "Natural thickener, safe." },
    "cellulose gum": { score: 1, note: "Natural thickener, safe." },
    "hydroxyethylcellulose": { score: 1, note: "Safe thickener." },
    "acrylates/c10-30 alkyl acrylate crosspolymer": { score: 1, note: "Safe texture enhancer." },
    "sodium polyacrylate": { score: 1, note: "Safe texture enhancer." },
    "ammonium acryloyldimethyltaurate/vp copolymer": { score: 1, note: "Safe texture enhancer." },
    "polyacrylate crosspolymer-6": { score: 1, note: "Safe texture enhancer." },
    "dimethicone": { score: 1, note: "Safe skin protectant. Inert silicone." },
    "cyclopentasiloxane": { score: 3, note: "Safe for use, bioaccumulation concern in environment." },
    "cyclohexasiloxane": { score: 1, note: "Safe silicone." },
    "phenyl trimethicone": { score: 1, note: "Safe silicone." },
    "dimethicone/vinyl dimethicone crosspolymer": { score: 1, note: "Safe silicone elastomer." },
    "polymethylsilsesquioxane": { score: 1, note: "Safe silicone powder." },
    "silica": { score: 1, note: "Safe texture enhancer/absorbent." },
    "silica dimethyl silylate": { score: 1, note: "Bulking agent, safe." },
    "disteardimonium hectorite": { score: 1, note: "Safe suspending agent." },
    "trihydroxystearin": { score: 1, note: "Safe thickener." },
    "nylon-12": { score: 1, note: "Safe powder." },
    "polymethyl methacrylate": { score: 1, note: "Safe texture enhancer." },
    "synthetic wax": { score: 1, note: "Binding agent." },
    "glucomannan": { score: 1, note: "Natural thickener (Konjac)." },
    "biosaccharide gum-1": { score: 1, note: "Hydrating gum." },
    "clay": { score: 1, note: "Absorbent." },
    "kaolin": { score: 1, note: "Clay, safe." },
    "bentonite": { score: 1, note: "Clay, safe." },
    "talc": { score: 3, note: "Absorbent (Asbestos-free required)." },
    "perlite": { score: 1, note: "Safe absorbent mineral." },
    "tin oxide": { score: 2, note: "Bulking agent/Opacifier." },
    "synthetic fluorphlogopite": { score: 1, note: "Synthetic mica. Safe." },
    "petrolatum": { score: 1, note: "Vaseline. Excellent occlusive, safe if purified." },
    "paraffin": { score: 1, note: "Mineral wax, safe." },
    "microcrystalline wax": { score: 1, note: "Mineral wax, safe." },
    "ozokerite": { score: 1, note: "Mineral wax, safe." },
    "ceresin": { score: 1, note: "Mineral wax, safe." },
    "urea": { score: 1, note: "Humectant/Exfoliant (conc dependent)." },
    "hydroxyethyl urea": { score: 1, note: "Humectant." },
    "polyquaternium-7": { score: 3, note: "Antistatic. Potential impurity concern." },
    "polyquaternium-10": { score: 1, note: "Conditioning agent." },
    "polyquaternium-51": { score: 1, note: "Humectant." },
    "carrageenan": { score: 1, note: "Natural thickener." },
    "chondrus crispus powder": { score: 1, note: "Carrageenan source, algae." },
    "chondrus crispus": { score: 1, note: "Algae extract. Safe." },
    "sucrose": { score: 1, note: "Sugar. Humectant." },
    "inulin": { score: 1, note: "Prebiotic sugar." },
    "alpha-glucan oligosaccharide": { score: 1, note: "Prebiotic." },
    "cocamide mea": { score: 4, note: "Surfactant. Nitrosamine concern." },
    "cocamide mipa": { score: 4, note: "Surfactant. Nitrosamine concern." },
    "methylisothiazolinone": { score: 7, note: "Preservative. High allergen." },
    "methylchloroisothiazolinone": { score: 7, note: "Preservative. High allergen." },
    "dmdm hydantoin": { score: 7, note: "Formaldehyde releaser." },
    "imidazolidinyl urea": { score: 6, note: "Formaldehyde releaser." },
    "diazolidinyl urea": { score: 6, note: "Formaldehyde releaser." },
    "ceramide 1": { score: 1, note: "Ceramide EOP." },
    "ceramide 3": { score: 1, note: "Ceramide NP." },
    "ceramide 6 ii": { score: 1, note: "Ceramide AP." },

    // === Preservatives & Stabilizers ===
    "phenoxyethanol": { score: 4, note: "Safe up to 1%. Can be irritant (EU SCCS)." },
    "ethylhexylglycerin": { score: 1, note: "Safe preservative booster." },
    "chlorphenesin": { score: 3, note: "Safe preservative (restricted concentration)." },
    "sodium benzoate": { score: 3, note: "Safe food-grade preservative." },
    "benzoic acid": { score: 3, note: "Safe preservative." },
    "potassium sorbate": { score: 3, note: "Safe food-grade preservative." },
    "benzyl alcohol": { score: 5, note: "Preservative. Potential allergen." },
    "dehydroacetic acid": { score: 3, note: "Safe preservative." },
    "sorbic acid": { score: 3, note: "Safe preservative." },
    "disodium edta": { score: 1, note: "Safe chelating agent." },
    "tetrasodium edta": { score: 1, note: "Safe chelating agent." },
    "trisodium ethylenediamine disuccinate": { score: 1, note: "Biodegradable chelator, safe." },
    "sodium citrate": { score: 1, note: "pH adjuster/chelator." },
    "sodium phytate": { score: 1, note: "Natural chelator." },
    "hydroxyacetophenone": { score: 1, note: "Antioxidant/preservative booster." },
    "bht": { score: 6, note: "Antioxidant. Controversial (endocrine)." },
    "pentaerythrityl tetra-di-t-butyl hydroxyhydrocinnamate": { score: 1, note: "Safe antioxidant." },
    "sodium chloride": { score: 1, note: "Salt. Thickener." },
    "tromethamine": { score: 2, note: "pH adjuster. Generally safe." },
    "triethanolamine": { score: 4, note: "pH adjuster. Nitrosamine concern if impurities." },
    "sodium hydroxide": { score: 3, note: "Strong pH adjuster. Safe in formulated product." },
    "potassium hydroxide": { score: 3, note: "Strong pH adjuster. Safe in formulated product." },
    "alcohol": { score: 5, note: "Ethanol. Drying / penetration enhancer." },
    "alcohol denat.": { score: 5, note: "Drying alcohol." },
    "phenethyl alcohol": { score: 1, note: "Floral scent preservative." },
    "parabens": { score: 7, note: "Debated endocrine disruption potential." },
    "methylparaben": { score: 3, note: "Generally considered safe (EU)." },
    "triclosan": { score: 8, note: "Endocrine disruptor concern. Restricted." },

    // === Fragrance & Allergens ===
    "fragrance": { score: 8, note: "High allergy risk. Hidden ingredients." },
    "parfum": { score: 8, note: "High allergy risk. Hidden ingredients." },
    "parfm": { score: 8, note: "High allergy risk. Hidden ingredients." }, // Handle Turkish typoes
    "limonene": { score: 5, note: "Allergen (citrus oil component)." },
    "linalool": { score: 5, note: "Allergen (lavender oil component)." },
    "citronellol": { score: 5, note: "Allergen." },
    "geraniol": { score: 5, note: "Allergen." },
    "benzyl salicylate": { score: 5, note: "Fragrance allergen." },
    "hexyl cinnamal": { score: 5, note: "Fragrance allergen." },
    "citral": { score: 5, note: "Fragrance allergen." },
    "farnesol": { score: 5, note: "Fragrance allergen." },
    "eugenol": { score: 5, note: "Fragrance allergen." },
    "coumarin": { score: 5, note: "Fragrance allergen." },
    "alpha-isomethyl ionone": { score: 5, note: "Fragrance allergen." },
    "hydroxycitronellal": { score: 5, note: "Fragrance allergen." },
    "menthol": { score: 4, note: "Cooling, potential irritant." },

    // === Sunscreens ===
    "titanium dioxide": { score: 2, note: "Safe mineral UV filter (non-nano safest)." },
    "zinc oxide": { score: 2, note: "Safe mineral UV filter." },
    "ethylhexyl methoxycinnamate": { score: 5, note: "Chemical UV filter. Hormone concern." },
    "octocrylene": { score: 4, note: "Chemical UV filter. Allergen concern." },
    "homosalate": { score: 4, note: "Hormone concern in high doses." },
    "bis-ethylhexyloxyphenol methoxyphenyl triazine": { score: 1, note: "New generation stable UV filter (Tinosorb S)." },
    "ethylhexyl triazone": { score: 1, note: "New generation stable UV filter." },
    "butyl methoxydibenzoylmethane": { score: 2, note: "Avobenzone. Safe UVA filter." },
    "diethylamino hydroxybenzoyl hexyl benzoate": { score: 1, note: "Uvinul A Plus. Safe UVA filter." },
    "ethylhexyl salicylate": { score: 3, note: "Octisalate. Safe UVB filter." },
    "phenylbenzimidazole sulfonic acid": { score: 2, note: "Ensulizole. Safe UVB." },
    "methylene bis-benzotriazolyl tetramethylbutylphenol": { score: 1, note: "Tinosorb M. Safe UV filter." },

    // === Colors ===
    "ci 77891": { score: 1, note: "Titanium Dioxide (Color)." },
    "ci 77491": { score: 1, note: "Iron Oxides (Red)." },
    "ci 77492": { score: 1, note: "Iron Oxides (Yellow)." },
    "ci 77499": { score: 1, note: "Iron Oxides (Black)." },
    "mica": { score: 1, note: "Safe mineral shimmer." },

    // === Botanicals (Latin -> Common Mapping needed in normalization) ===
    "phytosterols": { score: 1, note: "Plant-derived skin-restoring ingredient." },
    "hamamelis virginiana water": { score: 2, note: "Witch Hazel. Astringent/Potential Irritant." },
    "aloe barbadensis leaf juice": { score: 1, note: "Aloe Vera. Soothing." },
    "melaleuca alternifolia leaf oil": { score: 3, note: "Tea Tree Oil. Acne-fighting, potential irritant." },
    "butyrospermum parkii butter": { score: 1, note: "Shea Butter. Excellent emollient." },
    "simmondsia chinensis seed oil": { score: 1, note: "Jojoba Oil. Skin-identical." },
    "helianthus annuus seed oil": { score: 1, note: "Sunflower Oil. Safe emollient." },
    "olea europaea fruit oil": { score: 1, note: "Olive Oil. Safe emollient." },
    "prunus amygdalus dulcis oil": { score: 1, note: "Sweet Almond Oil. Safe emollient." },
    "camellia sinensis leaf extract": { score: 1, note: "Green Tea. Antioxidant." },
    "avena sativa kernel extract": { score: 1, note: "Oat extract. Soothing." },
    "chamomilla recutita flower extract": { score: 1, note: "Chamomile. Soothing." },
    "rosmarinus officinalis leaf extract": { score: 1, note: "Rosemary. Antioxidant." },
    "glycyrrhiza glabra root extract": { score: 1, note: "Licorice. Brightening." },
    "centella asiatica extract": { score: 1, note: "Cica. Healing." },
    "calendula officinalis flower extract": { score: 1, note: "Calendula. Soothing." },
    "artemisia capillaris extract": { score: 1, note: "Mugwort. Soothing." },
    "houttuynia cordata extract": { score: 1, note: "Heartleaf. Soothing." },

    // === Missing Keys Added (Zero Error Phase) ===
    "hydrogenated poly(c6-14 olefin)": { score: 1, note: "Safe synthetic emollient." },
    "diisopropyl adipate": { score: 1, note: "Safe emollient/solvent." },
    "c14-22 alcohols": { score: 1, note: "Fatty alcohol emulsion stabilizer." },
    "glyceryl stearate citrate": { score: 1, note: "Safe emulsifier." },
    "hexylene glycol": { score: 1, note: "Safe solvent/humectant." },
    "diglycerin": { score: 1, note: "Humectant, larger molecule than glycerin." },
    "butyloctyl salicylate": { score: 1, note: "SPF booster/solvent. Safe." },
    "tryptophan": { score: 1, note: "Amino acid." },
    "tyrosine": { score: 1, note: "Amino acid." },
    "phosphatidylcholine": { score: 1, note: "Skin-identical ingredient. Restoration." },
    "hydroxypropyl tetrahydropyrantriol": { score: 1, note: "Pro-Xylane. Anti-aging active." },
    "phenylene bis-diphenyltriazine": { score: 1, note: "Triasorb. Broad spectrum UV filter." },
    "diethoxyethyl succinate": { score: 1, note: "Emollient." },
    "diisopropyl sebacate": { score: 1, note: "Emollient/Solvent." },
    "polyether-1": { score: 1, note: "Thickener." },
    "methylene bis-benzotriazolyl tetramethylbutylphenol": { score: 1, note: "Tinosorb M. Hybrid UV filter." },
    "methylene bis-benzotriazolyl tetramethylbutylphenol [nano]": { score: 1, note: "Tinosorb M (Nano). Safe UV filter." },
    "diethylamino hydroxybenzoyl hexyl benzoate": { score: 1, note: "Uvinul A Plus. Safe UVA filter." },
    "tris-biphenyl triazine (nano)": { score: 1, note: "Tinosorb A2B. Efficient UVB/UVAII filter." },
    "ethylhexyl triazone": { score: 1, note: "Uvinul T 150. UVB filter." },
    "pantolactone": { score: 1, note: "Humectant." },
    "pvp": { score: 1, note: "Polymer/Film Former. Safe." },
    "c13-14 isoparaffin": { score: 1, note: "Texture enhancer/Solvent." },
    "c11-13 isoalkane": { score: 1, note: "Texture enhancer/Solvent." },
    "isoalkane": { score: 1, note: "Texture enhancer/Solvent." },
    "isododecane": { score: 1, note: "Texture enhancer/Solvent." },
    "isohexadecane": { score: 1, note: "Texture enhancer/Solvent." },

    // === Core Botanical Aliases (Normalization Targets) ===
    "butyrospermum parkii": { score: 1, note: "Shea Butter." },
    "simmondsia chinensis": { score: 1, note: "Jojoba." },
    "helianthus annuus": { score: 1, note: "Sunflower." },
    "olea europaea": { score: 1, note: "Olive." },
    "prunus amygdalus dulcis": { score: 1, note: "Sweet Almond." },
    "camellia sinensis": { score: 1, note: "Green Tea." },
    "avena sativa": { score: 1, note: "Oat." },
    "chamomilla recutita": { score: 1, note: "Chamomile." },
    "rosmarinus officinalis": { score: 1, note: "Rosemary." },
    "glycyrrhiza glabra": { score: 1, note: "Licorice." },
    "centella asiatica": { score: 1, note: "Centella (Cica)." },
    "calendula officinalis": { score: 1, note: "Calendula." },
    "artemisia capillaris": { score: 1, note: "Mugwort." },
    "houttuynia cordata": { score: 1, note: "Heartleaf." },
    "hamamelis virginiana": { score: 2, note: "Witch Hazel." },
    "aloe barbadensis": { score: 1, note: "Aloe Vera." },
    "melaleuca alternifolia": { score: 3, note: "Tea Tree." },

    // === End of DB ===
};

// Words to ignore during normalization to find base chemicals
const IGNORED_WORDS = [
    "extract", "juice", "oil", "butter", "water", "leaf", "root", "flower", "fruit", "seed", "bark", "peel", "stem", "ferment", "filtrate", "callus", "culture", "germ", "sprout", "solution"
];

function getScore(ingredientName) {
    if (!ingredientName) return null;

    // 1. Initial Cleanup (Case, Spaces)
    let clean = ingredientName.toLowerCase().trim();
    clean = clean.replace(/\s+/g, ' '); // Normalize spaces
    clean = clean.replace(/\s*\/\s*/g, '/'); // "parfum / fragrance" -> "parfum/fragrance"

    // STAGE A: Exact Match (with parens and everything)
    if (SCORE_DB[clean]) return SCORE_DB[clean];

    // STAGE B: Turkish Normalization
    // Apply translations but KEEP parens for now
    let turkishNorm = clean.replace(/\bsodyum\b/g, "sodium")
        .replace(/\bpotasyum\b/g, "potassium")
        .replace(/\bkalsiyum\b/g, "calcium")
        .replace(/\basit\b/g, "acid")
        .replace(/\bfolik\b/g, "folic")
        .replace(/\balkol\b/g, "alcohol")
        .replace(/\byağı\b/g, "oil")
        .replace(/\byagi\b/g, "oil")
        .replace(/\bekstraktı\b/g, "extract")
        .replace(/\bekstrakt\b/g, "extract")
        .replace(/\bsuyu\b/g, "water")
        .replace(/\bgliserin\b/g, "glycerin")
        .replace(/\bgliseril\b/g, "glyceryl")
        .replace(/\btokoferil\b/g, "tocopheryl")
        .replace(/\basetat\b/g, "acetate")
        .replace(/\bpantenol\b/g, "panthenol")
        .replace(/\bdimetikon\b/g, "dimethicone")
        .replace(/\bksantan\b/g, "xanthan")
        .replace(/\bsakızı\b/g, "gum")
        .replace(/\bsakizi\b/g, "gum")
        .replace(/\bsitrat\b/g, "citrate")
        .replace(/\blaktat\b/g, "lactate")
        .replace(/\bsülfat\b/g, "sulfate")
        .replace(/\bsulfat\b/g, "sulfate")
        .replace(/\bstearat\b/g, "stearate")
        .replace(/\bbenzil\b/g, "benzyl")
        .replace(/\boksit\b/g, "oxide")
        .replace(/\bglikol\b/g, "glycol")
        .replace(/\büre\b/g, "urea")
        .replace(/\blauril\b/g, "lauryl")
        .replace(/\bglukosid\b/g, "glucoside")
        .replace(/\blesitin\b/g, "lecithin")
        .replace(/\bsetearil\b/g, "cetearyl");

    if (SCORE_DB[turkishNorm]) return SCORE_DB[turkishNorm];

    // STAGE C: Remove Parentheses Content
    // Only now do we strip (stuff) to catch "Water (Aqua)" -> "Water"
    let noParens = turkishNorm.replace(/\([^\)]+\)/g, '').trim();
    noParens = noParens.replace(/\s+/g, ' '); // re-trim

    if (SCORE_DB[noParens]) return SCORE_DB[noParens];

    // STAGE D: Core Name Extraction (from noParens)
    // Remove "extract", "oil", "water" etc to find the 'core' plant name
    let coreNameParts = noParens.split(' ').filter(word => !IGNORED_WORDS.includes(word));
    let coreName = coreNameParts.join(' ');

    if (SCORE_DB[coreName]) return SCORE_DB[coreName];

    // STAGE E: Regex Patterns (Applied to turkishNorm to keep chemical structure info if possible, or noParens?)
    // Let's apply to noParens as it's cleaner for most regexes

    let target = noParens;

    // --- Botanicals ---
    if (target.match(/extract|juice|ferment|filtrate|water|leaf|root|flower|fruit|seed|bark|stem/i)) {
        // Citruses/Peels = Potential Irritant
        if (target.includes("citrus") || target.includes("peel") || target.includes("lemon") || target.includes("orange") || target.includes("bergamot") || target.includes("lavandula") || target.includes("lavender") || target.includes("eucalyptus") || target.includes("mentha") || target.includes("peppermint")) {
            return { score: 4, note: `Botanical with potential fragrance/irritation risk (${coreName}).` };
        }
        // General Plant Extract = Safe
        return { score: 1, note: `Plant-derived ingredient (${coreName}). Likely safe/antioxidant.` };
    }

    if (target.match(/oil|butter|glycerides/i)) {
        if (target.includes("citrus") || target.includes("peel") || target.includes("lemon") || target.includes("orange") || target.includes("bergamot") || target.includes("lavandula") || target.includes("lavender") || target.includes("eucalyptus") || target.includes("mentha") || target.includes("peppermint")) {
            return { score: 5, note: `Essential oil. Potential allergen/irritant.` };
        }
        return { score: 1, note: `Plant oil/butter. Safe emollient.` };
    }

    // --- Chemical Families ---
    if (target.match(/cone$|siloxane$|silsesquioxane/)) {
        return { score: 1, note: "Silicone. Safe, inert skin protectant." };
    }

    if (target.match(/crosspolymer|copolymer|polyacrylate|polymer|nylon|polybutene|polyisobutene/)) {
        return { score: 1, note: "Polymer/Texture enhancer. Safe." };
    }

    if (target.match(/^peg-\d|^ppg-\d|eth-|oleth-|ceteareth-/)) {
        return { score: 3, note: "Ethoxylated ingredient (PEG/PPG). Safety depends on purity." };
    }

    if (target.match(/stearate$|palmitate$|laurate$|myristate$|oleate$|benzoate$|acetate$|linoleate$/)) {
        return { score: 1, note: "Ester. Safe emollient/emulsifier." };
    }

    if (target.match(/chloride$|bromide$|methosulfate$|tosylate$/)) {
        return { score: 3, note: "Cationic surfactant/preservative. Potential irritation." };
    }

    if (target.includes("paraben")) {
        return { score: 7, note: "Paraben class. Endocrine concern debated." };
    }

    if (target.match(/acid$|acid /)) {
        return { score: 2, note: "Acid component. pH adjuster or exfoliant." };
    }

    if (target.match(/^ci \d+|lake$/)) {
        return { score: 2, note: "Cosmetic Colorant." };
    }

    if (target.match(/protein|amino|peptide|collagen|keratin|elastin/)) {
        return { score: 1, note: "Protein/Peptide. Skin restoring." };
    }

    if (target.match(/ferment|lysate|filtrate/)) {
        return { score: 1, note: "Probiotic/Prebiotic ingredient. Skin restoring." };
    }

    if (target.includes("glucoside")) {
        return { score: 1, note: "Gentle sugar-derived surfactant." };
    }

    if (target.includes("hyaluron")) {
        return { score: 1, note: "Hyaluronic Acid derivative. Humectant." };
    }

    if (target.match(/alcohol$/)) {
        return { score: 1, note: "Fatty Alcohol (likely). Safe emollient." };
    }

    if (target.match(/gum$|starch$/)) {
        return { score: 1, note: "Natural thickener." };
    }

    if (target.match(/sodium [a-z]+|potassium [a-z]+|magnesium [a-z]+|calcium [a-z]+/)) {
        return { score: 1, note: "Salt/Mineral compound. Generally safe." };
    }

    if (target.match(/isostear|capryl|cetyl|stearyl/)) {
        return { score: 1, note: "Fatty chain derivative. Safe emollient." };
    }

    // --- Ultra-Broad Patterns (Catch-Alls for Safe Categories) ---

    // Any fruit/leaf/flower/root/seed + "extract" or "water" or "juice" that wasn't caught above
    if (target.includes("extract") || target.includes("water") || target.includes("juice") || target.includes("filtrate") || target.includes("ferment")) {
        if (target.includes("citrus") || target.includes("peel") || target.includes("lemon") || target.includes("orange") || target.includes("bergamot")) {
            return { score: 4, note: `Botanical extract (Citrus/Peel). Potential irritation.` };
        }
        return { score: 1, note: `Plant-derived extract/water. Likely safe/antioxidant.` };
    }

    // Any "Oil" that isn't essential oil risks
    if (target.includes("oil") && !target.includes("mineral")) {
        if (target.includes("citrus") || target.includes("peel") || target.includes("lemon") || target.includes("orange") || target.includes("bergamot") || target.includes("lavandula") || target.includes("lavender") || target.includes("eucalyptus") || target.includes("mentha") || target.includes("peppermint") || target.includes("fragrance")) {
            return { score: 5, note: `Essential/Fragrant Commercial Oil. Potential allergen.` };
        }
        return { score: 1, note: `Plant-derived oil. Safe emollient.` };
    }

    // Sugars / Carbohydrates
    if (target.match(/saccharide|sugar|starch|dextrin|maltodextrin|gum|cellulose/)) {
        return { score: 1, note: "Carbohydrate/Probiotic/Thickener. Safe." };
    }

    // Proteins / Amino Acids / Peptides
    if (target.match(/hydrolyzed|protein|amino|peptide|collagen|keratin|elastin|silk|soy|wheat|oat|milk/)) {
        return { score: 1, note: "Protein/Peptide/Amino Acid. Skin restoring." };
    }

    // Vitamins
    if (target.match(/vitamin|tocopher|ascorb|niacin|panthen|biotin|cyanocobalamin|folic|riboflavin|thiamine|pyridoxine/)) {
        return { score: 1, note: "Vitamin or derivative. Safe skin nutrient." };
    }

    // Minerals
    if (target.match(/magnesium|zinc|copper|calcium|manganese|gold|silver|diamond|pearl|amethyst|ruby|sapphire|tourmaline|jade|coral|amber|quartz|malachite|hematite|smithsonite|rhodochrosite/)) {
        return { score: 1, note: "Mineral/Gemstone extract. Generally safe." };
    }

    // Common Safe Synthetics
    if (target.match(/isoparaffin|polydecene|poloxamer|vp\/|pvm\/ma|acrylamide|taurate|acrylate/)) {
        return { score: 1, note: "Synthetic texture enhancer/stabilizer." };
    }

    return null; // Truly Unknown
}

function scoreIngredients() {
    if (!fs.existsSync(INGREDIENTS_FILE)) {
        console.error('Ingredients file not found');
        return;
    }

    const ingredients = JSON.parse(fs.readFileSync(INGREDIENTS_FILE, 'utf8'));
    console.log(`Scoring ${ingredients.length} ingredients with Advanced Logic...`);

    const scoredData = ingredients.map(ing => {
        const info = getScore(ing.name);
        return {
            name: ing.name,
            count: ing.count,
            score: info ? info.score : "*",
            note: info ? info.note : "Scientific data needed / Rare ingredient"
        };
    });

    // Write CSV
    const csvHeader = 'Ingredient, Frequency, Risk Score (1-10), Scientific Consensus / Note\n';
    const csvRows = scoredData.map(i => {
        // Escape quotes in name and note
        const safeName = i.name.replace(/"/g, '""');
        const safeNote = i.note.replace(/"/g, '""');
        return `"${safeName}",${i.count},${i.score},"${safeNote}"`;
    }).join('\n');

    fs.writeFileSync(OUTPUT_CSV, csvHeader + csvRows);
    console.log(`Scored data saved to ${OUTPUT_CSV}`);

    // Log stats
    const unknownCount = scoredData.filter(i => i.score === "*").length;
    console.log(`Scoring Complete. Unknown items: ${unknownCount} (${Math.round(unknownCount / ingredients.length * 100)}%)`);
}

scoreIngredients();
