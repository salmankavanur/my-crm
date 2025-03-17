import InvoiceForm from '@/components/invoices/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Create New Invoice</h1>
      </div>
      <InvoiceForm />
    </div>
  );
}