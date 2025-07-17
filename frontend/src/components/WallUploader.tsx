import { useState } from 'react';
import api from '../utils/api';

export default function WallUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);

const handle = async () => {
  console.log('📤 Starting wall upload…');
  if (!file) return;

  const fd = new FormData();
  fd.append('wallImage', file);

  try {
    const res = await api.post<{ url: string }>('/wall/upload', fd);
    console.log('✅ Upload response:', res.data);
    onUpload(res.data.url);
  } catch (err) {
    console.error('❌ Upload failed:', err);
  }
};


  return (
    <div style={{ padding: 10 }}>
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handle} disabled={!file}>Upload Wall</button>
    </div>
  );
}
