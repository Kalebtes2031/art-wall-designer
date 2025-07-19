// src/types/Product.ts
export interface Seller {
  _id: string;
  name: string;
  email: string;
}

export interface Product {
  _id: string;
  seller: Seller;          // populated with name & email
  title: string;
  description?: string;
  price: number;
  orientation: 'portrait' | 'landscape';
  widthCm: number;
  heightCm: number;
  imageUrl: string;
  transparentUrl?: string;
  createdAt: string;
}
