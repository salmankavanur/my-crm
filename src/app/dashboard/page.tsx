'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUserPlus, FiFileText, FiDollarSign, FiUsers,
  FiTrendingUp, FiCalendar, FiActivity, FiPieChart, FiClock
} from 'react-icons/fi';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import RecentCustomers from '@/components/dashboard/RecentCustomers';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalInvoices: 0,
    revenue: 0,
    outstanding: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here’s an overview of your business.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/customers/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">
            <FiUserPlus className="mr-2" /> New Customer
          </Link>
          <Link href="/dashboard/invoices/create" className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700">
            <FiFileText className="mr-2" /> New Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total Customers', value: stats.totalCustomers, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Total Invoices', value: stats.totalInvoices, icon: FiFileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Revenue', value: `₹${stats.revenue}`, icon: FiDollarSign, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Outstanding', value: `₹${stats.outstanding}`, icon: FiDollarSign, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        ].map(({ label, value, icon: Icon, color, bg }, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center border border-gray-200">
            <div>
              <h3 className="text-sm text-gray-500 font-medium">{label}</h3>
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
            </div>
            <div className={`${bg} p-3 rounded-full`}> 
              <Icon className={`${color} text-3xl`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RevenueOverview />
        <SalesDistribution />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentCustomers />
        <RecentInvoices />
      </div>
    </div>
  );
}

const RevenueOverview = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-80">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
      </div>
      <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-gray-600">
        <FiActivity className="text-5xl opacity-50 mb-2" />
        <p>Revenue trend chart would appear here</p>
      </div>
    </div>
  );
};

const SalesDistribution = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-80">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Sales Distribution</h3>
      </div>
      <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-gray-600">
        <FiPieChart className="text-5xl opacity-50 mb-2" />
        <p>Sales distribution chart would appear here</p>
      </div>
    </div>
  );
};
