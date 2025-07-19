import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  order:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount:    { type: Number, required: true },
  status:    { type: String, enum: ['success','failed'], default: 'success' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', PaymentSchema);