// components/ArtImage.tsx
import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Transformer, Rect } from "react-konva"; // ⬅️ Add Rect
import useImage from "use-image";

export default function ArtImage({
  src,
  x,
  y,
  isWall = false,
  scaleX = 1,
  scaleY = 1,
}: {
  src: string;
  x: number;
  y: number;
  isWall?: boolean;
  scaleX?: number;
  scaleY?: number;
}) {
  const [image] = useImage(src);
  const ref = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [selected, setSelected] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Capture natural image dimensions
  useEffect(() => {
    if (image) {
      setNaturalSize({ width: image.width, height: image.height });
    }
  }, [image]);

  // Set up transformer when selected
  useEffect(() => {
    if (selected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selected]);

  return (
    <>
      {/* ✅ Frame Rectangle (only if it's not the wall) */}
      {!isWall && image && (
        <Rect
          x={x - 10} // frame padding
          y={y - 10}
          width={image.width + 20}
          height={image.height + 20}
          fill="#e0c097" // light wood interior (like matting)
          stroke="#8B4513" // dark brown wood frame (SaddleBrown)
          strokeWidth={12} // thicker border = frame depth
          cornerRadius={6}
          shadowColor="rgba(0,0,0,0.25)" // soft shadow for realism
          shadowBlur={10}
          shadowOffset={{ x: 3, y: 3 }}
          shadowOpacity={0.6}
        />
      )}

      <KonvaImage
        image={image}
        x={x}
        y={y}
        ref={ref}
        draggable={!isWall}
        scaleX={scaleX}
        scaleY={scaleY}
        onClick={() => !isWall && setSelected(true)}
        onTap={() => !isWall && setSelected(true)}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={selected ? 10 : 0}
        shadowOpacity={0.6}
        shadowOffsetX={selected ? 3 : 0}
        shadowOffsetY={selected ? 3 : 0}
        cornerRadius={isWall ? 0 : 5}
      />

      {selected && (
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
