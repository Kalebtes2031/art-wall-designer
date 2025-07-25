import { useEffect, useState } from 'react';
import api from '../../utils/api';
import type { Product } from '../../types/Product';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        products: Product[];
        totalCount: number;
      }>('/products');
      setProducts(res.data.products);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const deleteOne = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
    } catch (err) {
      console.error(err);
      alert('Deletion failed');
    }
  };

  // Stub for "edit" — you can wire up a modal or navigate to a form
  const editOne = (id: string) => {
    alert(`Open edit form for ${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Products</h2>
        <button
          onClick={fetchAll}
          className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          <FiRefreshCw className="mr-2" /> Refresh
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Seller</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Created</th>
                <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p._id}>
                  <td className="px-4 py-2 text-xs font-mono">{p._id.slice(-6)}</td>
                  <td className="px-4 py-2 text-sm">{p.title}</td>
                  <td className="px-4 py-2 text-sm">{p.seller.name}</td>
                  <td className="px-4 py-2 text-sm">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => editOne(p._id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => deleteOne(p._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
