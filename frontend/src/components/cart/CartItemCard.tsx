// src/components/cart/CartItemCard.tsx
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { getAssetUrl } from "../../utils/getAssetUrl";

interface Props {
  item: any;
  loading: boolean;
  isRemoving: string | null;
  changeQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItemCard({ item, loading, isRemoving, changeQty, onRemove }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 p-4 bg-white flex-shrink-0">
          {item.product.imageUrl ? (
            <img
              src={getAssetUrl(item.product.imageUrl)}
              alt={item.product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
            </div>
          )}
        </div>

        <div className="p-6 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {item.product.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {item.product.description ||
                  "Beautiful art piece for your collection"}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Size: {item.product.sizes[item.sizeIndex].widthCm} ×{" "}
                {item.product.sizes[item.sizeIndex].heightCm} cm
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold text-[#5E89B3]">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm">
                ${item.product.price.toFixed(2)} each
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <button
                onClick={() => changeQty(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1 || loading}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  item.quantity <= 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FiMinus className="w-4 h-4" />
              </button>

              <span className="mx-4 font-medium text-lg">
                {item.quantity}
              </span>

              <button
                onClick={() => changeQty(item._id, item.quantity + 1)}
                disabled={loading}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onRemove(item._id)}
              disabled={isRemoving === item._id || loading}
              className="flex items-center text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              <FiTrash2 className="mr-1" />
              {isRemoving === item._id ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
