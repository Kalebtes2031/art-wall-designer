// src/types/Product.ts
export interface Seller {
  _id: string;
  name: string;
  email: string;
}

export interface Size {
  widthCm: number;
  heightCm: number;
}

export interface EditSize {
  widthCm: string; // form inputs as strings
  heightCm: string;
}

export interface EditFormState {
  title: string;
  description: string;
  price: string;
  orientation: 'portrait' | 'landscape';
  sizes: EditSize[];
}

export interface Product {
  _id: string;
  seller: Seller;          // populated with name & email
  title: string;
  description?: string;
  price: number;
  orientation: 'portrait' | 'landscape';
  sizes: Size[];
  imageUrl: string;
  transparentUrl?: string;
  createdAt: string;
}
