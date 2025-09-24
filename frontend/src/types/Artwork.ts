// src/types/Artwork.ts

/**
 * Represents a piece of art placed on the wall canvas.
 * - id: unique identifier for this instance (e.g. `${productId}-${sizeIndex}-${instanceIndex}`)
 * - src: image URL
 * - x, y: top-left coordinates on the canvas
 * - width, height: displayed dimensions in pixels
 * - productId: original product's ID (for cart sync)
 * - sizeIndex: which size preset was used
 */
export interface Artwork {
  id: string;
  itemId: string | null; // CartItem._id
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  productId: string;
  sizeIndex: number;
}
