// import { useState } from 'react';
// import api from '../utils/api';

// export default function Admin() {
//   const [form, setForm] = useState({
//     sellerName: '',
//     sellerPhone: '',
//     widthCm: '',
//     heightCm: '',
//     price: ''
//   });
//   const [file, setFile] = useState<File | null>(null);

//   const submit = async (e: any) => {
//     e.preventDefault();
//     const fd = new FormData();
//     fd.append('sellerName', form.sellerName);
//     fd.append('sellerPhone', form.sellerPhone);
//     fd.append('widthCm', form.widthCm);
//     fd.append('heightCm', form.heightCm);
//     fd.append('price', form.price);
//     if (file) fd.append('image', file);
//     try {
//       await api.post('/products', fd);
//       alert('Created');
//       setForm({ sellerName: '', sellerPhone: '', widthCm: '', heightCm: '', price: '' });
//       setFile(null);
//     } catch (err) {
//       alert('Error creating product');
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
//       <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-4">
//         <h2 className="text-2xl font-semibold text-center text-gray-800">
//           Admin Upload
//         </h2>

//         <input
//           type="text"
//           value={form.sellerName}
//           onChange={e => setForm(f => ({ ...f, sellerName: e.target.value }))}
//           placeholder="Seller Name"
//           required
//           className="input"
//         />
//         <input
//           type="text"
//           value={form.sellerPhone}
//           onChange={e => setForm(f => ({ ...f, sellerPhone: e.target.value }))}
//           placeholder="Seller Phone"
//           required
//           className="input"
//         />
//         <input
//           type="number"
//           min="0"
//           value={form.widthCm}
//           onChange={e => setForm(f => ({ ...f, widthCm: e.target.value }))}
//           placeholder="Width (cm)"
//           className="input"
//         />
//         <input
//           type="number"
//           min="0"
//           value={form.heightCm}
//           onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
//           placeholder="Height (cm)"
//           className="input"
//         />
//         <input
//           type="number"
//           min="0"
//           value={form.price}
//           onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
//           placeholder="Price"
//           required
//           className="input"
//         />
//         <input
//           name="image"
//           type="file"
//           onChange={e => setFile(e.target.files?.[0] || null)}
//           required
//           className="mb-6"
//         />
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
//         >
//           Save
//         </button>
//       </form>
//     </div>
//   );
// }

// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface ProductRecord {
  _id: string;
  title: string;
  price: number;
  seller: { name: string };
}
interface OrderRecord {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    api
      .get("/auth/users")
      .then((res) => {
        setUsers(res.data)
        console.log('auth/user out put:',res.data)
      })
      
      .catch(console.error);
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(console.error);
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-700 mb-6">
        Signed in as <span className="font-semibold">{user?.name}</span> (
        {user?.role})
      </p>

      {/* Users Section */}
      <section>
  <h2 className="text-2xl font-semibold mb-2">Users</h2>
  {Array.isArray(users) && users.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((u) => (
        <div key={u.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md">
          <p className="font-medium">{u?.name}</p>
          <p className="text-sm text-gray-600">{u.email}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {u.role}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No users found.</p>
  )}
</section>


      {/* Products Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-5 text-left">Title</th>
                <th className="py-3 px-5 text-left">Price</th>
                <th className="py-3 px-5 text-left">Seller</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-5">{p.title}</td>
                  <td className="py-3 px-5">${p.price.toFixed(2)}</td>
                  <td className="py-3 px-5">{p?.seller?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Orders Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-5 text-left">Order ID</th>
                <th className="py-3 px-5 text-left">Date</th>
                <th className="py-3 px-5 text-left">Total</th>
                <th className="py-3 px-5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-5 font-mono text-sm">{o._id}</td>
                  <td className="py-3 px-5 text-sm">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-5 text-sm">${o.total.toFixed(2)}</td>
                  <td className="py-3 px-5 text-sm capitalize">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
