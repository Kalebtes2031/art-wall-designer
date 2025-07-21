// components/ProductSidebar.tsx
import { useEffect, useState } from "react";
import api from "../utils/api";
import type { Product, Size } from "../types/Product";

interface ProductSidebarProps {
  selectedProduct: Product | null;
  selectedSizeIndex: number;
  onSelect: (product: Product, size: Size, sizeIndex: number) => void;
  editingProductId?: string;
  editingSizeIndex?: number;
  onEditSize?: (productId: string, newSizeIndex: number) => void;
  showSizeOptions: boolean;
}
// 
export default function ProductSidebar({
  selectedProduct,
  selectedSizeIndex,
  onSelect,
  editingProductId,
  editingSizeIndex,
  onEditSize,
  showSizeOptions,
}: ProductSidebarProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load products on mount
  useEffect(() => {
    setIsLoading(true);
    api
      .get<Product[]>("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error("Failed fetching products:", err);
        setError("Unable to load products.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Handlers
  const handleProductClick = (p: Product) => {
    onSelect(p, p.sizes[0], 0);
  };
  const handleSizeClick = (size: Size, idx: number) => {
    if (!selectedProduct) return;
    onSelect(selectedProduct, size, idx);
  };

  // Render states
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
        {error}
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full" />
        <span className="ml-2 text-gray-600">Loading art collection...</span>
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
        <p>No art available.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-2">
      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div
            key={p._id}
            className={`relative bg-white rounded-lg border p-2 cursor-pointer transition-shadow ${
              selectedProduct?._id === p._id
                ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                : "border-gray-200 hover:shadow-md"
            }`}
            onClick={() => handleProductClick(p)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={p.transparentUrl || p.imageUrl}
                alt={p.title}
                className="object-contain w-full h-full p-2"
              />
            </div>
            <div className="mt-2 text-sm font-medium text-gray-800 truncate">
              {p.title}
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-600">
              ${p.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Size Picker */}
      {/* {selectedProduct && showSizeOptions && (
       <>
       <div ></div>
        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Choose a size
          </h3>
          <div className="flex flex-col space-y-2">
            {showSizeOptions && selectedProduct?.sizes.map((s, idx) => {
              const isEditing = selectedProduct._id === editingProductId;
              const isSelected = isEditing
                ? idx === editingSizeIndex
                : idx === selectedSizeIndex;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isEditing) {
                      onEditSize?.(selectedProduct._id, idx);
                    } else {
                      handleSizeClick(s, idx);
                    }
                  }}
                  className={`w-full text-left px-4 py-2 rounded text-sm transition-colors ${
                    isSelected
                    ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {s.widthCm} × {s.heightCm} cm
                </button>
              );
            })}
          </div>
        </div>
      </>
      )} */}
    </div>
  );
}
