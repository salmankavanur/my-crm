import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from './Customer';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customer: mongoose.Types.ObjectId | ICustomer;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
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
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    notes: { type: String },
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
  
  // Calculate final total
  this.total = this.subtotal + this.tax;
  
  next();
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);