import { useState } from 'react';
import api from '../utils/api';

export default function Admin() {
  const [form, setForm] = useState({ title: '', widthCm: '', heightCm: '' });
  const [file, setFile] = useState<File | null>(null);

  const submit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('widthCm', form.widthCm);
    fd.append('heightCm', form.heightCm);
    if (file) fd.append('image', file);
    try {
      await api.post('/products', fd);
      alert('Created');
      setForm({ title: '', widthCm: '', heightCm: '' });
      setFile(null);
    } catch (err) {
      alert('Error creating product');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Admin Upload
        </h2>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Title"
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          min="0"
          value={form.widthCm}
          onChange={e => setForm(f => ({ ...f, widthCm: e.target.value }))}
          placeholder="Width (cm)"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          min="0"
          value={form.heightCm}
          onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
          placeholder="Height (cm)"
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
