// src/components/orders/StatusSelector.tsx
import React from 'react';
import type { Order, OrderStatus } from '../../types/Order';

interface StatusSelectorProps {
  order: Order;
  updatingId: string | null;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ order, updatingId, onStatusChange }) => {
  const statusOptions: OrderStatus[] = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

  return (
    <div className="relative">
      <select
        value={order.status}
        disabled={updatingId === order._id}
        onChange={e => onStatusChange(order._id, e.target.value as OrderStatus)}
        className={`
          block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          transition-all duration-200 ${updatingId === order._id ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        {statusOptions.map(status => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
      {updatingId === order._id && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default StatusSelector;