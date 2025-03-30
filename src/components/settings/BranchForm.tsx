// src/components/settings/BranchForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { 
  FiSave, FiX, FiGlobe, FiMapPin, FiDollarSign, 
  FiMail, FiPhone, FiClock, FiPercent 
} from 'react-icons/fi';

// Define currencies
const currencies = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

// Define time zones
const timeZones = [
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Europe/London', label: 'London (GMT+0/+1)' },
  { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10/+11)' },
];

interface BranchFormData {
  name: string;
  code: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  phone?: string;
  email?: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  taxRate: number;
  timeZone: string;
  active: boolean;
}

interface BranchFormProps {
  branchId?: string;
  isEditMode?: boolean;
}

export default function BranchForm({ branchId, isEditMode = false }: BranchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BranchFormData>({
    defaultValues: {
      name: '',
      code: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      phone: '',
      email: '',
      currency: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
      },
      taxRate: 0,
      timeZone: 'America/New_York',
      active: true,
    },
  });

  const currencyCode = watch('currency.code');

  // Set currency symbol and name when code changes
  useEffect(() => {
    const selectedCurrency = currencies.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setValue('currency.symbol', selectedCurrency.symbol);
      setValue('currency.name', selectedCurrency.name);
    }
  }, [currencyCode, setValue]);

  // Fetch branch data if in edit mode
  useEffect(() => {
    if (isEditMode && branchId) {
      const fetchBranch = async () => {
        try {
          const response = await fetch(`/api/branches/${branchId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch branch data');
          }
          
          const data = await response.json();
          
          // Reset form with fetched data
          reset({
            name: data.name,
            code: data.code,
            address: {
              street: data.address?.street || '',
              city: data.address?.city || '',
              state: data.address?.state || '',
              zipCode: data.address?.zipCode || '',
              country: data.address?.country || '',
            },
            phone: data.phone || '',
            email: data.email || '',
            currency: {
              code: data.currency.code,
              symbol: data.currency.symbol,
              name: data.currency.name,
            },
            taxRate: data.taxRate || 0,
            timeZone: data.timeZone,
            active: data.active,
          });
        } catch (err) {
          setError('Failed to load branch data');
          console.error(err);
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchBranch();
    }
  }, [isEditMode, branchId, reset]);

  const onSubmit = async (data: BranchFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const url = isEditMode
        ? `/api/branches/${branchId}`
        : '/api/branches';
      
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
        throw new Error(errorData.message || 'Failed to save branch');
      }
      
      setSuccess(isEditMode ? 'Branch updated successfully!' : 'Branch created successfully!');
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard/settings/branches');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {isEditMode ? 'Edit Branch' : 'Create New Branch'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? 'Update branch information and settings'
            : 'Set up a new branch for your business'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiSave className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <FiGlobe className="mr-2 text-indigo-500" />
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Branch name is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="Dubai Office, India HQ, etc."
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Branch Code <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="code"
                    {...register('code', { 
                      required: 'Branch code is required',
                      maxLength: { value: 5, message: 'Code cannot exceed 5 characters' },
                      pattern: { value: /^[A-Z0-9]+$/, message: 'Only uppercase letters and numbers' }
                    })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md uppercase ${
                      errors.code ? 'border-red-300' : ''
                    }`}
                    placeholder="DXB, IND, US"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <FiMapPin className="mr-2 text-indigo-500" />
              Address
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="street"
                    {...register('address.street')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="123 Business Ave, Suite 100"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="city"
                    {...register('address.city', { required: 'City is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.address?.city ? 'border-red-300' : ''
                    }`}
                    placeholder="Dubai, Mumbai, New York"
                  />
                  {errors.address?.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                  )}
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
                    {...register('address.state')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Dubai, Maharashtra, NY"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  Zip/Postal Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="zipCode"
                    {...register('address.zipCode')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="country"
                    {...register('address.country', { required: 'Country is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.address?.country ? 'border-red-300' : ''
                    }`}
                    placeholder="United Arab Emirates, India, USA"
                  />
                  {errors.address?.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <FiPhone className="mr-2 text-indigo-500" />
              Contact Information
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="phone"
                    {...register('phone')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="+971 4 123 4567"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`pl-10 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                    placeholder="dubai@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-indigo-500" />
              Business Settings
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700">
                  Currency <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="currencyCode"
                    {...register('currency.code', { required: 'Currency is required' })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                  Default Tax Rate (%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="taxRate"
                    {...register('taxRate', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Tax rate cannot be negative' },
                      max: { value: 100, message: 'Tax rate cannot exceed 100%' },
                    })}
                    step="0.01"
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md pr-12 ${
                      errors.taxRate ? 'border-red-300' : ''
                    }`}
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiPercent className="h-5 w-5 text-gray-400" />
                  </div>
                  {errors.taxRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.taxRate.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
                  Time Zone <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="timeZone"
                    {...register('timeZone', { required: 'Time zone is required' })}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {timeZones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center h-5 mt-6">
                  <input
                    id="active"
                    type="checkbox"
                    {...register('active')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-3 block text-sm font-medium text-gray-700">
                    Branch is active
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-7">
                  Inactive branches won't appear in dropdowns and reports
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Link
            href="/dashboard/settings/branches"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
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
                {isEditMode ? 'Update Branch' : 'Create Branch'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}