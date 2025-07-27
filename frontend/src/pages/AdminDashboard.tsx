// src/pages/AdminDashboard.tsx
import { useState } from 'react';
import UsersTab from '../components/admin/UsersTab';
import ProductsTab from '../components/admin/ProductsTab';
import OrdersTab from '../components/admin/OrdersTab';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen pt-[80px] max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your store operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-700 font-bold">A</span>
          </div>
          <span className="text-gray-700">Admin User</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="bg-white rounded-xl shadow-sm p-1 border border-gray-100">
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3 font-medium rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? 'text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}