// src/components/orders/EmptyOrders.tsx
import React from 'react';
import { FiPackage, FiShoppingBag } from 'react-icons/fi';

interface EmptyOrdersProps {
  hasOrders: boolean;
}

const EmptyOrders: React.FC<EmptyOrdersProps> = ({ hasOrders }) => {
  return (
    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
      <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
        {hasOrders ? (
          <FiShoppingBag className="text-gray-400 text-2xl" />
        ) : (
          <FiPackage className="text-gray-400 text-2xl" />
        )}
      </div>
      
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {hasOrders ? 'No matching orders found' : 'No orders yet'}
      </h3>
      
      <p className="mt-1 text-gray-500 max-w-md mx-auto">
        {hasOrders 
          ? 'Try adjusting your search or filter to find what you\'re looking for.'
          : 'Your art collection orders will appear here once you make a purchase.'
        }
      </p>
    </div>
  );
};

export default EmptyOrders;