// src/components/cart/CheckoutForm.tsx
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
import Select from "react-select";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

interface Props {
  total: number;
  orderId: string;
}

countries.registerLocale(enLocale);

const countryOptions = Object.entries(countries.getNames("en")).map(
  ([code, name]) => ({
    value: code,
    label: name,
  })
);

// Visa and Mastercard SVG icons
const PaymentIcons = () => (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
    <div className="w-8 h-5 bg-[#1a1f71] rounded flex items-center justify-center">
      <span className="text-white text-xs font-bold">Visa</span>
    </div>
    <div className="w-8 h-5 bg-[#eb001b] rounded flex items-center justify-center">
      <div className="w-3 h-3 border-2 border-[#f79e1b] rounded-full"></div>
    </div>
  </div>
);

const inputStyles = {
  base: {
    fontSize: "16px",
    color: "#1f2937",
    fontFamily: "Inter, system-ui, sans-serif",
    "::placeholder": {
      color: "#9ca3af",
    },
    ":focus": {
      color: "#1c3c74",
    },
  },
  invalid: {
    color: "#ef4444",
    ":focus": {
      color: "#ef4444",
    },
  },
};

export default function CheckoutForm({ total, orderId }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [saveInfo, setSaveInfo] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const { clearPlaced } = usePlacedItems();
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const form = e.target as any;

    const billingDetails = {
      name: form.cardholderName?.value,
      address: {
        line1: form.addressLine1?.value,
        line2: form.addressLine2?.value,
        city: form.city?.value,
        postal_code: form.postalCode?.value,
        country: selectedCountry || undefined,
      },
    };

    if (!billingDetails.address.country) {
      toast.error("Please select a country");
      return;
    }

    setLoading(true);

    try {
      // Send billing info and saveInfo flag to backend
      const res = await api.post(`/orders/${orderId}/create-payment-intent`, {
        billingDetails,
        saveInfo,
      });

      const { clientSecret } = res.data;

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: billingDetails,
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        toast.success("Payment successful! 🎉");

        // Clear cart and placed items
        clearCart();
        clearPlaced();

        // Navigate to orders page
        navigate("/orders");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong during payment");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full text-gray-500 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c3c74] focus:border-transparent transition-all duration-200 bg-white";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl mt-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
        <p className="text-gray-600 mt-2">Complete your purchase securely</p>
      </div>

      {/* Card Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Card information
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="relative p-3 border-b border-gray-200">
              <CardNumberElement
                options={{ style: inputStyles, placeholder: "1234 1234 1234 1234" }}
                className="w-full pr-20"
              />
              <PaymentIcons />
            </div>
            <div className="flex">
              <div className="flex-1 p-3 border-r border-gray-200">
                <CardExpiryElement options={{ style: inputStyles }} />
              </div>
              <div className="flex-1 p-3">
                <CardCvcElement options={{ style: inputStyles }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cardholder name
          </label>
          <input
            type="text"
            name="cardholderName"
            placeholder="Full name on card"
            className={inputClass}
            required
          />
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Billing address
          </label>
          <div>
            <Select
              options={countryOptions}
              onChange={(opt) => setSelectedCountry(opt?.value || "")}
              className="react-select-container text-gray-500"
              classNamePrefix="react-select"
              placeholder="Select country"
            />
            <input
              type="text"
              name="addressLine1"
              placeholder="Address line 1"
              className="w-full text-gray-500 p-2 border-x border-b border-gray-300 focus:outline-none transition-all duration-200 bg-white"
              required
            />
            <input
              type="text"
              name="addressLine2"
              placeholder="Address line 2 (optional)"
              className="w-full text-gray-500 p-2 border-x border-b border-gray-300 focus:outline-none transition-all duration-200 bg-white"
            />
            <div className="grid grid-cols-2 gap">
              <div>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal code"
                  className="w-full text-gray-500 p-2 border-x border-b border-gray-300 rounded-bl-lg focus:outline-none transition-all duration-200 bg-white"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="w-full text-gray-500 p-2 border-r border-b border-gray-300 rounded-br-lg focus:outline-none transition-all duration-200 bg-white"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Information */}
        <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <input
            type="checkbox"
            id="saveInfo"
            checked={saveInfo}
            onChange={(e) => setSaveInfo(e.target.checked)}
            className="mt-1 h-4 w-4 text-[#1c3c74] focus:ring-[#1c3c74] border-gray-300 rounded"
          />
          <div>
            <label htmlFor="saveInfo" className="block text-sm font-medium text-gray-700">
              Save my information for faster checkout
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Pay securely at artworkdesigner.onrender.com using Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 px-6 bg-gradient-to-r from-[#001842] to-[#1c3c74] hover:from-[#1c3c74] hover:to-[#001842] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay $${total.toFixed(2)}`
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center space-y-4">
        <p className="text-xs text-gray-500">
          By completing this purchase, you authorize
          artworkdesigner.onrender.com to charge your card for this payment and
          future payments in accordance with their terms.
        </p>

        <div className="flex items-center justify-center space-x-6 text-gray-500 border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs">Powered by</span>
            <div className="w-11 h-4 bg-[#635bff] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">Stripe</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
