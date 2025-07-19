// src/pages/SellerDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiEdit, FiTrash2, FiCheck, FiX, FiPlus, FiDollarSign, FiBox, FiShoppingBag, FiImage } from 'react-icons/fi';

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    product: {
      title: string;
    };
    quantity: number;
  }[];
}

interface ProductRecord {
  _id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  orientation: string;
  widthCm: number;
  heightCm: number;
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    width: '', 
    height: '',
    orientation: 'portrait' 
  });
  const [file, setFile] = useState<File | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    price: string;
    width: string;
    height: string;
    orientation: "portrait" | "landscape";
  } | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch seller's products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get('/products/mine');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('widthCm', form.width);
    fd.append('heightCm', form.height);
    fd.append('orientation', form.orientation);
    if (file) fd.append('image', file);
    
    try {
      const res = await api.post('/products', fd);
      setProducts((prev) => [res.data, ...prev]);
      setForm({ 
        title: '', 
        description: '', 
        price: '', 
        width: '', 
        height: '',
        orientation: 'portrait' 
      });
      setFile(null);
    } catch (err) {
      console.error('Create product failed:', err);
    } finally {
      setCreating(false);
    }
  };

  // Start editing a product
  const startEditing = (product: ProductRecord) => {
    setEditingProductId(product._id);
    setIsEditing(true);
    setEditForm({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      width: product.widthCm.toString(),
      height: product.heightCm.toString(),
      orientation: product.orientation as "portrait" | "landscape"
    });
    setEditFile(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProductId(null);
    setIsEditing(false);
    setEditForm(null);
    setEditFile(null);
  };

  // Submit product edit
  const submitEdit = useCallback(async (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!editForm) return;

    const originalProduct = products.find(p => p._id === productId);
    if (!originalProduct) return;

    setIsEditing(true);

    const fd = new FormData();

    // Only append changed fields
    if (editForm.title !== originalProduct.title) {
      fd.append('title', editForm.title);
    }
    if (editForm.description !== (originalProduct.description || '')) {
      fd.append('description', editForm.description);
    }
    if (parseFloat(editForm.price) !== originalProduct.price) {
      fd.append('price', editForm.price);
    }
    if (parseFloat(editForm.width) !== originalProduct.widthCm) {
      fd.append('widthCm', editForm.width);
    }
    if (parseFloat(editForm.height) !== originalProduct.heightCm) {
      fd.append('heightCm', editForm.height);
    }
    if (editForm.orientation !== originalProduct.orientation) {
      fd.append('orientation', editForm.orientation);
    }
    if (editFile) {
      fd.append('image', editFile);
    }

    try {
      const res = await api.patch(`/products/${productId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProducts(products.map(p => 
        p._id === productId ? res.data : p
      ));
      cancelEditing();
    } catch (err) {
      console.error('Edit failed:', err);
    } finally {
      setIsEditing(false);
    }
  }, [editForm, editFile, products]);

  // Delete a product
  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>. 
          Manage your products and track orders.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiBox className="inline mr-2" />
            My Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShoppingBag className="inline mr-2" />
            Orders
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-8">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Add New Product</h2>
            </div>
            <form onSubmit={submitProduct} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ... existing form fields ... */}
            </form>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                My Products ({products.length})
              </h2>
            </div>
            {loadingProducts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <FiBox className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {products.map((product) => (
                  <div 
                    key={product._id} 
                    className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200 relative"
                  >
                    {/* Edit Mode */}
                    {editingProductId === product._id ? (
                      <form 
                        onSubmit={(e) => submitEdit(e, product._id)}
                        className="p-4 space-y-3"
                      >
                        <input
                          type="text"
                          placeholder="Title"
                          value={editForm?.title || ''}
                          onChange={(e) => setEditForm(f => ({ ...f!, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                        
                        <textarea
                          placeholder="Description"
                          value={editForm?.description || ''}
                          onChange={(e) => setEditForm(f => ({ ...f!, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          rows={2}
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Price ($)</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={editForm?.price || ''}
                              onChange={(e) => setEditForm(f => ({ ...f!, price: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              required
                              step="0.01"
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Orientation</label>
                            <select
                              value={editForm?.orientation || 'portrait'}
                              onChange={(e) => setEditForm(f => ({ ...f!, orientation: e.target.value as any }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="portrait">Portrait</option>
                              <option value="landscape">Landscape</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Width (cm)</label>
                            <input
                              type="number"
                              placeholder="Width"
                              value={editForm?.width || ''}
                              onChange={(e) => setEditForm(f => ({ ...f!, width: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              required
                              min="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Height (cm)</label>
                            <input
                              type="number"
                              placeholder="Height"
                              value={editForm?.height || ''}
                              onChange={(e) => setEditForm(f => ({ ...f!, height: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              required
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">
                            Update Image (optional)
                          </label>
                          <div className="mt-1 flex items-center">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FiImage className="w-6 h-6 text-gray-400 mb-1" />
                                <p className="text-xs text-gray-500">
                                  {editFile ? editFile.name : 'Click to upload'}
                                </p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                                accept="image/*"
                              />
                            </label>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-3 py-1.5 flex items-center text-sm text-gray-700 rounded border border-gray-300 hover:bg-gray-100"
                            disabled={isEditing}
                          >
                            <FiX className="mr-1" /> Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isEditing}
                            className="px-3 py-1.5 flex items-center text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            <FiCheck className="mr-1" />
                            {isEditing ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Product Display Mode
                      <>
                        <div className="group relative">
                          {product.imageUrl ? (
                            <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                              <img 
                                src={product.imageUrl} 
                                alt={product.title} 
                                className="object-cover w-full h-48"
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-48 flex items-center justify-center">
                              <FiImage className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => startEditing(product)}
                                className="p-1.5 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-50"
                                title="Edit"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                className="p-1.5 bg-white rounded-full shadow-md text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">{product.title}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                          <div className="mt-3 flex justify-between text-sm text-gray-600">
                            <span>{product.widthCm} × {product.heightCm} cm</span>
                            <span className="capitalize">{product.orientation}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          {/* ... existing orders table ... */}
        </section>
      )}
    </div>
  );
}