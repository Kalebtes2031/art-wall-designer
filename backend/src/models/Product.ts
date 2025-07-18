import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  sellerName: { type: String, required: true },
  sellerPhone: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: String,      // original upload URL
  transparentUrl: String, // processed background‑removed image URL
  widthCm: Number,
  heightCm: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', ProductSchema);