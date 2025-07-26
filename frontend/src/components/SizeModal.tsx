import type { Product } from "../types/Product";

interface SizeModalProps {
  product: Product;
  selectedIndex: number;
  editingProductId?: string;
  editingSizeIndex?: number;
  onClose: () => void;
  onEditSize: (productId: string, sizeIndex: number) => void;
}

export default function SizeModal({
  product,
  selectedIndex,
  editingProductId,
  editingSizeIndex,
  onClose,
  onEditSize,
}: SizeModalProps) {
  return (
    <div className="fixed  w-[420px] mt-[65px] inset-0 bg-opacity-40 flex justify-start items-center z-100">
      <div className="w-[420px] bg-[#D7D7D7] h-full shadow-xl animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6  bg-gray-50 border-b">
          <div>
            <h2 className="text-gray-600 text-lg font-mono font-semibold">
              {product.title}
            </h2>
            <p className="text-gray-400 text-sm font-serif font-medium">
              {product.description}
            </p>
          </div>
          <button
            className="text-2xl text-gray-600 hover:text-gray-900 py-6  ml-2 pl-7 pr-2 border-l-2"
            onClick={onClose}
            aria-label="Close size selector"
          >
            ×
          </button>
        </div>

        {/* Size options */}
        <div className="flex flex-col  py-8 space-y-4">
          <h3 className="text-lg font-mono px-6 font-semibold text-gray-800">
            Sizes
          </h3>
          <div className="grid grid-cols-3 gap-y-6 pl-4">
            {product.sizes.map((s, idx) => {
              const isEditing = product._id === editingProductId;
              const isSelected = isEditing
                ? idx === editingSizeIndex
                : idx === selectedIndex;

              return (
                <div key={idx} className="w-[96px]">
                  <button
                    onClick={() => onEditSize(product._id, idx)}
                    className={`w-full py-2 px-3 rounded-full text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {s.widthCm} × {s.heightCm} cm
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
