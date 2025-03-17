'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUserPlus, FiFileText, FiDollarSign, FiUsers,
  FiTrendingUp, FiActivity, FiPieChart, FiClock,
  FiPlus, FiArrowUp, FiArrowDown, FiAlertCircle
} from 'react-icons/fi';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import RecentCustomers from '@/components/dashboard/RecentCustomers';

// Define types for the stats object
interface DashboardStats {
  totalCustomers: number;
  totalInvoices: number;
  revenue: number;
  outstanding: number;
  customerGrowth: number;
  invoiceGrowth: number;
  revenueGrowth: number;
  outstandingChange: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalInvoices: 0,
    revenue: 0,
    outstanding: 0,
    customerGrowth: 5.2,
    invoiceGrowth: 3.8,
    revenueGrowth: 7.6,
    outstandingChange: 2.1
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`/api/dashboard?timeframe=${timeframe}`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data: DashboardStats = await response.json();
        setStats(prevStats => ({
          ...prevStats,
          ...data,
        }));
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
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <FiAlertCircle className="text-red-500 text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Error Loading Dashboard</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number): string => {
    return `₹${(value || 0).toLocaleString()}`;
  };

  return (
    // ... rest of the JSX remains unchanged until StatCard component
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Business Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your business.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="bg-white rounded-md shadow-sm border border-gray-200 flex w-full sm:w-auto">
                <button 
                  onClick={() => setTimeframe('week')} 
                  className={`px-4 py-2 text-sm font-medium ${timeframe === 'week' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setTimeframe('month')} 
                  className={`px-4 py-2 text-sm font-medium ${timeframe === 'month' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setTimeframe('year')} 
                  className={`px-4 py-2 text-sm font-medium ${timeframe === 'year' 
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Year
                </button>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link 
                  href="/dashboard/customers/new" 
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  <FiUserPlus className="mr-2 text-white" /> <span className="text-white"> New Customer </span>
                </Link>
                <Link 
                  href="/dashboard/invoices/create" 
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <FiUserPlus className="mr-2 text-white" /> <span className="text-white"> New Invoice </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard 
            label="Total Customers" 
            value={stats.totalCustomers || 0} 
            icon={FiUsers} 
            change={stats.customerGrowth || 0} 
            color="blue" 
            linkUrl="/dashboard/customers"
          />
          <StatCard 
            label="Total Invoices" 
            value={stats.totalInvoices || 0} 
            icon={FiFileText} 
            change={stats.invoiceGrowth || 0} 
            color="indigo" 
            linkUrl="/dashboard/invoices"
          />
          <StatCard 
            label="Revenue" 
            value={formatCurrency(stats.revenue)} 
            icon={FiDollarSign} 
            change={stats.revenueGrowth || 0} 
            color="green" 
            linkUrl="/dashboard/revenue"
          />
          <StatCard 
            label="Outstanding" 
            value={formatCurrency(stats.outstanding)} 
            icon={FiDollarSign} 
            change={stats.outstandingChange || 0} 
            color="amber"
            isNegative={true}
            linkUrl="/dashboard/outstanding"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueOverview timeframe={timeframe} />
          <SalesDistribution />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentCustomers />
          <RecentInvoices />
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change: number;
  color: 'blue' | 'indigo' | 'green' | 'amber';
  isNegative?: boolean;
  linkUrl: string;
}

const StatCard = ({ label, value, icon: Icon, change, color, isNegative = false, linkUrl }: StatCardProps) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      light: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      light: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      light: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      light: 'text-amber-600',
      iconBg: 'bg-amber-100'
    }
  };

  const theme = colorMap[color];
  
  return (
    // ... StatCard JSX remains unchanged
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            
            <div className={`flex items-center mt-2 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
              {isNegative ? (
                <FiArrowDown className="mr-1" />
              ) : (
                <FiArrowUp className="mr-1" />
              )}
              <span className="text-sm font-medium">{change}% from last period</span>
            </div>
          </div>
          
          <div className={`${theme.iconBg} p-4 rounded-full`}>
            <Icon className={`${theme.light} text-2xl`} />
          </div>
        </div>
      </div>
      <div className={`${theme.bg} px-6 py-3 border-t border-gray-100`}>
        <Link href={linkUrl || "#"} className={`text-sm font-medium ${theme.text} flex items-center`}>
          View all <FiArrowUp className="ml-2 rotate-45" size={14} />
        </Link>
      </div>
    </div>
  );
};

interface RevenueOverviewProps {
  timeframe: 'week' | 'month' | 'year';
}

const RevenueOverview = ({ timeframe }: RevenueOverviewProps) => {
  return (
    // ... RevenueOverview JSX remains unchanged
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Revenue trends for the current {timeframe}</p>
        </div>
        <select className="bg-gray-100 border border-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>All Channels</option>
          <option>Online</option>
          <option>In-store</option>
        </select>
      </div>
      <div className="h-80 p-6 bg-white flex flex-col items-center justify-center">
        <FiActivity className="text-5xl text-gray-300 mb-4" />
        <p className="text-gray-500 mb-2">Revenue trend chart would appear here</p>
        <p className="text-sm text-gray-400">Showing data for the selected {timeframe}</p>
      </div>
    </div>
  );
};

const SalesDistribution = () => {
  return (
    // ... SalesDistribution JSX remains unchanged
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Distribution</h3>
          <p className="text-sm text-gray-500 mt-1">Breakdown of sales by category</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full font-medium">Products</button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium">Services</button>
        </div>
      </div>
      <div className="h-80 p-6 bg-white flex flex-col items-center justify-center">
        <FiPieChart className="text-5xl text-gray-300 mb-4" />
        <p className="text-gray-500 mb-2">Sales distribution chart would appear here</p>
        <p className="text-sm text-gray-400">Showing breakdown by product category</p>
      </div>
    </div>
  );
};