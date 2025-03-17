'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUser, FiEdit2, FiTrash2, FiExternalLink, FiMail, FiPhone, FiMoreHorizontal, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    status: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const fetchCustomers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (search) {
        queryParams.append('search', search);
      }

      const response = await fetch(`/api/customers?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data.customers);
      setPaginationInfo(data.pageInfo);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1, searchQuery);
  }, [searchQuery]);

  const placeholderCustomers = [
    { _id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(555) 123-4567', company: 'Acme Inc', createdAt: '2023-03-15T14:30:00Z' },
    { _id: '2', name: 'Michael Chen', email: 'michael@example.com', phone: '(555) 234-5678', company: 'Tech Solutions', createdAt: '2023-03-14T09:15:00Z' },
    { _id: '3', name: 'Jessica Williams', email: 'jessica@example.com', phone: '(555) 345-6789', company: 'Creative Designs', createdAt: '2023-03-13T16:45:00Z' },
    { _id: '4', name: 'David Brown', email: 'david@example.com', phone: '(555) 456-7890', company: 'Brown Consulting', createdAt: '2023-03-12T11:20:00Z' },
    { _id: '5', name: 'Emma Rodriguez', email: 'emma@example.com', phone: '(555) 567-8901', company: 'Global Imports', createdAt: '2023-03-11T13:50:00Z' },
  ];

  const displayCustomers = customers.length > 0 ? customers : placeholderCustomers;

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= paginationInfo.totalPages) {
      fetchCustomers(newPage, searchQuery);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete customer');
        fetchCustomers(paginationInfo.currentPage, searchQuery);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  const toggleActionMenu = (id: string) => {
    setShowActionMenu(showActionMenu === id ? null : id);
  };

  const sortableColumns = [
    { id: 'name', label: 'Customer' },
    { id: 'email', label: 'Contact' },
    { id: 'company', label: 'Company' },
    { id: 'createdAt', label: 'Created' },
  ];

  const handleSort = (columnId: string) => {
    const newSortOrder = filterOptions.sortBy === columnId && filterOptions.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilterOptions({ ...filterOptions, sortBy: columnId, sortOrder: newSortOrder });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="loader"></div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {sortableColumns.map((column) => (
                <th
                  key={column.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(column.id)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {filterOptions.sortBy === column.id && (
                      <FiChevronDown className={`ml-1 h-4 w-4 ${filterOptions.sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayCustomers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        <Link href={`/dashboard/customers/${customer._id}`} className="hover:text-indigo-600">
                          {customer.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiMail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${customer.email}`} className="hover:text-indigo-600">
                        {customer.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <FiPhone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${customer.phone}`} className="hover:text-indigo-600">
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.company || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link href={`/dashboard/customers/${customer._id}`} className="text-indigo-600 hover:text-indigo-900" title="View details">
                      <FiExternalLink className="h-5 w-5" />
                    </Link>
                    <Link href={`/dashboard/customers/${customer._id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit customer">
                      <FiEdit2 className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDelete(customer._id)} className="text-red-600 hover:text-red-900" title="Delete customer">
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => toggleActionMenu(customer._id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="More options"
                      >
                        <FiMoreHorizontal className="h-5 w-5" />
                      </button>
                      {showActionMenu === customer._id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1">
                            <Link
                              href={`/invoices/create?customerId=${customer._id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Create invoice
                            </Link>
                            <a href={`mailto:${customer.email}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Send email
                            </a>
                            <button
                              onClick={() => toggleActionMenu(customer._id)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Add to segment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
            disabled={paginationInfo.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="mr-1 h-4 w-4" /> Previous
          </button>
          <button
            onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
            disabled={paginationInfo.currentPage === paginationInfo.totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <FiChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{((paginationInfo.currentPage - 1) * 10) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(paginationInfo.currentPage * 10, paginationInfo.totalCustomers || 10)}
              </span>{' '}
              of <span className="font-medium">{paginationInfo.totalCustomers || placeholderCustomers.length}</span> customers
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                disabled={paginationInfo.currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <FiChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, paginationInfo.totalPages || 1) }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      paginationInfo.currentPage === pageNumber
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                disabled={paginationInfo.currentPage === paginationInfo.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <FiChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3">
              <div className="flex items-center justify-between flex-wrap">
                <div className="w-0 flex-1 flex items-center">
                  <span className="flex p-2 rounded-lg bg-indigo-800">
                    <FiUser className="h-6 w-6 text-white" />
                  </span>
                  <p className="ml-3 font-medium text-white truncate">
                    <span className="md:hidden">Customer selected</span>
                    <span className="hidden md:inline">1 customer selected</span>
                  </p>
                </div>
                <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                  <div className="flex space-x-2">
                    <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50">
                      Send Email
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50">
                      Add to Segment
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50">
                      Create Invoice
                    </button>
                  </div>
                </div>
                <div className="order-2 sm:order-3 sm:ml-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}