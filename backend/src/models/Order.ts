// backend/src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  priceAtOrder: number;    // snapshot of the price when ordered
}

export interface OrderDocument extends Document {
  user: mongoose.Types.ObjectId;       // who ordered
  items: OrderItem[];
  total: number;                       // sum(quantity * priceAtOrder)
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  product:      { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:     { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true, min: 0 },
}, { _id: false });

const OrderSchema = new Schema<OrderDocument>({
  user:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items:  { type: [OrderItemSchema], required: true },
  total:  { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending','paid','shipped','cancelled'], default: 'pending' },
}, {
  timestamps: true
});

export default mongoose.model<OrderDocument>('Order', OrderSchema);
