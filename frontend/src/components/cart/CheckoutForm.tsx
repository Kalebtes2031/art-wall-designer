import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { usePlacedItems } from "../../context/PlacedItemsProvider";
import { useCart } from "../../context/CartContext";

interface Props {
  total: number;
  orderId: string;
}

const inputStyles = {
  base: {
    fontSize: "16px",
    color: "#1c1c1c",
    "::placeholder": { color: "#9ca3af" },
    fontFamily: "Inter, sans-serif",
  },
  invalid: { color: "#ef4444" },
};

export default function CheckoutForm({ total, orderId }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { clearPlaced } = usePlacedItems();
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const res = await api.post(`/orders/${orderId}/create-payment-intent`);
      const { clientSecret } = res.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        toast.success("Payment successful! 🎉");

        clearCart();
        clearPlaced();
        navigate("/orders");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#1c3c74]";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6"
    >
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Checkout
      </h2>

      <div className="space-y-4">
        <label className="block text-gray-700 font-medium">Card Number</label>
        <div className={inputClass}>
          <CardNumberElement options={{ style: inputStyles }} />
        </div>

        <label className="block text-gray-700 font-medium">Expiry Date</label>
        <div className={inputClass}>
          <CardExpiryElement options={{ style: inputStyles }} />
        </div>

        <label className="block text-gray-700 font-medium">CVC</label>
        <div className={inputClass}>
          <CardCvcElement options={{ style: inputStyles }} />
        </div>

        {/* <label className="block text-gray-700 font-medium">Postal / ZIP</label>
        <div className={inputClass}>
          <input
            type="text"
            placeholder="12345"
            className="w-full bg- focus:outline-none"
          />
        </div> */}
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 px-6 bg-[#1c3c74] hover:bg-[#5E89B3] text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
