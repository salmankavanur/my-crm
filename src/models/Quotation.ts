// src/models/Quotation.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from './Customer';
import { IBranch } from './Branch';

interface QuotationItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  customer: mongoose.Types.ObjectId | ICustomer;
  branch: mongoose.Types.ObjectId | IBranch;
  project?: mongoose.Types.ObjectId;
  issueDate: Date;
  validUntil: Date;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  convertedToInvoiceId?: mongoose.Types.ObjectId;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema: Schema<IQuotation> = new Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    issueDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'],
      default: 'draft',
    },
    convertedToInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    currency: {
      code: { type: String, required: true },
      symbol: { type: String, required: true },
      name: { type: String, required: true }
    },
    notes: { type: String },
    terms: { type: String }
  },
  { timestamps: true }
);

// Middleware to automatically calculate totals before saving
QuotationSchema.pre('save', function (this: IQuotation, next) {
  // Calculate item totals
  this.items.forEach((item: QuotationItem) => {
    item.total = item.quantity * item.price;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum: number, item: QuotationItem) => sum + item.total, 0);
  
  // Calculate tax if tax rate is specified
  if (this.taxRate > 0) {
    this.tax = this.subtotal * (this.taxRate / 100);
  }
  
  // Calculate final total
  this.total = this.subtotal + this.tax;
  
  next();
});

export default mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);