// components/ArtImage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Rect, Text } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

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
  const groupRef = useRef<Konva.Group>(null);
  const deleteRef = useRef<Konva.Text>(null);
  const editRef   = useRef<Konva.Text>(null);

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // When the image loads, capture its natural size
  useEffect(() => {
    if (image) {
      setNaturalSize({ width: image.width, height: image.height });
    }
  }, [image]);

  // Dimensions we actually draw at
  const displayWidth  = width  ?? naturalSize.width;
  const displayHeight = height ?? naturalSize.height;

  // Helper to tween opacity + a quick pulse
  function animateIcon(node: Konva.Text | null, toVisible: boolean) {
    if (!node) return;
    node.to({
      opacity: toVisible ? 1 : 0,
      scaleX:  toVisible ? 1.2 : 1,
      scaleY:  toVisible ? 1.2 : 1,
      duration: 0.2,
      easing: Konva.Easings.EaseInOut,
    });
  }

  return (
    <Group
      ref={groupRef}
      name={isWall ? "wall" : ""}
      x={x}
      y={y}
      draggable={!isWall}
      scaleX={scaleX}
      scaleY={scaleY}

      onDragEnd={e => {
        if (id && onMove) onMove(id, e.target.x(), e.target.y());
      }}

      onMouseEnter={() => {
        animateIcon(deleteRef.current, true);
        animateIcon(editRef.current,   true);
      }}
      onMouseLeave={() => {
        animateIcon(deleteRef.current, false);
        animateIcon(editRef.current,   false);
      }}

      onClick={e => {
        e.cancelBubble = true;
        onSelect?.();
        if (!isWall) onEditSize?.();
      }}
      onTap={e => {
        e.cancelBubble = true;
        onSelect?.();
        if (!isWall) onEditSize?.();
      }}
    >

      {/* --- your existing art frame --- */}
      {!isWall && image && (
        <Rect
          x={-7.5} y={-7.5}
          width={displayWidth + 15}
          height={displayHeight + 15}
          fill="#fff"
          stroke="#8B4513"
          strokeWidth={4}
          cornerRadius={6}
          shadowColor="rgba(0,0,0,0.25)"
          shadowBlur={10}
          shadowOffset={{ x: 3, y: 3 }}
          shadowOpacity={0.6}
        />
      )}

      <KonvaImage
        name={isWall ? "wall" : undefined}
        image={image}
        x={0} y={0}
        width={displayWidth}
        height={displayHeight}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={0.6}
        shadowOffsetX={isSelected ? 3 : 0}
        shadowOffsetY={isSelected ? 3 : 0}
        cornerRadius={isWall ? 0 : 5}
      />

      {/* --- delete icon --- */}
      {!isWall && (
        <Text
          ref={deleteRef}
          text="🗑️"
          fontSize={20}
          x={displayWidth + 15}
          y={displayHeight - 15}
          opacity={0}           // start hidden
          listening             // always catch events
          hitStrokeWidth={10}   // bigger clickable area
          onClick={e => {
            e.cancelBubble = true;
            onDelete?.();
          }}
          onMouseEnter={e => {
            const stage = e.target.getStage();
            if (stage) {
              const container = stage.container();
              if (container) {
                container.style.cursor = "pointer";
              }
            }
          }}
          
          onMouseLeave={e => {
            const stage = e.target.getStage();
            if (stage) {
              const container = stage.container();
              if (container) {
                container.style.cursor = "default";
              }
            }
          }}
        />
      )}

      {/* --- edit-size icon --- */}
      {!isWall && (
        <Text
          ref={editRef}
          text="✎"
          fontSize={20}
          x={displayWidth + 15}
          y={displayHeight - 48}
          opacity={0}
          listening
          hitStrokeWidth={10}
          onClick={e => {
            e.cancelBubble = true;
            onEditSize?.();
          }}
          onMouseEnter={e => {
               const stage = e.target.getStage();
               if (stage) {
                 stage.container().style.cursor = "pointer";
               }
             }}
             onMouseLeave={e => {
                 const stage = e.target.getStage();
                 if (stage) {
                   stage.container().style.cursor = "default";
                 }
               }}
        />
      )}
    </Group>
  );
}
