import { Stage, Layer } from 'react-konva';
import ArtImage from './ArtImage';
import useImage from 'use-image';

export default function CanvasArea({
  wallUrl,
  artworks
}: {
  wallUrl: string;
  artworks: { src: string; x: number; y: number }[];
}) {
  const [wallImage] = useImage(wallUrl);

  return (
    <Stage width={window.innerWidth - 250} height={window.innerHeight}>
      <Layer>
        {wallImage && <ArtImage src={wallUrl} x={0} y={0} />}
        {artworks.map((a, i) => (
          <ArtImage key={i} src={a.src} x={a.x} y={a.y} />
        ))}
      </Layer>
    </Stage>
  );
}
