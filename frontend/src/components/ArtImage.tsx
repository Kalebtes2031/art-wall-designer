import { useEffect, useRef, useState } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';

export default function ArtImage({
  src,
  x,
  y
}: {
  src: string;
  x: number;
  y: number;
}) {
  const [image] = useImage(src);
  const ref = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (selected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selected]);

  return (
    <>
      <KonvaImage
        image={image}
        x={x}
        y={y}
        ref={ref}
        draggable
        onClick={() => setSelected(true)}
      />
      {selected && <Transformer ref={trRef} />}
    </>
  );
}
