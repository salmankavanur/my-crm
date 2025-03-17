import InvoiceForm from '@/components/invoices/InvoiceForm';

interface EditInvoicePageProps {
  params: {
    id: string;
  };
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Edit Invoice</h1>
      </div>
      <InvoiceForm invoiceId={params.id} isEditMode={true} />
    </div>
  );
}