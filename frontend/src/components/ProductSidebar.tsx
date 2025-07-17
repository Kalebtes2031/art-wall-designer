// components/ProductSidebar.tsx
import { useEffect, useState } from 'react';
import api from '../utils/api';

export interface Product {
  _id: string;
  title: string;
  imageUrl: string;         // added
  transparentUrl?: string;
  widthCm?: number;
  heightCm?: number;
}

export default function ProductSidebar({ onSelect }: { onSelect: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.get<any>('/products')
      .then(res => {
        console.log('🔍 Raw API response:', res.data);

        let data: Product[] | undefined;

        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.data.products)) {
          data = res.data.products;
        } else if (Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data.body)) {
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
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelect = (product: Product) => {
    onSelect(product);
    setSelectedId(product._id);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">Loading art collection...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No art available</h3>
        <p className="text-gray-500 text-sm">We couldn't find any art pieces to display.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 hover:scrollbar-thumb-blue-300">
      <div className="grid grid-cols-2 gap-3">
        {products.map(p => (
          <div
            key={p._id}
            className={`bg-white rounded-lg border overflow-hidden cursor-pointer transform transition-all duration-200 ${
              selectedId === p._id 
                ? 'border-blue-500 shadow-lg scale-[1.02] ring-2 ring-blue-200' 
                : 'border-gray-200 hover:shadow-md hover:border-blue-300'
            }`}
            onClick={() => handleSelect(p)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                src={p.transparentUrl || p.imageUrl}
                alt={p.title} 
                className="object-contain w-full h-full p-2" 
              />
            </div>
            <div className="p-2">
              <p className="font-medium text-gray-800 text-sm truncate">{p.title}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {p.widthCm || 30}×{p.heightCm || 40}cm
                </span>
                {selectedId === p._id && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}