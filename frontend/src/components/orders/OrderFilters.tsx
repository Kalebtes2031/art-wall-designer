// src/components/orders/OrderFilters.tsx
import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

interface OrderFiltersProps {
  statusFilter: string;
  searchTerm: string;
  onStatusFilterChange: (status: string) => void;
  onSearchChange: (term: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  statusFilter,
  searchTerm,
  onStatusFilterChange,
  onSearchChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 text-gray-500 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders or artworks..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => onStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none 
                     focus:ring-2 text-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;