// backend/src/models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  googleId?: string;
  password?: string;
  profileImage?: string;
  role: 'admin' | 'seller' | 'customer';
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true },
  password: { 
    type: String,
    required: function() { return !this.googleId },
  },
  profileImage: { type: String },
  role: { type: String, enum: ['admin', 'seller', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now },
});

// hash password before save (Promise‑style, no next)
UserSchema.pre('save', async function () {
  // only hash when password is set and modified
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (candidate: string) {
  if (!this.password) {
    // no password on OAuth‑only user
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
