'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiFileText, FiChevronRight } from 'react-icons/fi';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
  };
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
}

export default function RecentInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentInvoices = async () => {
      try {
        const response = await fetch('/api/invoices?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        
        const data = await response.json();
        setInvoices(data.invoices);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchRecentInvoices();
  }, []);

  // Placeholder data for development
  const placeholderInvoices = [
    {
      _id: '1',
      invoiceNumber: 'INV-2023-001',
      customer: { _id: '1', name: 'Acme Inc' },
      total: 1250.00,
      status: 'paid' as const,
      dueDate: '2023-03-30T00:00:00Z',
    },
    {
      _id: '2',
      invoiceNumber: 'INV-2023-002',
      customer: { _id: '2', name: 'Tech Solutions' },
      total: 875.50,
      status: 'sent' as const,
      dueDate: '2023-04-15T00:00:00Z',
    },
    {
      _id: '3',
      invoiceNumber: 'INV-2023-003',
      customer: { _id: '3', name: 'Creative Designs' },
      total: 2340.00,
      status: 'overdue' as const,
      dueDate: '2023-03-10T00:00:00Z',
    },
    {
      _id: '4',
      invoiceNumber: 'INV-2023-004',
      customer: { _id: '4', name: 'Brown Consulting' },
      total: 1100.00,
      status: 'draft' as const,
      dueDate: '2023-04-20T00:00:00Z',
    },
    {
      _id: '5',
      invoiceNumber: 'INV-2023-005',
      customer: { _id: '5', name: 'Global Imports' },
      total: 3560.25,
      status: 'sent' as const,
      dueDate: '2023-04-05T00:00:00Z',
    },
  ];

  const displayInvoices = invoices.length > 0 ? invoices : placeholderInvoices;

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {displayInvoices.map((invoice) => (
          <li key={invoice._id}>
            <Link 
              href={`/invoices/${invoice._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiFileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 px-4">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">{invoice.invoiceNumber}</p>
                      <p className="mt-1 text-sm text-gray-500 truncate">{invoice.customer.name}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    ${invoice.total.toFixed(2)}
                  </span>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
                <div className="ml-4">
                  <FiChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right">
        <Link 
          href="/invoices" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          View all invoices
        </Link>
      </div>
    </div>
  );
}