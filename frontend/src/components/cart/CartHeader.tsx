import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function CartHeader({ itemCount }: { itemCount: number }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-[#1c3c74] hover:text-[#5E89B3] transition-colors"
      >
        <FiArrowLeft className="mr-2" /> Continue Shopping
      </button>
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#001842] flex items-center">
          <FiShoppingBag className="mr-3 text-[#1c3c74]" />
          Your Art Collection Cart
        </h1>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          {itemCount} items
        </span>
      </div>
    </div>
  );
}
