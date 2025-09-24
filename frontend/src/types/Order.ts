// src/types/Order.ts (updated)
export interface OrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
  };
  quantity: number;
  priceAtOrder: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled' | 'completed';

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}