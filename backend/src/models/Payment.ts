// backend/src/models/Payment.ts
import mongoose, { Schema, Document } from "mongoose";

export interface PaymentDocument extends Document {
  order: mongoose.Types.ObjectId;
  amount: number;
  status: "success" | "failed";
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  createdAt: Date;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    stripePaymentIntentId: { type: String, required: true },
    stripeCustomerId: { type: String },
    paymentMethod: {
      brand: { type: String },
      last4: { type: String },
      expMonth: { type: Number },
      expYear: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model<PaymentDocument>("Payment", PaymentSchema);
