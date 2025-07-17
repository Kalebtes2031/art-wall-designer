import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,      // original upload URL
  transparentUrl: String, // processed background‑removed image URL
  widthCm: Number,
  heightCm: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', ProductSchema);