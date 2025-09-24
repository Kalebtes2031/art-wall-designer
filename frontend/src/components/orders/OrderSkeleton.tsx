// src/components/orders/OrderSkeleton.tsx
import React from 'react';

const OrderSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 rounded-xl p-6 animate-pulse bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 rounded-lg w-10 h-10"></div>
          <div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export default OrderSkeleton;