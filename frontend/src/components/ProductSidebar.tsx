import { useEffect, useState } from "react";
import api from "../utils/api";
import type { Product, Size } from "../types/Product";
import { useCart } from "../context/CartContext";

interface ProductSidebarProps {
  selectedProduct: Product | null;
  selectedSizeIndex: number;
  onSelect: (product: Product, size: Size, sizeIndex: number) => void;
  editingProductId?: string;
  editingSizeIndex?: number;
  onEditSize?: (productId: string, newSizeIndex: number) => void;
  showSizeOptions: boolean;
  onAddToWall: () => void; // ← add this line
}


export default function ProductSidebar({
  selectedProduct,
  selectedSizeIndex,
  onSelect,
  editingProductId,
  editingSizeIndex,
  onEditSize,
  showSizeOptions,
  onAddToWall,
}: ProductSidebarProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleProductClick = (p: Product) => {
    onSelect(p, p.sizes[0], 0);
  };

  const handleSizeClick = (size: Size, idx: number) => {
    if (!selectedProduct) return;
    onSelect(selectedProduct, size, idx);
  };

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
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div
            key={p._id}
            className={`relative group bg-white rounded-lg border p-2 cursor-pointer transition-shadow flex flex-col 
              ${
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

            {/* ADD TO WALL BUTTON OVERLAY */}
            <button
              onClick={async (e) => {
                e.stopPropagation(); // prevent the card’s own onClick
                onSelect(p, p.sizes[0], 0); // select default size
                // await addToCart(p._id, 0);  // <-- ✅ fixed argument count
                // refreshCart();              // optional, if Designer doesn't already do this
                onAddToWall(); // call the new prop to handle adding to wall
              }}
              className="absolute bottom-0 left-0 right-0 h-[56px] flex items-center justify-center
       bg-gray-400 bg-opacity-50 text-white font-semibold
       opacity-0 group-hover:opacity-100 transition-opacity
       rounded-b-lg"
  >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add to Wall
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
