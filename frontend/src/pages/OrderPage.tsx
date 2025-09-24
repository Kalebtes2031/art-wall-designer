// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { useOrderApi } from '../hooks/useOrderApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import OrderCard from '../components/orders/OrderCard';
import OrderSkeleton from '../components/orders/OrderSkeleton';
import OrdersHeader from '../components/orders/OrdersHeader';
import EmptyOrders from '../components/orders/EmptyOrders';
import OrderFilters from '../components/orders/OrderFilters';
import type { Order, OrderStatus } from '../types/Order';
import type { User } from '../types/Auth';

export default function OrdersPage() {
  const { listOrders, updateStatus } = useOrderApi();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await listOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(term) ||
        order.items.some(item =>
          item.product.title.toLowerCase().includes(term)
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
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

  const handleRefresh = () => {
    loadOrders();
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20">
        <div className="p-6 max-w-6xl mx-auto">
          <OrdersHeader stats={stats} onRefresh={handleRefresh} loading={loading} />
          <div className="space-y-6 mt-8">
            {[...Array(4)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20">
      <div className="p-6 max-w-6xl mx-auto">
        <OrdersHeader stats={stats} onRefresh={handleRefresh} loading={loading} />
        
        <OrderFilters
          statusFilter={statusFilter}
          searchTerm={searchTerm}
          onStatusFilterChange={setStatusFilter}
          onSearchChange={setSearchTerm}
        />

        {filteredOrders.length === 0 ? (
          <EmptyOrders hasOrders={orders.length > 0} />
        ) : (
          <div className="space-y-6 mt-6">
            {filteredOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                user={user}
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}