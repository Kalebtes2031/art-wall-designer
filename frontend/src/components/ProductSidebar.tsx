// frontend/src/components/ProductSidebar.tsx
import { useEffect, useState } from 'react';
import api from '../utils/api';

export interface Product {
  _id: string;
  title: string;
  transparentUrl: string;
  widthCm?: number;
  heightCm?: number;
}

export default function ProductSidebar({ onSelect }: { onSelect: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  api.get<any>('/products')
    .then(res => {
      console.log('🔍 Raw API response:', res.data);

      let data: Product[] | undefined;

      if (Array.isArray(res.data)) {
        // Direct array
        data = res.data;
      } else if (Array.isArray(res.data.products)) {
        // Wrapped in { products: [...] }
        data = res.data.products;
      } else if (Array.isArray(res.data.data)) {
        // Wrapped in { data: [...] }
        data = res.data.data;
      } else if (Array.isArray(res.data.body)) {
        // Some proxies wrap under body
        data = res.data.body;
      }

      if (!data) {
        console.error('Unexpected data shape:', res.data);
        throw new Error('Unexpected data shape for products');
      }

      setProducts(data);
    })
    .catch(err => {
      console.error('Failed fetching products:', err);
      setError('Unable to load products.');
      setProducts([]);
    });
}, []);


  if (error) {
    return <div style={{ padding: 10, color: 'red' }}>{error}</div>;
  }

  if (!products.length) {
    return <div style={{ padding: 10 }}>Loading products...</div>;
  }

  return (
    <div style={{ width: 250, borderRight: '1px solid #ccc', overflowY: 'auto' }}>
      {products.map(p => (
        <div
          key={p._id}
          style={{ padding: 10, cursor: 'pointer' }}
          onClick={() => onSelect(p)}
        >
          <img src={p.transparentUrl} alt={p.title} style={{ width: '100%' }} />
          <p>{p.title}</p>
        </div>
      ))}
    </div>
  );
}
