// src/models/Branch.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  code: string;  // Short code for the branch (e.g., "DXB" for Dubai)
  address: {
    street?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  phone?: string;
  email?: string;
  currency: {
    code: string;  // e.g., "AED", "INR", "USD"
    symbol: string;  // e.g., "₹", "$", "د.إ"
    name: string;  // e.g., "Indian Rupee", "US Dollar", "UAE Dirham"
  };
  taxRate: number;  // Default tax rate for this branch
  timeZone: string;  // e.g., "Asia/Dubai", "Asia/Kolkata"
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    address: {
      street: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, required: true },
    },
    phone: { type: String },
    email: { type: String },
    currency: {
      code: { type: String, required: true },
      symbol: { type: String, required: true },
      name: { type: String, required: true },
    },
    taxRate: { type: Number, default: 0 },
    timeZone: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);