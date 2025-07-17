// components/CanvasArea.tsx
import { Stage, Layer } from 'react-konva';
import ArtImage from './ArtImage';
import useImage from 'use-image';
import { useEffect, useState } from 'react';

export default function CanvasArea({
  wallUrl,
  artworks,
  width,
  height
}: {
  wallUrl: string;
  artworks: { src: string; x: number; y: number }[];
  width: number;
  height: number;
}) {
  const [wallImage] = useImage(wallUrl);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Calculate scale and offset to fit wall image perfectly
  useEffect(() => {
    if (!wallImage) return;
    
    const imgRatio = wallImage.width / wallImage.height;
    const containerRatio = width / height;
    
    let newScale = 1;
    let newOffset = { x: 0, y: 0 };
    
    if (imgRatio > containerRatio) {
      // Image is wider than container
      newScale = width / wallImage.width;
      newOffset.y = (height - wallImage.height * newScale) / 2;
    } else {
      // Image is taller than container
      newScale = height / wallImage.height;
      newOffset.x = (width - wallImage.width * newScale) / 2;
    }
    
    setScale(newScale);
    setOffset(newOffset);
  }, [wallImage, width, height]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Stage 
        width={width} 
        height={height}
        className="shadow-2xl rounded-xl overflow-hidden border-8 border-white bg-white"
      >
        <Layer>
          {wallImage && (
            <ArtImage 
              src={wallUrl} 
              x={offset.x} 
              y={offset.y} 
              scaleX={scale}
              scaleY={scale}
              isWall={true} 
            />
          )}
          {artworks.map((a, i) => (
            <ArtImage 
              key={i} 
              src={a.src} 
              x={a.x} 
              y={a.y} 
              isWall={false}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}