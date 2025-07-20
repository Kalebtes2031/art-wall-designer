// src/components/CartFooter.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from '../context/CartContext';
import { useOrderApi } from "../hooks/useOrderApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiShoppingCart, FiX, FiPlus, FiMinus, FiTrash2, FiArrowRight, FiExternalLink } from "react-icons/fi";

export default function CartFooter() {
  const { cart, loading, updateItem, removeFromCart, refreshCart } = useCart();
  const { createOrder } = useOrderApi();
  const [open, setOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart?.items?.reduce((sum: number, i) => sum + i.quantity * i.product.price, 0) ?? 0;
  const itemCount = cart?.items?.reduce((count: number, i) => count + i.quantity, 0) ?? 0;

  const changeQty = async (prodId: string, qty: number) => {
    if (qty < 1) return;
    try {
      await updateItem(prodId, qty);
      toast.success("Quantity updated");
    } catch {
      toast.error("Failed to update quantity");
    }
  };

   const goToCartPage = () => {
    setOpen(false);
    navigate("/cart");
  };

  const onRemove = async (prodId: string) => {
    try {
      await removeFromCart(prodId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
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
      {/* Floating cart button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-10 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-xl p-4 flex items-center justify-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <motion.span 
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {itemCount}
          </motion.span>
        )}
        <span className="sr-only">View Cart</span>
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
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FiShoppingCart className="mr-2 text-indigo-600" />
                  Your Cart
                  {itemCount > 0 && (
                    <span className="ml-4 mt-2 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-0.5 rounded-full">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  )}
                </h2>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Your cart is empty</h3>
                      <p className="text-gray-500 max-w-xs">
                        Add some beautiful artwork to your cart to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      {cart?.items?.map((item: any) => (
                        <motion.div
                          key={item.product._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                        >
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                            {item.product.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
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
                            <h3 className="font-medium text-gray-900 truncate">{item.product.title}</h3>
                            <p className="text-lg font-semibold text-indigo-600">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.product.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => changeQty(item.product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={`p-2 ${item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                              >
                                <FiMinus className="h-4 w-4" />
                              </button>
                              
                              <span className="px-2 text-sm font-medium min-w-[24px] text-center">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => changeQty(item.product._id, item.quantity + 1)}
                                className="p-2 text-gray-600 hover:bg-gray-100"
                              >
                                <FiPlus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => onRemove(item.product._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
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
                <div className="border-t w-[35%] bg-gray-50 p-16 max-h-[45vh] overflow-y-auto flex flex-col gap-y-5">
                  <div className="flex justify-center gap-x-2 items-center ">
                    <span className="text-gray-600 font-bold">Total: {" "}</span>
                    <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={onCheckout}
                    disabled={loading || checkoutLoading || itemCount === 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center ${
                      itemCount === 0 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg'
                    }`}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                  
                   <button
                        onClick={goToCartPage}
                        disabled={itemCount === 0}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center text-sm ${
                          itemCount === 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <FiExternalLink className="mr-2" />
                        View Full Cart
                      </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}