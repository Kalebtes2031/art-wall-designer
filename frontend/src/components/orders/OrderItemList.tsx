// src/components/orders/OrderItemsList.tsx
import React from 'react';
import type { OrderItem } from '../../types/Order';

interface OrderItemsListProps {
  items: OrderItem[];
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({ items }) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">
                {item.product.title}
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                Quantity: {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                ${(item.priceAtOrder * item.quantity).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                ${item.priceAtOrder.toFixed(2)} each
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsList;