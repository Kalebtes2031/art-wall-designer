// backend/src/models/Scene.ts
import mongoose from 'mongoose';

const SceneSchema = new mongoose.Schema({
  wallUrl: String,
  artworks: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      x: Number,
      y: Number,
      scale: Number,
      rotation: Number,
    },
  ],
});

export default mongoose.model('Scene', SceneSchema);
