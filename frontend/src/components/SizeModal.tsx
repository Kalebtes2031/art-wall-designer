// components/SizeModal.tsx
import React from "react";
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
    <div className="fixed w-[360px] inset-0 bg-opacity-40 flex justify-start items-center z-100">
      <div className="w-[360px] bg-[#D7D7D7] shadow-lg h-full animate-slide-in-left">
        <div className="flex mt-[56px]  px-6 bg-gray-50 items-center justify-between ">
          <div className="">
            <h2 className="text-gray-600 text-lg font-semibold">
              {product?.title}
            </h2>
            <h2 className="text-gray-600 text-lg font-semibold">
              {product?.description}
            </h2>
          </div>

          <button
            className="border-l-2 py-4 pr-2 pl-7 text-[24px] text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="flex flex-col px-6 py-8 space-y-4 i">
          <h3 className="text-lg font-mono font-semibold mb-4 text-gray-800">
            Sizes
          </h3>

          <div className="grid grid-cols-3 gap-y-6">
            {product.sizes.map((s, idx) => {
              const isEditing = product._id === editingProductId;
              const isSelected = isEditing
                ? idx === editingSizeIndex
                : idx === selectedIndex;

              return (
                <>
                <div className="w-[92px] mr-4">

                <button
                  key={idx}
                  onClick={() => {
                    onEditSize(product._id, idx);
                    // onClose(); // close modal
                  }}
                  className={`w-full text-left px-4 py-2 rounded-full text-sm transition-colors ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {s.widthCm} × {s.heightCm} cm
                </button>
                </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
