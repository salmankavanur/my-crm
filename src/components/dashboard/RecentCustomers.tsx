'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiChevronRight } from 'react-icons/fi';

interface Customer {
  _id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
}

export default function RecentCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentCustomers = async () => {
      try {
        const response = await fetch('/api/customers?limit=5');
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        setCustomers(data.customers);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchRecentCustomers();
  }, []);

  // Placeholder data for development
  const placeholderCustomers = [
    {
      _id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      company: 'Acme Inc',
      createdAt: '2023-03-15T14:30:00Z',
    },
    {
      _id: '2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      company: 'Tech Solutions',
      createdAt: '2023-03-14T09:15:00Z',
    },
    {
      _id: '3',
      name: 'Jessica Williams',
      email: 'jessica@example.com',
      company: 'Creative Designs',
      createdAt: '2023-03-13T16:45:00Z',
    },
    {
      _id: '4',
      name: 'David Brown',
      email: 'david@example.com',
      company: 'Brown Consulting',
      createdAt: '2023-03-12T11:20:00Z',
    },
    {
      _id: '5',
      name: 'Emma Rodriguez',
      email: 'emma@example.com',
      company: 'Global Imports',
      createdAt: '2023-03-11T13:50:00Z',
    },
  ];

  const displayCustomers = customers.length > 0 ? customers : placeholderCustomers;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Recent Customers</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {displayCustomers.map((customer) => (
          <li key={customer._id}>
            <Link 
              href={`/dashboard/customers/${customer._id}`}
              className="block hover:bg-gray-50"
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FiUser className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 px-4">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">{customer.name}</p>
                      <p className="mt-1 text-sm text-gray-500 truncate">{customer.email}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        {customer.company && `${customer.company} · `}
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <FiChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right">
        <Link 
          href="/dashboard/customers" 
          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
        >
          View all customers
        </Link>
      </div>
    </div>
  );
}