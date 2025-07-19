import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, text: true },
  description: { type: String, text: true },
  price: { type: Number, required: true },
  orientation: { type: String, enum: ['portrait','landscape'], required: true, default: 'portrait' },
  widthCm: { type: Number, required: true },
  heightCm: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  transparentUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Add a text index for fuzzy search:
ProductSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Product', ProductSchema);