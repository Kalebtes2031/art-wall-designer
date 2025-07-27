// src/pages/CartPage.tsx
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useOrderApi } from "../hooks/useOrderApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiShoppingBag,
} from "react-icons/fi";
import { Spinner } from "../components/Spinner";

export default function CartPage() {
  const { createOrder } = useOrderApi();
  // const [cart, setCart] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cart, loading, updateCartItemQuantity, removeFromCart } =
    useCart();

  // useEffect(() => {
  //   const loadCart = async () => {
  //     try {
  //       const cartData = await fetchCart();
  //       setCart(cartData);
  //     } catch (error) {
  //       toast.error('Failed to load cart');
  //       console.error(error);
  //     }
  //   };

  //   loadCart();
  // }, [fetchCart]);

  const total =
    cart?.items?.reduce(
      (sum: number, i: any) => sum + i.quantity * i.product.price,
      0
    ) ?? 0;

  const changeQty = async (id: string, qty: number) => {
    console.log("this is me", id, qty);
    if (qty < 1) return;
    try {
      // this calls CartContext.updateItem → load() → context.cart changes
      await updateCartItemQuantity(id, qty);
      toast.success("Quantity updated");
      // no need to call refreshCart separately; updateItem already does it
    } catch {
      toast.error("Could not update quantity");
    }
  };

  const onRemove = async (id: string) => {
    try {
      setIsRemoving(id);
      // context.removeFromCart → load() → context.cart changes
      await removeFromCart(id);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Could not remove item");
    } finally {
      setIsRemoving(null);
    }
  };

  const onCheckout = async () => {
    // setLoading(true);
    try {
      await createOrder();
      toast.success("Order placed!");
      navigate("/orders");
    } catch {
      toast.error("Checkout failed");
    } finally {
      // setLoading(false);
    }
  };

  if (!cart) {
    return <Spinner />;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 pt-[65px] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#1c3c74]  hover:text-[#5E89B3] transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Continue Shopping
          </button>
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#001842] flex items-center">
              <FiShoppingBag className="mr-3 text-[#1c3c74]" />
              Your Art Collection Cart
            </h1>
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {cart.items.reduce(
                (count: number, i: any) => count + i.quantity,
                0
              )}{" "}
              items
            </span>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <img 
                src="/emptycart.png"
                alt="Empty Cart"
                className="w-32 h-32 mx-auto mb-6"
              />
              {/* <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" /> */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't added any artwork to your cart yet. Browse our
                collection to find pieces that inspire you.
              </p>
              <button
                onClick={() => navigate("/designer")}
                className="px-6 py-3 cursor-pointer bg-gradient-to-tr from-[#001842] via-[#1c3c74] to-[#5E89B3] text-white rounded-lg font-medium hover:from-[#5E89B3] hover:via-[#1c3c74] hover:to-[#001842] transition-all shadow-md"
              >
                Browse Art Collection
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item: any) => (
                <div
                  key={item.product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 h-48 p-4 bg-white flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
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
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
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
                            onClick={() =>
                              changeQty(item._id, item.quantity - 1)
                            }
                            // onClick={() => changeQty(item.product._id, item.quantity - 1, item.sizeIndex)}
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
                            onClick={() =>
                              changeQty(item._id, item.quantity + 1)
                            }
                            // onClick={() => changeQty(item.product._id, item.quantity + 1, item.sizeIndex)}
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
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  disabled={loading || cart.items.length === 0}
                  className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 ${
                    loading || cart.items.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#001842] via-[#1c3c74] to-[#5E89B3] hover:from-[#5E89B3] hover:via-[#1c3c74] hover:to-[#001842] shadow-lg"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
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
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>

                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h3 className="font-semibold text-[#1c3c74] mb-2">
                    Secure Checkout
                  </h3>
                  <p className="text-xs text-[#5E89B3]">
                    Your payment information is encrypted and securely
                    processed. We never store your credit card details.
                  </p>
                </div>
              </div>

              {/* <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Need Assistance?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our art consultants are here to help you with your purchase or answer any questions.
                </p>
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div className="ml-4">
                    <p className="font-medium">Art Collection Support</p>
                    <p className="text-indigo-600">support@artcollection.com</p>
                    <p className="text-gray-500 text-sm">Mon-Fri, 9am-5pm EST</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
