'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiSave, FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin, FiFileText } from 'react-icons/fi';

interface CustomerFormProps {
  customerId?: string;
  isEditMode?: boolean;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
}

export default function CustomerForm({ customerId, isEditMode = false }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddressFields, setShowAddressFields] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<CustomerFormData>({
    defaultValues: {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    }
  });

  // Watch address fields to determine if any are filled
  const addressFields = watch('address');

  useEffect(() => {
    // Show address section if any address field has a value
    if (
      addressFields?.street || 
      addressFields?.city || 
      addressFields?.state || 
      addressFields?.zipCode || 
      addressFields?.country
    ) {
      setShowAddressFields(true);
    }
  }, [addressFields]);

  useEffect(() => {
    if (isEditMode && customerId) {
      // Fetch customer data if in edit mode
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/customers/${customerId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch customer data');
          }
          
          const customerData = await response.json();
          
          // Show address fields if customer has address data
          if (customerData.address) {
            setShowAddressFields(true);
          }
          
          // Reset form with fetched data
          reset(customerData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [isEditMode, customerId, reset]);

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEditMode
        ? `/api/customers/${customerId}`
        : '/api/customers';
      
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
        throw new Error(errorData.error || 'Failed to save customer');
      }

      setSuccess(
        isEditMode
          ? 'Customer updated successfully!'
          : 'Customer created successfully!'
      );

      if (!isEditMode) {
        // Clear form if creating a new customer
        reset();
        setShowAddressFields(false);
      }

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard/customers');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Scroll to top to show error
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-blue-500 border-b">
        <h3 className="text-xl font-semibold text-white">
          {isEditMode ? 'Edit Customer' : 'New Customer'}
        </h3>
        <p className="mt-1 text-sm text-indigo-100">
          {isEditMode
            ? 'Update customer information'
            : 'Add a new customer to your business'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg animate-fadeIn">
            <div className="flex items-center">
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
          <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiSave className="h-5 w-5 text-green-500" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiUser className="mr-2 text-indigo-500" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    {...register('name', { required: 'Name is required' })}
                    className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
                      errors.name 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                  {errors.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiX className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder="customer@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`block w-full pl-10 pr-10 focus:outline-none sm:text-sm rounded-md ${
                      errors.email 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiX className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+1 (555) 987-6543"
                    {...register('phone', { required: 'Phone number is required' })}
                    className={`block w-full pl-10 pr-10 focus:outline-none sm:text-sm rounded-md ${
                      errors.phone 
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                  {errors.phone && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiX className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Company */}
              <div className="sm:col-span-3">
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="company"
                    placeholder="Acme Inc."
                    {...register('company')}
                    className="block w-full pl-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none sm:text-sm rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section - Collapsible */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowAddressFields(!showAddressFields)}
            >
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiMapPin className="mr-2 text-indigo-500" />
                Address Information
              </h3>
              <button 
                type="button"
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                {showAddressFields ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showAddressFields && (
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 animate-fadeIn">
                {/* Street */}
                <div className="sm:col-span-6">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="street"
                      placeholder="123 Main St"
                      {...register('address.street')}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="sm:col-span-3">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="city"
                      placeholder="San Francisco"
                      {...register('address.city')}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State/Province
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="state"
                      placeholder="California"
                      {...register('address.state')}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Zip & Country */}
                <div className="sm:col-span-3">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Zip/Postal Code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="zipCode"
                      placeholder="94103"
                      {...register('address.zipCode')}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="country"
                      placeholder="United States"
                      {...register('address.country')}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiFileText className="mr-2 text-indigo-500" />
              Additional Notes
            </h3>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Add any additional information about this customer..."
                  {...register('notes')}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Add any relevant details about the customer that might be helpful for your team.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (!isDirty && isEditMode)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <FiSave className="mr-2 -ml-1" />
                <span>{isEditMode ? 'Update Customer' : 'Create Customer'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
