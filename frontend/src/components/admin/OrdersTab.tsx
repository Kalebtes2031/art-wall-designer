// src/components/admin/OrdersTab.tsx
import { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

// Mirror your OrderDocument shape (populated)
interface OrderItem {
  product: { _id: string; title: string; seller: { _id: string } };
  quantity: number;
  priceAtOrder: number;
  sizeIndex: number;
}

interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
  items: OrderItem[];
  total: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  createdAt: string;
}

const STATUSES: Order["status"][] = [
  "pending",
  "paid",
  "shipped",
  "cancelled",
];

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Order[]>("/orders");
      setOrders(res.data);
    } catch (err: any) {
      console.error("Failed loading orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle status change
  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    const prev = orders;
    setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      toast.success(`Order ${orderId.slice(-6)} marked ${newStatus}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status");
      setOrders(prev);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>
    );
  }
  if (!orders.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((o) => (
            <tr key={o._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                #{o._id.slice(-6)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {o.user.name} ({o.user.email})
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(o.createdAt)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {o.items.slice(0, 2).map((it, i) => (
                  <div key={i}>
                    {it.quantity}× {it.product.title}
                  </div>
                ))}
                {o.items.length > 2 && (
                  <div className="text-gray-500 text-xs">
                    +{o.items.length - 2} more
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                ${o.total.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
