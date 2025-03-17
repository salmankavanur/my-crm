import Link from 'next/link';
import { FiEdit2, FiFileText, FiArrowLeft } from 'react-icons/fi';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Invoice from '@/models/Invoice';

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

// Define interface for Customer
interface CustomerData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
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

// Define interface for Invoice
interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  customer: string | CustomerData;
  issueDate: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt?: string;
}

async function getCustomer(id: string): Promise<CustomerData | null> {
  await dbConnect();
  const customer = await Customer.findById(id);
  return customer ? JSON.parse(JSON.stringify(customer)) : null;
}

async function getCustomerInvoices(customerId: string): Promise<InvoiceData[]> {
  await dbConnect();
  const invoices = await Invoice.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .limit(5);
  return JSON.parse(JSON.stringify(invoices));
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const customerId = params.id;
  
  try {
    const customer = await getCustomer(customerId);
    const invoices = await getCustomerInvoices(customerId);

    if (!customer) throw new Error('Customer not found');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/customers"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiArrowLeft className="mr-2 -ml-0.5 h-4 w-4" />
              Back to Customers
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/invoices/create?customerId=${customerId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiFileText className="mr-2 -ml-1 h-5 w-5" />
              New Invoice
            </Link>
            <Link
              href={`/customers/${customerId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiEdit2 className="mr-2 -ml-1 h-5 w-5" />
              Edit Customer
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and contact information.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.name}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.email}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.phone || '-'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.company || '-'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {customer.address?.street ? (
                    <>
                      {customer.address.street}<br />
                      {customer.address.city && customer.address.city}
                      {customer.address.state && `, ${customer.address.state}`}
                      {customer.address.zipCode && ` ${customer.address.zipCode}`}<br />
                      {customer.address.country && customer.address.country}
                    </>
                  ) : '-'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {customer.notes || '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Invoices</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                List of recent invoices for this customer.
              </p>
            </div>
            <Link
              href={`/invoices?customerId=${customerId}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
            >
              View all invoices
            </Link>
          </div>
          <div className="border-t border-gray-200">
            {invoices.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice: InvoiceData) => (
                    <tr key={invoice._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        <Link href={`/invoices/${invoice._id}`} className="hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/invoices/${invoice._id}`} className="text-indigo-600 hover:text-indigo-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-500">No invoices found for this customer.</p>
                <div className="mt-4">
                  <Link
                    href={`/invoices/create?customerId=${customerId}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiFileText className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create an invoice
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
        <h1 className="text-lg font-medium text-red-600">Customer not found</h1>
        <p className="mt-2 text-gray-500">The customer you are looking for does not exist or has been deleted.</p>
        <div className="mt-6">
          <Link
            href="/customers"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }
}