export interface Product {
    id: string;          // Unique ID (e.g., "sebamed-1234")
    name: string;        // "Repair Shampoo"
    brand: string;       // "Sebamed"
    image: string;       // URL
    ingredients: string; // Full text "Aqua, Sodium Laureth..."
    url?: string;        // Source URL (optional)
    scraped_at: string;  // ISO Date
    source: 'official' | 'gratis' | 'trendyol' | 'manual';
    category?: string;   // Product category (e.g., 'sun-care', 'face-care')
}

export type MasterData = Product[];
