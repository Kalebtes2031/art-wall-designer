// src/components/cart/OrderSummary.tsx
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import CheckoutForm from './CheckoutForm';

interface Props {
  total: number;
  loading: boolean;
  cartItems: any[];
}

export default function OrderSummary({ total, loading, cartItems }: Props) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const navigateToCheckout = async () => {
    try {
      // 1️⃣ Create pending order
      const res = await api.post('/orders');
      const order = res.data;
      setOrderId(order._id);

      // 2️⃣ Show the Stripe checkout form
      setShowCheckout(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">
        Order Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-medium">Free</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span className="font-medium">Calculated at checkout</span>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between font-bold text-lg text-gray-500">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {!showCheckout ? (
        <button
          onClick={navigateToCheckout} // ✅ call our function
          disabled={loading || cartItems.length === 0}
          className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 ${
            loading || cartItems.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#001842] via-[#1c3c74] to-[#5E89B3] hover:from-[#5E89B3] hover:via-[#1c3c74] hover:to-[#001842] shadow-lg"
          }`}
        >
          Proceed to Checkout
        </button>
      ) : (
        // ✅ Render CheckoutForm only when orderId exists
        orderId && <CheckoutForm total={total} orderId={orderId} />
      )}

      <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <h3 className="font-semibold text-[#1c3c74] mb-2">
          Secure Checkout
        </h3>
        <p className="text-xs text-[#5E89B3]">
          Your payment information is encrypted and securely processed.
        </p>
      </div>
    </div>
  );
}
