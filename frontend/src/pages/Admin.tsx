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
    await api.post('/products', fd);
    alert('Created');
  };

  return (
    <form onSubmit={submit} style={{ padding: 20 }}>
      <h2>Admin Upload</h2>
      <input
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        placeholder="Title"
        required
      />
      <input
        value={form.widthCm}
        onChange={e => setForm(f => ({ ...f, widthCm: e.target.value }))}
        placeholder="Width cm"
      />
      <input
        value={form.heightCm}
        onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
        placeholder="Height cm"
      />
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required />
      <button type="submit">Save</button>
    </form>
  );
}
