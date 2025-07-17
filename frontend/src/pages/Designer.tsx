import { useState } from 'react';
import ProductSidebar from '../components/ProductSidebar';
import type { Product } from '../components/ProductSidebar';
import WallUploader from '../components/WallUploader';
import CanvasArea from '../components/CanvasArea';

export default function Designer() {
  const [wallUrl, setWallUrl] = useState('');
  const [placed, setPlaced] = useState<{ src: string; x: number; y: number }[]>([]);
  const [current, setCurrent] = useState<Product | null>(null);

  const addArt = () => {
    if (current) setPlaced(p => [...p, { src: current.transparentUrl, x: 50, y: 50 }]);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 250 }}>
        <WallUploader onUpload={setWallUrl} />
        <ProductSidebar onSelect={setCurrent} />
        <button onClick={addArt} disabled={!current}>Add to Wall</button>
      </div>
      <div style={{ flex: 1 }}>
        <CanvasArea wallUrl={wallUrl} artworks={placed} />
      </div>
    </div>
  );
}
