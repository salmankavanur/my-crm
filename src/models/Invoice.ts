// src/models/Invoice.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from './Customer';
import { IBranch } from './Branch';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customer: mongoose.Types.ObjectId | ICustomer;
  branch: mongoose.Types.ObjectId | IBranch;  // Added branch reference
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;  // Store the tax rate used (from branch)
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: {  // Store the currency information at time of invoice creation
    code: string;
    symbol: string;
    name: string;
  };
  notes?: string;
  paymentDetails?: {
    method?: string;
    transactionId?: string;
    datePaid?: Date;
    amount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
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
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    currency: {
      code: { type: String, required: true },
      symbol: { type: String, required: true },
      name: { type: String, required: true }
    },
    notes: { type: String },
    paymentDetails: {
      method: { type: String },
      transactionId: { type: String },
      datePaid: { type: Date },
      amount: { type: Number }
    }
  },
  { timestamps: true }
);

// Middleware to automatically calculate totals before saving
InvoiceSchema.pre('save', function (this: IInvoice, next) {
  // Calculate item totals
  this.items.forEach((item: InvoiceItem) => {
    item.total = item.quantity * item.price;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum: number, item: InvoiceItem) => sum + item.total, 0);
  
  // Calculate tax if tax rate is specified
  if (this.taxRate > 0) {
    this.tax = this.subtotal * (this.taxRate / 100);
  }
  
  // Calculate final total
  this.total = this.subtotal + this.tax;
  
  next();
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);