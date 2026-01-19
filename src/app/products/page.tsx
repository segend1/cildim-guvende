import React from 'react';
import productData from '../../lib/product_data.json';
import ProductsTable from './ProductsTable';

// Server Component
export default function ProductsPage() {
    return (
        <main>
            <ProductsTable data={productData} />
        </main>
    );
}
