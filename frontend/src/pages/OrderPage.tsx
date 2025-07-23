// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { useOrderApi } from '../hooks/useOrderApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiCalendar } from 'react-icons/fi';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.JSX.Element }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: <FiClock className="mr-1" /> },
    paid: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FiDollarSign className="mr-1" /> },
    shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <FiPackage className="mr-1" /> },
    cancelled: { bg: 'bg-rose-100', text: 'text-rose-800', icon: <FiXCircle className="mr-1" /> },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <FiCheckCircle className="mr-1" /> }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </span>
  );
};

// Skeleton loader
const OrderSkeleton = () => (
  <div className="border border-gray-200 rounded-xl p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      <div className="h-5 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="space-y-3 mb-4">
      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

export default function OrdersPage() {
  const { listOrders, updateStatus } = useOrderApi();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch(err => {
        console.error(err);
        toast.error('Failed to fetch orders');
      })
      .finally(() => setLoading(false));
  }, [listOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateStatus(orderId, newStatus);
      setOrders(o => o.map(x => x._id === orderId ? updated : x));
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };
  console.log('roders:', orders)

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Art Collection Orders</h1>
        <p className="mt-2 text-gray-600">Review your purchased artworks and their status</p>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
            <FiPackage className="text-gray-400 text-2xl" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-gray-500">Your art collection orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div 
              key={order._id} 
              className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md"
            >
              <div className="bg-white p-5">
                <div className="flex flex-wrap justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <div className="flex items-center mt-1 text-gray-500 text-sm">
                      <FiCalendar className="mr-1.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Artworks</h4>
                  <ul className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center rounded text-sm bg-gray-200 p-2">
                        <div>

                        <h3 className="text-gray-600 font-bold font-mono">
                          {item.product.title} × {item.quantity}
                        </h3>
                        <h3 className="text-gray-600 font-serif">
                        Size:  {item.product.sizes[item.sizeIndex].widthCm} × {item.product.sizes[item.sizeIndex].heightCm}
                        </h3>

                        </div>
                        <span className="text-gray-900 font-medium">
                          ${(item.priceAtOrder  * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="text-lg font-bold text-gray-900">
                    Total: ${order.total.toFixed(2)}
                  </div>

                  {user?.role !== 'customer' && (
                    <div className="relative mt-2 sm:mt-0">
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                          updatingId === order._id ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        }`}
                      >
                        {['pending', 'paid', 'shipped', 'completed', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {updatingId === order._id && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}