import React, { useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import useImage from "use-image";
import ArtImage from "./ArtImage";
import type { Artwork } from "../types/Artwork"; // Make sure this includes `itemId`

interface CanvasAreaProps {
  wallUrl: string;
  artworks: Artwork[];
  width: number;
  height: number;
  onDelete?: (placedId: string) => void;
  onEditSize?: (placedId: string) => void;
  onSelectArtwork?: (artworkId: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
  onDeselectAll?: () => void;
}

export default function CanvasArea({
  wallUrl,
  artworks,
  width,
  height,
  onDelete,
  onEditSize,
  onSelectArtwork,
  onMove,
  onDeselectAll,
}: CanvasAreaProps) {
  const [wallImage] = useImage(wallUrl);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const leftMargin = 100;

  useEffect(() => {
    if (!wallImage) return;
    const imgRatio = wallImage.width / wallImage.height;
    const containerRatio = width / height;
    let newScale = 1;
    const newOffset = { x: 0, y: 0 };

    if (imgRatio > containerRatio) {
      newScale = width / wallImage.width;
      newOffset.y = (height - wallImage.height * newScale) / 2;
    } else {
      newScale = height / wallImage.height;
      newOffset.x = (width - wallImage.width * newScale) / 2 + leftMargin;
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
        onMouseDown={(e) => {
          console.log("Clicked on:", e.target.name());
          const stage = e.target.getStage();
          const clickedOnEmpty =
            e.target === stage || e.target.hasName?.("wall");

          if (clickedOnEmpty) {
            setSelectedId(null);
            onSelectArtwork?.(null);
            onDeselectAll?.(); // ✅ Close the modal
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
              isWall
              onSelect={() => setSelectedId(null)}
            />
          )}
          {artworks.map((a) => (
            <ArtImage
              key={a.id}
              id={a.id}
              src={a.src}
              x={a.x}
              y={a.y}
              width={a.width}
              height={a.height}
              isWall={false}
              isSelected={selectedId === a.id}
              onSelect={() => {
                setSelectedId(a.id);
                onSelectArtwork?.(a.id);
              }}
              onDelete={() => onDelete?.(a.id)}
              onEditSize={() => onEditSize?.(a.id)}
              onMove={onMove}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
