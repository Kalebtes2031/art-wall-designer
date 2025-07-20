// src/types/Order.ts

export interface OrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
  };
  quantity: number;
  priceAtOrder: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface Order {
  _id: string;
  user: string;           // user ID
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
