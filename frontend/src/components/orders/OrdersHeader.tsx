// src/components/orders/OrdersHeader.tsx
import React from 'react';
import { FiRefreshCw, FiPackage } from 'react-icons/fi';
import { IoReorderFourSharp } from "react-icons/io5";

interface OrdersHeaderProps {
  stats: {
    total: number;
    pending: number;
    completed: number;
  };
  onRefresh: () => void;
  loading: boolean;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({ stats, onRefresh, loading }) => {
  return (
    <header className="text-center mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <IoReorderFourSharp className="text-gray-600 text-2xl" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Art Collection</h1>
            <p className="text-gray-600 mt-1">Manage and track your artwork orders</p>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex text-gray-600 items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
                   transition-colors duration-200 disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span >Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-gray-600 text-sm">Total Orders</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
          <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
          <div className="text-amber-600 text-sm">Pending</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm">
          <div className="text-2xl font-bold text-emerald-700">{stats.completed}</div>
          <div className="text-emerald-600 text-sm">Completed</div>
        </div>
      </div>
    </header>
  );
};

export default OrdersHeader;