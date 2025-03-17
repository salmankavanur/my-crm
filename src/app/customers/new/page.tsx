import CustomerForm from '@/components/customers/CustomerForm';

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Add New Customer</h1>
      </div>
      <CustomerForm />
    </div>
  );
}