import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { PlacedItemsProvider } from "./context/PlacedItemsProvider";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <CartProvider>
          <PlacedItemsProvider>
            <Elements stripe={stripePromise}>
              <App />
            </Elements>
          </PlacedItemsProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
