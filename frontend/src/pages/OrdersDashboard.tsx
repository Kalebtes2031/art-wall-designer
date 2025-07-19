// frontend/src/pages/OrdersDashboard.tsx
import { useState, useEffect } from 'react';
import { useOrderApi } from '../hooks/useOrderApi';

export default function OrdersDashboard() {
  const { getOrders } = useOrderApi();
  const [orders, setOrders] = useState<any[]>([]);

 useEffect(() => {
  (async () => {
    const data = await getOrders();
    setOrders(data);
  })();
}, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Orders</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>ID</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>${o.total.toFixed(2)}</td>
              <td>{o.status}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>
                {o.status === 'pending' && (
                  <button onClick={() => {/* call API to mark paid/shipped */}}>
                    Mark Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
