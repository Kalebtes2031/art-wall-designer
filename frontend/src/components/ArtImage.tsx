import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Transformer, Rect, Group } from "react-konva";
import useImage from "use-image";

export default function ArtImage({
  id,
  src,
  x,
  y,
  isWall = false,
  scaleX = 1,
  scaleY = 1,
  isSelected,
  onSelect,
}: {
  id?: string;
  src: string;
  x: number;
  y: number;
  isWall?: boolean;
  scaleX?: number;
  scaleY?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const [image] = useImage(src);
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (image) {
      setNaturalSize({ width: image.width, height: image.height });
    }
  }, [image]);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        x={x}
        y={y}
        ref={groupRef}
        draggable={!isWall}
        onClick={() => {
          if (!isWall) {
            onSelect?.();
          } else {
            onSelect?.(); // allow wall clicks to clear selection
          }
        }}
        onTap={() => {
          if (!isWall) {
            onSelect?.();
          } else {
            onSelect?.();
          }
        }}
        scaleX={scaleX}
        scaleY={scaleY}
      >
        {!isWall && image && (
          <Rect
            x={-10}
            y={-10}
            width={image.width + 20}
            height={image.height + 20}
            fill="#e0c097"
            stroke="#8B4513"
            strokeWidth={12}
            cornerRadius={6}
            shadowColor="rgba(0,0,0,0.25)"
            shadowBlur={10}
            shadowOffset={{ x: 3, y: 3 }}
            shadowOpacity={0.6}
          />
        )}

        <KonvaImage
          image={image}
          x={0}
          y={0}
          shadowColor="rgba(0,0,0,0.3)"
          shadowBlur={isSelected ? 10 : 0}
          shadowOpacity={0.6}
          shadowOffsetX={isSelected ? 3 : 0}
          shadowOffsetY={isSelected ? 3 : 0}
          cornerRadius={isWall ? 0 : 5}
        />
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          borderEnabled={false}
          anchorStroke="#3b82f6"
          anchorFill="#ffffff"
          anchorStrokeWidth={2}
          anchorSize={10}
          rotateAnchorOffset={25}
          borderStroke="#3b82f6"
          borderDash={[4, 4]}
          borderStrokeWidth={1.5}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (
              newBox.width < naturalSize.width * 0.1 ||
              newBox.height < naturalSize.height * 0.1
            ) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
