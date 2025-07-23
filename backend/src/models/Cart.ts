// backend/src/models/Cart.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

interface CartItem {
   _id?: Types.ObjectId; 
  product: mongoose.Types.ObjectId;
  quantity: number;
  sizeIndex: number;
}

export interface CartDocument extends Document {
  user: mongoose.Types.ObjectId;       // reference to the customer
  items: CartItem[];                  // array of line‑items
  updatedAt: Date;
}

const CartItemSchema = new Schema<CartItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  sizeIndex: { type: Number, required: true }
});

const CartSchema = new Schema<CartDocument>({
  user:  { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [CartItemSchema], default: [] },
}, {
  timestamps: { updatedAt: true, createdAt: false }
});

export default mongoose.model<CartDocument>('Cart', CartSchema);
