// src/components/orders/StatusBadge.tsx
import React from 'react';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';
import type { OrderStatus } from '../../types/Order';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: { 
      bg: 'bg-amber-100 border-amber-200', 
      text: 'text-amber-800', 
      icon: <FiClock className="flex-shrink-0" /> 
    },
    paid: { 
      bg: 'bg-blue-100 border-blue-200', 
      text: 'text-blue-800', 
      icon: <FiDollarSign className="flex-shrink-0" /> 
    },
    shipped: { 
      bg: 'bg-indigo-100 border-indigo-200', 
      text: 'text-indigo-800', 
      icon: <FiPackage className="flex-shrink-0" /> 
    },
    cancelled: { 
      bg: 'bg-rose-100 border-rose-200', 
      text: 'text-rose-800', 
      icon: <FiXCircle className="flex-shrink-0" /> 
    },
    completed: { 
      bg: 'bg-emerald-100 border-emerald-200', 
      text: 'text-emerald-800', 
      icon: <FiCheckCircle className="flex-shrink-0" /> 
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status];

  return (
    <span className={`
      inline-flex items-center border rounded-full font-medium transition-all duration-200
      ${config.bg} ${config.text} ${sizeClasses[size]}
    `}>
      {config.icon}
      <span className="ml-1.5 capitalize">{status}</span>
    </span>
  );
};

export default StatusBadge;