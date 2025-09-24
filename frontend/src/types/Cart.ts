
// src/types/Cart.ts

import type { Product } from './Product';

export interface CartItem {
  _id: string;        // ← new
  product: Product;
  quantity: number;
  sizeIndex: number;
  positionX?: number; // normalized 0..1
  positionY?: number;
  scale?: number;
  rotation?: number;
  zIndex?: number;
}

export interface Cart {
  user: string;
  items: CartItem[];
  updatedAt: string;
}