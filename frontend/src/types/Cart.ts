// src/types/Cart.ts

import type { Product } from './Product';

/**
 * A single item in the shopping cart.
 * - product: the full Product object
 * - quantity: how many units of that product
 * - sizeIndex: which size preset was chosen (index into product.sizes)
 */
export interface CartItem {
  product: Product;
  quantity: number;
  sizeIndex: number;
}

/**
 * The shopping cart model.
 * - user: ID of the cart's owner
 * - items: list of CartItem entries
 * - updatedAt: timestamp of last update
 */
export interface Cart {
  user: string;
  items: CartItem[];
  updatedAt: string;
}
