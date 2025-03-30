// src/types/index.ts
export interface Address {
    street?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  }
  
  export interface Currency {
    code: string;
    symbol: string;
    name: string;
  }
  
  export interface Branch {
    _id: string;
    name: string;
    code: string;
    address: Address;
    phone?: string;
    email?: string;
    currency: Currency;
    taxRate: number;
    timeZone: string;
    active: boolean;
  }
  
  export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: Address;
    notes?: string;
  }
  
  export interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
  }
  
  export interface Invoice {
    _id: string;
    invoiceNumber: string;
    customer: string | Customer;
    branch: string | Branch;
    issueDate: string | Date;
    dueDate: string | Date;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    taxRate: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    currency: Currency;
    notes?: string;
  }
  
  export interface Project {
    _id: string;
    title: string;
    description: string;
    customer: string | Customer;
    branch: string | Branch;
    startDate: string | Date;
    endDate?: string | Date;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    progress: number;
    currency: Currency;
  }
  
  export interface Quotation {
    _id: string;
    quotationNumber: string;
    customer: string | Customer;
    branch: string | Branch;
    issueDate: string | Date;
    validUntil: string | Date;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    taxRate: number;
    total: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
    currency: Currency;
    notes?: string;
  }