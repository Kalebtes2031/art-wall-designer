// src/components/CartFooter.tsx
import { useEffect, useState } from 'react';
import { useCartApi } from '../hooks/useCartApi';
import { useOrderApi } from '../hooks/useOrderApi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartFooter() {
  const { fetchCart } = useCartApi();
  const { createOrder } = useOrderApi();
  const [cart, setCart] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart().then(setCart).catch(console.error);
  }, []);

  const handleCheckout = async () => {
    try {
      await createOrder();
      setOpen(true);
    } catch (err) {
      console.error('Order create error:', err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white h-[72px] px-6 flex items-center justify-between z-50 shadow-xl">
      <span className="font-semibold text-lg">
        Total: ${cart?.total?.toFixed(2) || '0.00'}
      </span>
      <button
        onClick={handleCheckout}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        Shop This Collection
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-2xl p-6 shadow-2xl z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Checkout Panel</h2>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                {cart?.items?.map((item: any) => (
                  <div key={item.product._id} className="border p-3 rounded-lg mb-2">
                    <p className="font-semibold">{item.product.title}</p>
                    <p>Qty: {item.quantity}</p>
                    <p>${item.product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-100 p-4 rounded-xl shadow">
                <p className="text-lg font-semibold">Total: ${cart?.total?.toFixed(2)}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => navigate('/cart')}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-200"
                  >
                    View Full Cart
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setCart(null)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Clear Items from Wall
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
