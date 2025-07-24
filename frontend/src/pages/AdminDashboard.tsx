// src/pages/AdminDashboard.tsx
import { useState } from 'react';
import UsersTab from '../components/admin/UsersTab';
import ProductsTab from '../components/admin/ProductsTab';
import OrdersTab from '../components/admin/OrdersTab';

const TABS = ['users', 'products', 'orders'] as const;
type TabKey = typeof TABS[number];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('users');

  const renderTab = () => {
    switch (activeTab) {
      case 'users':    return <UsersTab />;
      case 'products': return <ProductsTab />;
      case 'orders':   return <OrdersTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Tab Nav */}
      <nav className="flex space-x-4 border-b">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Active Tab Content */}
      <div>{renderTab()}</div>
    </div>
  );
}
