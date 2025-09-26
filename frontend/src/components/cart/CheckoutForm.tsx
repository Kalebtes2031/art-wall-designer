import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { usePlacedItems } from "../../context/PlacedItemsProvider";
import { useCart } from "../../context/CartContext"; // your cart context

interface Props {
  total: number;
  orderId: string;
}

export default function CheckoutForm({ total, orderId }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { clearPlaced } = usePlacedItems();
  const { clearCart } = useCart(); // make sure your CartProvider has a clearCart function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // 1️⃣ Create PaymentIntent
      const res = await api.post(`/orders/${orderId}/create-payment-intent`);
      const { clientSecret } = res.data;

      // 2️⃣ Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <CardElement className="p-3 border rounded-md" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#1c3c74] hover:bg-[#5E89B3] transition-all"
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
