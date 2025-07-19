import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:     { type: Number, required: true },
  priceAtOrder: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:    [OrderItemSchema],
  total:    { type: Number, required: true },
  status:   { type: String, enum: ['pending','paid','shipped'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', OrderSchema);