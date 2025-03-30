// src/components/invoices/InvoiceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiSave, FiX, FiPlus, FiTrash, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import BranchSelector from '@/components/ui/BranchSelector';
import { Customer, Branch, InvoiceItem, Currency } from '@/types';

interface InvoiceFormData {
  customer: string;
  branch: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: Currency;
  notes?: string;
}

interface InvoiceFormProps {
  invoiceId?: string;
  isEditMode?: boolean;
}

export default function InvoiceForm({ invoiceId, isEditMode = false }: InvoiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      customer: '',
      branch: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, price: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      taxRate: 0,
      total: 0,
      status: 'draft',
      currency: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
      },
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchTaxRate = watch('taxRate');
  const watchBranch = watch('branch');

  // Set branch-specific details
  const handleBranchChange = (branch: Branch) => {
    setSelectedBranch(branch);
    
    // Set currency from branch
    setValue('currency', branch.currency);
    
    // Set default tax rate from branch
    setValue('taxRate', branch.taxRate);
  };

  // Calculate totals when items or tax rate change
  useEffect(() => {
    if (watchItems) {
      // Calculate item totals and subtotal
      const updatedItems = watchItems.map(item => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const total = quantity * price;
        return { ...item, total };
      });

      // Update each item's total
      updatedItems.forEach((item, index) => {
        setValue(`items.${index}.total`, item.total);
      });

      // Calculate subtotal
      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      setValue('subtotal', subtotal);

      // Calculate tax based on tax rate
      const taxRate = Number(watchTaxRate) || 0;
      const tax = (subtotal * taxRate) / 100;
      setValue('tax', tax);

      // Calculate final total
      setValue('total', subtotal + tax);
    }
  }, [watchItems, watchTaxRate, setValue]);

  // Fetch customers for dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers?limit=100');
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        setCustomers(data.customers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchCustomers();
  }, []);

  // If we're in create mode and there's a customerId in the query params, use it
  useEffect(() => {
    if (!isEditMode) {
      const preselectedCustomerId = searchParams.get('customerId');
      if (preselectedCustomerId) {
        setValue('customer', preselectedCustomerId);
        
        // Find the customer details to display
        const selectedCustomer = customers.find(c => c._id === preselectedCustomerId);
        if (selectedCustomer) {
          setSelectedCustomer(selectedCustomer);
        }
      }
    }
  }, [isEditMode, searchParams, setValue, customers]);

  // Fetch invoice data if in edit mode
  useEffect(() => {
    if (isEditMode && invoiceId) {
      const fetchInvoice = async () => {
        try {
          const response = await fetch(`/api/invoices/${invoiceId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch invoice data');
          }
          
          const invoiceData = await response.json();
          
          // Format dates for the form
          const formattedData = {
            ...invoiceData,
            customer: typeof invoiceData.customer === 'object' ? invoiceData.customer._id : invoiceData.customer,
            branch: typeof invoiceData.branch === 'object' ? invoiceData.branch._id : invoiceData.branch,
            issueDate: new Date(invoiceData.issueDate).toISOString().split('T')[0],
            dueDate: new Date(invoiceData.dueDate).toISOString().split('T')[0],
          };
          
          // Set the selected customer
          if (typeof invoiceData.customer === 'object') {
            setSelectedCustomer(invoiceData.customer);
          }
          
          // Set the selected branch
          if (typeof invoiceData.branch === 'object') {
            setSelectedBranch(invoiceData.branch);
          }
          
          // Reset form with fetched data
          reset(formattedData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setInitialLoading(false);
        }
      };

      fetchInvoice();
    } else {
      setInitialLoading(false);
    }
  }, [isEditMode, invoiceId, reset]);

  // Handle customer selection
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    
    if (customerId) {
      const selectedCustomer = customers.find(c => c._id === customerId);
      if (selectedCustomer) {
        setSelectedCustomer(selectedCustomer);
      }
    } else {
      setSelectedCustomer(null);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Make sure we have a branch selected
      if (!data.branch) {
        throw new Error('Please select a branch');
      }

      const url = isEditMode
        ? `/api/invoices/${invoiceId}`
        : '/api/invoices';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to save invoice');
      }

      const result = await response.json();

      setSuccess(
        isEditMode
          ? 'Invoice updated successfully!'
          : 'Invoice created successfully!'
      );

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/dashboard/invoices/${result.invoice._id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add a new empty item to the invoice
  const addItem = () => {
    append({ description: '', quantity: 1, price: 0, total: 0 });
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {isEditMode ? 'Edit Invoice' : 'New Invoice'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? 'Update invoice information'
            : 'Create a new invoice for your customer'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiSave className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Branch Selection */}
          <div className="sm:col-span-3">
            <BranchSelector
              value={watchBranch}
              onChange={(branchId) => setValue('branch', branchId)}
              onBranchChange={handleBranchChange}
              label="Branch"
              showCurrency={true}
              required={true}
              error={errors.branch?.message as string}
            />
            {selectedBranch && (
              <div className="mt-2 bg-blue-50 p-2 rounded-md">
                <p className="text-xs text-blue-700 flex items-center">
                  <FiInfo className="mr-1" /> 
                  Using {selectedBranch.currency.name} ({selectedBranch.currency.code}) for this invoice
                </p>
              </div>
            )}
          </div>

          {/* Customer Selection */}
          <div className="sm:col-span-3">
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
              Customer <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <select
                id="customer"
                {...register('customer', { required: 'Please select a customer' })}
                onChange={handleCustomerChange}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.customer ? 'border-red-300' : ''
                }`}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} {customer.company && `(${customer.company})`}
                  </option>
                ))}
              </select>
              {errors.customer && (
                <p className="mt-1 text-sm text-red-600">{errors.customer.message}</p>
              )}
            </div>
          </div>

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <div className="sm:col-span-6 bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                </div>
                {selectedCustomer.company && (
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm text-gray-900">{selectedCustomer.company}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="sm:col-span-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="mt-1">
              <select
                id="status"
                {...register('status')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Issue Date */}
          <div className="sm:col-span-2">
            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
              Issue Date <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="issueDate"
                {...register('issueDate', { required: 'Issue date is required' })}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.issueDate ? 'border-red-300' : ''
                }`}
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="sm:col-span-2">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="dueDate"
                {...register('dueDate', { required: 'Due date is required' })}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.dueDate ? 'border-red-300' : ''
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Invoice Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="mr-1 -ml-1 h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="relative px-6 py-3 w-10">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          {...register(`items.${index}.description` as const, {
                            required: 'Description is required',
                          })}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Item description"
                        />
                        {errors.items?.[index]?.description && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          {...register(`items.${index}.quantity` as const, {
                            required: 'Quantity is required',
                            min: {
                              value: 1,
                              message: 'Quantity must be at least 1',
                            },
                            valueAsNumber: true,
                          })}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.items[index]?.quantity?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              {selectedBranch?.currency.symbol || '$'}
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            {...register(`items.${index}.price` as const, {
                              required: 'Price is required',
                              min: {
                                value: 0,
                                message: 'Price must be at least 0',
                              },
                              valueAsNumber: true,
                            })}
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        {errors.items?.[index]?.price && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.items[index]?.price?.message}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              {selectedBranch?.currency.symbol || '$'}
                            </span>
                          </div>
                          <input
                            type="number"
                            readOnly
                            value={watchItems[index]?.total || 0}
                            className="bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="sm:col-span-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-700">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedBranch ? selectedBranch.currency.symbol : '$'}{watch('subtotal').toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 items-center">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-3">Tax Rate:</span>
                  <div className="relative rounded-md shadow-sm w-24">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max="100"
                      {...register('taxRate', {
                        min: 0,
                        max: 100,
                        valueAsNumber: true,
                      })}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-8 sm:text-sm border-gray-300 rounded-md"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {selectedBranch ? selectedBranch.currency.symbol : '$'}{watch('tax').toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-base font-medium text-gray-900">Total:</span>
                <span className="text-base font-medium text-gray-900">
                  {selectedBranch ? selectedBranch.currency.symbol : '$'}{watch('total').toFixed(2)} 
                  {selectedBranch && <span className="text-xs ml-1 text-gray-500">({selectedBranch.currency.code})</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="sm:col-span-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <div className="mt-1">
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Additional notes or payment instructions"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FiSave className="mr-2 -ml-1" />
                {isEditMode ? 'Update Invoice' : 'Create Invoice'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}