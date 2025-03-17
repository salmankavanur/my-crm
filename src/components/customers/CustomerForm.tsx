'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiSave, FiX } from 'react-icons/fi';

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>();

  useEffect(() => {
    if (isEditMode && customerId) {
      // Fetch customer data if in edit mode
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`/api/customers/${customerId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch customer data');
          }
          
          const customerData = await response.json();
          
          // Reset form with fetched data
          reset(customerData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
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
      }

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/customers');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {isEditMode ? 'Edit Customer' : 'New Customer'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? 'Update customer information'
            : 'Add a new customer to your CRM'}
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
          {/* Name */}
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Name is required' })}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.name ? 'border-red-300' : ''
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.email ? 'border-red-300' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone *
            </label>
            <div className="mt-1">
              <input
                type="tel"
                id="phone"
                {...register('phone', { required: 'Phone number is required' })}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.phone ? 'border-red-300' : ''
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Company */}
          <div className="sm:col-span-3">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="company"
                {...register('company')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="sm:col-span-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Address</h3>
          </div>

          {/* Street */}
          <div className="sm:col-span-6">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Street
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="street"
                {...register('address.street')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* City */}
          <div className="sm:col-span-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="city"
                {...register('address.city')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* State */}
          <div className="sm:col-span-2">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="state"
                {...register('address.state')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Zip Code */}
          <div className="sm:col-span-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              Zip Code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="zipCode"
                {...register('address.zipCode')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Country */}
          <div className="sm:col-span-3">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="country"
                {...register('address.country')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
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
              <span>Saving...</span>
            ) : (
              <span>{isEditMode ? 'Update' : 'Create'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}