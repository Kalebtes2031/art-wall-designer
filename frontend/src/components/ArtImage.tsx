// components/ArtImage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Rect, Text } from "react-konva";
import useImage from "use-image";

interface ArtImageProps {
  id?: string;
  src: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isWall?: boolean;
  scaleX?: number;
  scaleY?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onEditSize?: () => void;
  onMove?: (id: string, x: number, y: number) => void;
}

export default function ArtImage({
  id,
  src,
  x,
  y,
  width,
  height,
  isWall = false,
  scaleX = 1,
  scaleY = 1,
  isSelected,
  onSelect,
  onDelete,
  onEditSize,
  onMove,
}: ArtImageProps) {
  const [image] = useImage(src);
  const groupRef = useRef<any>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState(false);

  // Compute displayed dimensions using either passed width/height or natural image size
  const displayWidth = width ?? naturalSize.width;
  const displayHeight = height ?? naturalSize.height;

  // Update natural size once image loads
  useEffect(() => {
    if (image) {
      setNaturalSize({ width: image.width, height: image.height });
    }
  }, [image]);

  return (
    <Group
      x={x}
      y={y}
      ref={groupRef}
      draggable={!isWall}
      onDragEnd={e => {
        if (id && onMove) onMove(id, e.target.x(), e.target.y());
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.()}
      onTap={() => onSelect?.()}
      scaleX={scaleX}
      scaleY={scaleY}
    >
      {/* Optional background frame for non-wall images */}
      {!isWall && image && (
        <Rect
          x={-10}
          y={-10}
          width={displayWidth + 20}
          height={displayHeight + 20}
          fill="#fff"
          stroke="#8B4513"
          strokeWidth={7}
          cornerRadius={6}
          shadowColor="rgba(0,0,0,0.25)"
          shadowBlur={10}
          shadowOffset={{ x: 3, y: 3 }}
          shadowOpacity={0.6}
        />
      )}

      {/* Artwork image */}
      <KonvaImage
        image={image}
        x={0}
        y={0}
        width={displayWidth}
        height={displayHeight}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={0.6}
        shadowOffsetX={isSelected ? 3 : 0}
        shadowOffsetY={isSelected ? 3 : 0}
        cornerRadius={isWall ? 0 : 5}
      />

      {/* Hover icons for delete and edit size */}
      {hovered && !isWall && (
        <>
          {/* Delete icon */}
          <Text
            text="🗑️"
            fontSize={20}
            x={displayWidth + 12}
            y={8+24}
            onClick={e => {
              e.cancelBubble = true;
              onDelete?.();
            }}
            onMouseEnter={e => {
              e.target.getStage()?.container().style.setProperty("cursor", "pointer");
            }}
            onMouseLeave={e => {
              e.target.getStage()?.container().style.setProperty("cursor", "default");
            }}
          />
          {/* Edit-size icon */}
          <Text
            text="✎"
            fontSize={20}
            x={displayWidth + 14}
            y={4}
            onClick={e => {
              e.cancelBubble = true;
              onEditSize?.();
            }}
            onMouseEnter={e => {
              e.target.getStage()?.container().style.setProperty("cursor", "pointer");
            }}
            onMouseLeave={e => {
              e.target.getStage()?.container().style.setProperty("cursor", "default");
            }}
          />
        </>
      )}
    </Group>
  );
}
