import CustomerForm from '@/components/customers/CustomerForm';

interface EditCustomerPageProps {
  params: {
    id: string;
  };
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Edit Customer</h1>
      </div>
      <CustomerForm customerId={params.id} isEditMode={true} />
    </div>
  );
}