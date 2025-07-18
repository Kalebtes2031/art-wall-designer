import { useState } from 'react';
import api from '../utils/api';

export default function Admin() {
  const [form, setForm] = useState({
    sellerName: '',
    sellerPhone: '',
    widthCm: '',
    heightCm: '',
    price: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const submit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('sellerName', form.sellerName);
    fd.append('sellerPhone', form.sellerPhone);
    fd.append('widthCm', form.widthCm);
    fd.append('heightCm', form.heightCm);
    fd.append('price', form.price);
    if (file) fd.append('image', file);
    try {
      await api.post('/products', fd);
      alert('Created');
      setForm({ sellerName: '', sellerPhone: '', widthCm: '', heightCm: '', price: '' });
      setFile(null);
    } catch (err) {
      alert('Error creating product');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Admin Upload
        </h2>
        
        <input
          type="text"
          value={form.sellerName}
          onChange={e => setForm(f => ({ ...f, sellerName: e.target.value }))}
          placeholder="Seller Name"
          required
          className="input"
        />
        <input
          type="text"
          value={form.sellerPhone}
          onChange={e => setForm(f => ({ ...f, sellerPhone: e.target.value }))}
          placeholder="Seller Phone"
          required
          className="input"
        />
        <input
          type="number"
          min="0"
          value={form.widthCm}
          onChange={e => setForm(f => ({ ...f, widthCm: e.target.value }))}
          placeholder="Width (cm)"
          className="input"
        />
        <input
          type="number"
          min="0"
          value={form.heightCm}
          onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
          placeholder="Height (cm)"
          className="input"
        />
        <input
          type="number"
          min="0"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          placeholder="Price"
          required
          className="input"
        />
        <input
          name="image"
          type="file"
          onChange={e => setFile(e.target.files?.[0] || null)}
          required
          className="mb-6"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  );
}
