// src/components/CartFooter.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useOrderApi } from "../hooks/useOrderApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiShoppingCart,
  FiX,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowRight,
  FiExternalLink,
  FiUser,
  FiLogIn, 
  FiUserPlus, 
  FiStar, 
  FiCheck,
  FiFacebook,
  FiMail
} from "react-icons/fi";
import { getAssetUrl } from "../utils/getAssetUrl";
import { useAuth } from "../context/AuthContext";
import { usePlacedItems } from "../context/PlacedItemsProvider";

export default function CartFooter() {
  const {
    cart,
    loading,
    addToCart,
    removeFromCart,
    decrementCartItem,
    refreshCart,
  } = useCart();
  const { createOrder } = useOrderApi();
  const [open, setOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const {token} = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const { placed, deleteItem, deleteItemUniversal } = usePlacedItems();

  useEffect(() => {
    if (!cart) return;
    const fetchCart = async () => {
      await refreshCart();
    };
    fetchCart();
  }, [cart]);

  const total =
    cart?.items?.reduce(
      (sum: number, i) => sum + i.quantity * i.product.price,
      0
    ) ?? 0;
  const itemCount =
    cart?.items?.reduce((count: number, i) => count + i.quantity, 0) ?? 0;

  const changeQty = async (
    itemId: string,
    currentQty: number,
    direction: "inc" | "dec"
  ) => {
    try {
      if (direction === "inc") {
        // Increment quantity by adding the same item with the same sizeIndex
        // Assuming sizeIndex is available in item or defaulting to 0
        await addToCart(itemId, 0);
      } else if (direction === "dec" && currentQty > 1) {
        await decrementCartItem(itemId);
      }
      toast.success("Quantity updated");
      await refreshCart(); // refresh cart UI after quantity change
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const goToCartPage = () => {
    setOpen(false);
    navigate("/cart");
  };

  const handleRemove = async (itemId: string) => {
  try {
    const placedItem = placed.find(p => p.itemId === itemId);
    const deleteIdentifier = placedItem?.id ?? itemId;

    await deleteItemUniversal(deleteIdentifier, removeFromCart);
  } catch (err) {
    console.error("Failed to remove item:", err);
  }
};




  const onCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await createOrder();
      await refreshCart();
      toast.success("Order placed!");
      setOpen(false);
      navigate("/orders");
    } catch {
      toast.error("Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
    {token? (
      <>
      {/* Floating cart button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed cursor-pointer bottom-0 left-0 right-0  z-50 h-16 bg-[#D7D7D7] flex items-center justify-between px-12 border-t-1 border-t-gray-200 shadow-t-2xl shadow-gray-600"
        // whileHover={{ scale: 1.01 }}
        // whileTap={{ scale: 0.98 }}
      >
        {/* Total Price on Left */}
        <div className="text-lg text-gray-600 font-semibold">Total: ${total.toFixed(2)}</div>

        {/* Cart Icon with Badge on Right */}
        <div className="relative">
          <FiShoppingCart className="h-6 w-6 text-gray-600" />
          {itemCount > 0 && (
            <motion.span
              className="absolute -top-2 -right-2 bg-[#1c3c74] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {itemCount}
            </motion.span>
          )}
        </div>

        <span className="sr-only text-gray-600">Open cart</span>
      </motion.button>

      {/* Cart panel with backdrop */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30"
              onClick={() => setOpen(false)}
            />

            {/* Slide-up panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[55vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Handle bar */}
              <div className="flex justify-center py-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex justify-between items-center px-6 pb-4 border-b">
                <p className="text-2xl flex-row font-bold text-gray-900 flex items-center">
                  <FiShoppingCart className="mr-2 text-[#1c3c74]" />
                  Your Cart
                  {itemCount > 0 && (
                    <span className="ml-4 bg-blue-100 text-[#1c3c74] text-[14px] font-medium px-2 py-0.5 rounded-full">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  )}
                </p>
                
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="flex w-full">
                {/* Cart items */}
                <div className="flex-1 max-h-[45vh] w-[65%] overflow-y-auto px-4 py-2">
                  {cart?.items?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FiShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Your cart is empty
                      </h3>
                      <p className="text-gray-500 max-w-xs">
                        Add some beautiful artwork to your cart to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      {cart?.items?.map((item: any) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                            {item.product.imageUrl ? (
                              <img
                                src={getAssetUrl(item.product.imageUrl)}
                                alt={item.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FiShoppingCart className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.product.title}
                            </h3>

                            {/* 👇 Add this block */}
                            {item.product.sizes && (
                              <p className="text-sm text-gray-600">
                                Size:{" "}
                                {item.product.sizes[item.sizeIndex]?.widthCm}cm
                                × {item.product.sizes[item.sizeIndex]?.heightCm}
                                cm
                              </p>
                            )}

                            <p className="text-sm text-gray-500">
                              ${item.product.price.toFixed(2)} × {item.quantity} qt
                            </p>
                            <p className="text-lg font-semibold text-[#5E89B3]">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-2">
                           
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="p-2 text-red-500 hover:bg-red-100 px-6 py-3 rounded-full"
                              title="Remove item"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t w-[35%] bg-gray-50 p-[60px] max-h-[45vh] overflow-y-auto flex flex-col gap-y-5">
                  <div className="flex justify-center gap-x-2 items-center ">
                    <span className="text-gray-600 font-bold">Total: </span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  {/*<button
                    onClick={onCheckout}
                    disabled={ checkoutLoading || itemCount === 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center ${
                      itemCount === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#001842] border via-[#1c3c74] to-[#5E89B3] hover:from-gray-50 hover:via-gray-100 hover:to-gray-100 hover:text-[#1c3c74] border-[#1c3c74]"
                    }`}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Proceed to Checkout
                        <FiArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </button>
                    */}
                  <button
                    onClick={goToCartPage}
                    disabled={itemCount === 0}
                    className={`w-full py-3 px-4 text-[#1c3c74] rounded-xl font-bold transition-colors flex items-center justify-center  ${
                      itemCount === 0
                        ? "text-[#1c3c74] cursor-not-allowed"
                        : "bg-gradient-to-r hover:from-[#001842] hover:via-[#1c3c74] hover:to-[#5E89B3] hover:text-white border border-[#1c3c74]  "
                    }`}
                  >
                    <FiExternalLink className="mr-2 h-5 w-5" />
                    View Full Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      </>
    ): (
      <>
        {/* New Login/Signup Structure */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#001842] via-[#1c3c74] to-[#5E89B3] shadow-2xl"
      >
        {/* Main CTA Button */}
        <motion.button
          onClick={() => setAuthOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-16 flex items-center justify-between px-8 text-white cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <FiUser className="h-6 w-6 text-white" />
            <div className="text-left">
              <p className="font-semibold text-lg">Join Our Art Community</p>
              <p className="text-sm text-blue-100">Sign in to save your favorites</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
            <span className="font-medium">Get Started</span>
            <FiArrowRight className="h-4 w-4" />
          </div>
        </motion.button>

        {/* Auth Panel */}
        <AnimatePresence>
          {authOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setAuthOpen(false)}
              />

              {/* Slide-up Panel */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[60vh] overflow-hidden flex flex-col shadow-2xl"
              >
                {/* Handle bar */}
                <div className="flex justify-center py-2">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center px-6 pb-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-[#001842] to-[#5E89B3] rounded-full">
                      <FiUser className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">Welcome</p>
                      <p className="text-gray-600">Join our art community</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setAuthOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-md mx-auto space-y-6">
                    {/* Benefits */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <FiStar className="h-4 w-4 text-yellow-500 mr-2" />
                        Member Benefits
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center">
                          <FiCheck className="h-3 w-3 text-green-500 mr-2" />
                          Save your favorite artworks
                        </li>
                        <li className="flex items-center">
                          <FiCheck className="h-3 w-3 text-green-500 mr-2" />
                          Fast checkout experience
                        </li>
                        <li className="flex items-center">
                          <FiCheck className="h-3 w-3 text-green-500 mr-2" />
                          Track your orders
                        </li>
                        <li className="flex items-center">
                          <FiCheck className="h-3 w-3 text-green-500 mr-2" />
                          Exclusive member discounts
                        </li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/login')}
                        className="w-full bg-gradient-to-r from-[#001842] to-[#1c3c74] text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center"
                      >
                        <FiLogIn className="h-5 w-5 mr-2" />
                        Sign In to Account
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/signup')}
                        className="w-full bg-white border-2 border-[#1c3c74] text-[#1c3c74] py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-gray-50 flex items-center justify-center"
                      >
                        <FiUserPlus className="h-5 w-5 mr-2" />
                        Create New Account
                      </motion.button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center py-4">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink mx-4 text-gray-500 text-sm">or continue with</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center space-x-2 border border-gray-300 rounded-xl py-3 px-4 hover:bg-gray-50 transition-colors">
                        <FiFacebook className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Facebook</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 border border-gray-300 rounded-xl py-3 px-4 hover:bg-gray-50 transition-colors">
                        <FiMail className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">Google</span>
                      </button>
                    </div>

                    {/* Footer Text */}
                    <p className="text-center text-xs text-gray-500">
                      By continuing, you agree to our{" "}
                      <a href="#" className="text-[#1c3c74] hover:underline">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="text-[#1c3c74] hover:underline">Privacy Policy</a>
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    
      </>
    )}
    </>
  );
}
