// backend/src/models/Cart.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

interface CartItem {
  _id?: Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  sizeIndex: number;

  // NEW fields for wall placement
  positionX: number;  // left/right offset
  positionY: number;  // top/bottom offset
  scale: number;      // zoom/resize factor
  rotation: number;   // angle in degrees
  zIndex: number;     // stacking order
}


export interface CartDocument extends Document {
  user: mongoose.Types.ObjectId;       // reference to the customer
  items: CartItem[];                  // array of line‑items
  updatedAt: Date;
}

const CartItemSchema = new Schema<CartItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  sizeIndex: { type: Number, required: true },

  // NEW placement fields (with defaults)
  positionX: { type: Number, default: 0 },
  positionY: { type: Number, default: 0 },
  scale: { type: Number, default: 1 },
  rotation: { type: Number, default: 0 },
  zIndex: { type: Number, default: 0 },
});

const CartSchema = new Schema<CartDocument>({
  user:  { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [CartItemSchema], default: [] },
}, {
  timestamps: { updatedAt: true, createdAt: false }
});

export default mongoose.model<CartDocument>('Cart', CartSchema);
