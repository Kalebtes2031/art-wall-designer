// src/components/orders/OrderCard.tsx
import React, { useState } from 'react';
import { FiCalendar, FiChevronDown, FiChevronUp, FiEdit3 } from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import OrderItemsList from './OrderItemList';
import StatusSelector from './StatusSelector';
import type { Order } from '../../types/Order';
import type { User } from '../../types/Auth';

interface OrderCardProps {
  order: Order;
  user: User | null;
  updatingId: string | null;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, user, updatingId, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <FiCalendar className="text-indigo-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${order.total.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-gray-400 transition-transform duration-300">
              {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <OrderItemsList items={order.items} />
          
          <div className="flex flex-wrap justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-lg font-semibold text-gray-900">
              Order Total: ${order.total.toFixed(2)}
            </div>

            {user?.role !== 'customer' && (
              <div className="flex items-center space-x-3">
                <FiEdit3 className="text-gray-400" />
                <StatusSelector
                  order={order}
                  updatingId={updatingId}
                  onStatusChange={onStatusChange}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;