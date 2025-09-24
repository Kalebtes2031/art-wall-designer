import { useState } from "react";
import { useCart } from "../context/CartContext";
import { usePlacedItems } from "../context/PlacedItemsProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import CartItemCard from "../components/cart/CartItemCard";
import EmptyCart from "../components/cart/EmptyCart";
import OrderSummary from "../components/cart/OrderSummary";
import CartHeader from "../components/cart/CartHeader";
import api from "../utils/api";

export default function CartPage() {
  const { cart, loading, updateCartItemQuantity, removeFromCart, refreshCart } = useCart();
  const { placed, deleteItem } = usePlacedItems();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const navigate = useNavigate();

  const total =
    cart?.items?.reduce(
      (sum: number, i: any) => sum + i.quantity * i.product.price,
      0
    ) ?? 0;

  const changeQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    try {
      await updateCartItemQuantity(id, qty);
      toast.success("Quantity updated");
    } catch {
      toast.error("Could not update quantity");
    }
  };
  

  const onRemove = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      await removeFromCart(itemId);
      const placedItem = placed.find(p => p.itemId === itemId);
      if (placedItem) deleteItem(placedItem.id);
      toast.success("Item removed from cart");
      await refreshCart();
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setIsRemoving(null);
    }
  };

  if (loading) return <Spinner />;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 pt-[65px] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <CartHeader itemCount={0} />
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 pt-[65px] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CartHeader itemCount={cart.items.length} />
        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item: any) => (
                <CartItemCard
                  key={item._id}
                  item={item}
                  loading={loading}
                  isRemoving={isRemoving}
                  changeQty={changeQty}
                  onRemove={onRemove}
                />
              ))}
            </div>
            <OrderSummary total={total} loading={loading} cartItems={cart.items} />
          </div>
        
      </div>
    </div>
  );
}
