// src/components/admin/OrdersTab.tsx
import { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { FiLoader, FiTruck, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { getAssetUrl } from "../../utils/getAssetUrl";

interface OrderItem {
  product: {
    _id: string;
    title: string;
    seller: { _id: string };
    imageUrl?: string;
    transparentUrl?: string;
  };
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

const STATUSES: Order["status"][] = ["pending", "paid", "shipped", "cancelled"];

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-green-800",
  shipped: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: <FiLoader className="w-4 h-4 text-yellow-800" />,
  paid: <FiCheckCircle className="w-4 h-4 text-green-800" />,
  shipped: <FiTruck className="w-4 h-4 text-indigo-800" />,
  cancelled: <span className="w-4 h-4 text-red-800">✕</span>,
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };
  
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Order[]>("/orders");
      setOrders(res.data);
      console.log("Fetched orders:", res.data);
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

  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    const prev = orders;
    setOrders(
      orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      toast.success(`Order ${orderId.slice(-6)} updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status");
      setOrders(prev);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FiLoader className="animate-spin text-indigo-600 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center mb-4">
          <FiTruck className="text-gray-400 w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No orders found
        </h3>
        <p className="text-gray-500">Orders will appear here once placed</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
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
         <tbody className="bg-white divide-y divide-gray-100">
      {orders.map((o) => {
        const isExpanded = expandedOrders.has(o._id);
        const visibleItems = isExpanded ? o.items : o.items.slice(0, 2);

        return (
          <motion.tr
            key={o._id}
            className="hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900 font-mono">
                #{o._id.slice(-6)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{o.user.name}</div>
              <div className="text-xs text-gray-500">{o.user.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(o.createdAt)}
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">
              {visibleItems.map((it, i) => (
                <div key={i} className="flex items-start">
                  <img
                    src={getAssetUrl(
                      it.product.imageUrl ?? it.product.transparentUrl ?? ""
                    )}
                    alt={it.product.title}
                    className="w-10 h-10 object-cover rounded-md bg-gray-100 mb-2 mr-1"
                  />
                  <div>
                    <div>{it.product.title}</div>
                    <div className="text-xs text-gray-500">
                      {it.quantity} × ${it.priceAtOrder.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {o.items.length > 2 && (
                <button
                  onClick={() => toggleExpanded(o._id)}
                  className="text-gray-500 text-xs mt-2 cursor-pointer hover:bg-blue-100 p-1 rounded-full"
                >
                  {isExpanded
                    ? "Show less"
                    : `+${o.items.length - 2} more items`}
                </button>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="text-sm font-medium text-gray-900">
                ${o.total.toFixed(2)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="relative">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value as any)}
                  className={`appearance-none pl-8 pr-10 py-1.5 text-sm rounded-full border ${
                    statusColors[o.status]
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {statusIcons[o.status]}
                </div>
              </div>
            </td>
          </motion.tr>
        );
      })}
    </tbody>
        </table>
      </div>
    </div>
  );
}
