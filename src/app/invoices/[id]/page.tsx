import Link from 'next/link';
import { FiEdit2, FiPrinter, FiArrowLeft, FiMail, FiDownload } from 'react-icons/fi';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

async function getInvoice(id: string) {
  await dbConnect();
  const invoice = await Invoice.findById(id).populate('customer', 'name email phone company address');
  return JSON.parse(JSON.stringify(invoice));
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const invoiceId = params.id;
  
  try {
    const invoice = await getInvoice(invoiceId);

    // Format dates
    const issueDate = new Date(invoice.issueDate).toLocaleDateString();
    const dueDate = new Date(invoice.dueDate).toLocaleDateString();

    // Get status color
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'paid':
          return 'bg-green-100 text-green-800';
        case 'sent':
          return 'bg-blue-100 text-blue-800';
        case 'draft':
          return 'bg-gray-100 text-gray-800';
        case 'overdue':
          return 'bg-red-100 text-red-800';
        case 'cancelled':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const statusColor = getStatusColor(invoice.status);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/invoices"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiArrowLeft className="mr-2 -ml-0.5 h-4 w-4" />
              Back to Invoices
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Invoice {invoice.invoiceNumber}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPrinter className="mr-2 -ml-0.5 h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiDownload className="mr-2 -ml-0.5 h-4 w-4" />
              Download PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiMail className="mr-2 -ml-0.5 h-4 w-4" />
              Send Email
            </button>
            <Link
              href={`/invoices/${invoiceId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiEdit2 className="mr-2 -ml-1 h-5 w-5" />
              Edit
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Invoice Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                    <p className="mt-1 text-sm text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Issue Date</p>
                    <p className="mt-1 text-sm text-gray-900">{issueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="mt-1 text-sm text-gray-900">{dueDate}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Customer</h3>
                <p className="text-base font-semibold text-gray-900">{invoice.customer.name}</p>
                {invoice.customer.company && (
                  <p className="text-sm text-gray-800">{invoice.customer.company}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">{invoice.customer.email}</p>
                <p className="text-sm text-gray-500">{invoice.customer.phone}</p>
                {invoice.customer.address && (
                  <div className="mt-1 text-sm text-gray-500">
                    {invoice.customer.address.street && (
                      <>
                        {invoice.customer.address.street}<br />
                        {invoice.customer.address.city && invoice.customer.address.city}
                        {invoice.customer.address.state && `, ${invoice.customer.address.state}`}
                        {invoice.customer.address.zipCode && ` ${invoice.customer.address.zipCode}`}<br />
                        {invoice.customer.address.country && invoice.customer.address.country}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 sm:w-1/2 ml-auto">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-medium text-gray-700">Tax:</span>
                  <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-base font-medium text-gray-900">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                  {invoice.notes}
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
        <h1 className="text-lg font-medium text-red-600">Invoice not found</h1>
        <p className="mt-2 text-gray-500">The invoice you are looking for does not exist or has been deleted.</p>
        <div className="mt-6">
          <Link
            href="/invoices"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }
}