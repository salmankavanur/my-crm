// src/app/customer-portal/quotations/request/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiArrowLeft, FiFileText, FiPlusCircle, 
  FiMinusCircle, FiSave, FiInfo, FiAlertCircle, FiCheckCircle 
} from 'react-icons/fi';

interface QuotationItem {
  description: string;
  quantity: number;
  details?: string;
}

interface QuotationRequestForm {
  title: string;
  description: string;
  items: QuotationItem[];
  preferredDueDate?: string;
  additionalNotes?: string;
  attachments?: File[];
}

export default function RequestQuotationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuotationRequestForm>({
    title: '',
    description: '',
    items: [{ description: '', quantity: 1, details: '' }],
    preferredDueDate: '',
    additionalNotes: '',
    attachments: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, details: '' }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create form data for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify({
        title: formData.title,
        description: formData.description,
        items: formData.items,
        preferredDueDate: formData.preferredDueDate,
        additionalNotes: formData.additionalNotes
      }));

      // Append files if any
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/customer-portal/quotations/request', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit quotation request');
      }

      setSuccess('Your quotation request has been submitted successfully. We will get back to you soon.');
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        items: [{ description: '', quantity: 1, details: '' }],
        preferredDueDate: '',
        additionalNotes: '',
        attachments: [],
      });
      setFiles([]);

      // Redirect after a delay
      setTimeout(() => {
        router.push('/customer-portal/quotations');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center">
          <Link
            href="/customer-portal/quotations"
            className="mr-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <FiArrowLeft className="mr-1" /> Back to Quotations
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Request a Quotation</h1>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Fill out the form below to request a quotation for your project or service needs.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Quotation Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please provide as much detail as possible to help us prepare an accurate quote.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title/Subject <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g., Website Development Quote, Consulting Services"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Describe your project or service requirements in detail"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="preferredDueDate" className="block text-sm font-medium text-gray-700">
                  Preferred Completion Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="preferredDueDate"
                    id="preferredDueDate"
                    value={formData.preferredDueDate}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Items/Services Needed</h3>
              <p className="mt-1 text-sm text-gray-500">
                List the items or services you need a quote for.
              </p>
            </div>

            <div className="mt-6">
              {formData.items.map((item, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length <= 1}
                      className="inline-flex items-center text-sm text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiMinusCircle className="mr-1" /> Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor={`item-${index}-description`} className="block text-sm font-medium text-gray-700">
                        Item/Service Description <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`item-${index}-description`}
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="E.g., Website Design, SEO Services"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor={`item-${index}-quantity`} className="block text-sm font-medium text-gray-700">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id={`item-${index}-quantity`}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          min="1"
                          required
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor={`item-${index}-details`} className="block text-sm font-medium text-gray-700">
                        Additional Details
                      </label>
                      <div className="mt-1">
                        <textarea
                          id={`item-${index}-details`}
                          value={item.details || ''}
                          onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                          rows={2}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="Any specific requirements or specifications"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlusCircle className="mr-2" /> Add Another Item
              </button>
            </div>
          </div>

          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Any other details that might help us prepare your quote.
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Any other information that might be relevant"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF, DOCX up to 10MB each
                  </p>
                </div>
              </div>
              
              {files.length > 0 && (
                <ul className="mt-4 border rounded-md divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <FiFileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <Link
              href="/customer-portal/quotations"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 -ml-1" /> Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}