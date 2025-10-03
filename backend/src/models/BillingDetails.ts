// backend/src/models/BillingDetails.ts
import mongoose, { Schema, Document } from "mongoose";

export interface BillingDetailsDocument extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillingDetailsSchema = new Schema<BillingDetailsDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    phone: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<BillingDetailsDocument>(
  "BillingDetails",
  BillingDetailsSchema
);
