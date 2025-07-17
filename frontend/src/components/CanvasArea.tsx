import { Stage, Layer } from "react-konva";
import ArtImage from "./ArtImage";
import useImage from "use-image";
import { useEffect, useState } from "react";
// import { KonvaEventObject } from 'konva/lib/Node';

export default function CanvasArea({
  wallUrl,
  artworks,
  width,
  height,
}: {
  wallUrl: string;
  artworks: { src: string; x: number; y: number; id: string }[]; // Make sure each artwork has a unique `id`
  width: number;
  height: number;
}) {
  const [wallImage] = useImage(wallUrl);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Calculate scale and offset to fit wall image perfectly
  useEffect(() => {
    if (!wallImage) return;

    const imgRatio = wallImage.width / wallImage.height;
    const containerRatio = width / height;

    let newScale = 1;
    let newOffset = { x: 0, y: 0 };

    if (imgRatio > containerRatio) {
      newScale = width / wallImage.width;
      newOffset.y = (height - wallImage.height * newScale) / 2;
    } else {
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
        // onMouseDown={handleStageMouseDown}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            setSelectedId(null); // Deselect any selected art
          }
        }}
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
              onSelect={() => setSelectedId(null)} 
            />
          )}
          {artworks.map((a, i) => (
            <ArtImage
              key={a.id}
              src={a.src}
              x={a.x}
              y={a.y}
              id={a.id}
              isWall={false}
              isSelected={selectedId === a.id}
              onSelect={() => setSelectedId(a.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
