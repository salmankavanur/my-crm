// src/app/customer-portal/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiFileText, FiClock, FiBarChart2, FiDollarSign,
  FiChevronRight, FiClipboard, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';

// Define interface for customer data
interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

// Define interfaces for dashboard summary data
interface DashboardSummary {
  activeProjects: number;
  pendingQuotations: number;
  unpaidInvoices: number;
  totalOutstanding: number;
}

// Define interface for project data
interface Project {
  _id: string;
  title: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  progress: number;
}

// Define interface for invoice data
interface Invoice {
  _id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: {
    code: string;
    symbol: string;
  };
}

// Define interface for quotation data
interface Quotation {
  _id: string;
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  currency: {
    code: string;
    symbol: string;
  };
}

export default function CustomerPortalDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>({
    activeProjects: 0,
    pendingQuotations: 0,
    unpaidInvoices: 0,
    totalOutstanding: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/customer-portal/check-auth');
        
        if (!response.ok) {
          router.push('/customer-portal/login');
          return;
        }
        
        const data = await response.json();
        setCustomer(data.user);
        
        // Now fetch dashboard data
        fetchDashboardData();
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/customer-portal/login');
      }
    };
    
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/customer-portal/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setSummary(data.summary);
        setRecentProjects(data.recentProjects);
        setRecentInvoices(data.recentInvoices);
        setRecentQuotations(data.recentQuotations);
      } catch (err) {
        setError('Error loading dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg max-w-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string, type: 'project' | 'invoice' | 'quotation') => {
    if (type === 'project') {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'on-hold': return 'bg-yellow-100 text-yellow-800';
        case 'planning': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-gray-100 text-gray-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else if (type === 'invoice') {
      switch (status) {
        case 'paid': return 'bg-green-100 text-green-800';
        case 'sent': return 'bg-blue-100 text-blue-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        case 'draft': return 'bg-gray-100 text-gray-800';
        case 'cancelled': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'sent': return 'bg-blue-100 text-blue-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'expired': return 'bg-gray-100 text-gray-800';
        case 'converted': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {customer?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/customer-portal/quotations/request"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiClipboard className="mr-2 -ml-1 h-5 w-5" />
            Request Quotation
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <FiBarChart2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{summary.activeProjects}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/customer-portal/projects" className="font-medium text-indigo-600 hover:text-indigo-900 flex items-center">
                View all projects <FiChevronRight className="ml-1" size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FiClipboard className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Quotations</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{summary.pendingQuotations}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/customer-portal/quotations" className="font-medium text-indigo-600 hover:text-indigo-900 flex items-center">
                View all quotations <FiChevronRight className="ml-1" size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FiFileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unpaid Invoices</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{summary.unpaidInvoices}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/customer-portal/invoices" className="font-medium text-indigo-600 hover:text-indigo-900 flex items-center">
                View all invoices <FiChevronRight className="ml-1" size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <FiDollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Outstanding</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {summary.totalOutstanding.toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'USD',
                        minimumFractionDigits: 2
                      })}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/customer-portal/payments" className="font-medium text-indigo-600 hover:text-indigo-900 flex items-center">
                View payment history <FiChevronRight className="ml-1" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Projects Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Active Projects</h3>
            <p className="mt-1 text-sm text-gray-500">Your current active projects and their status</p>
          </div>
          
          {recentProjects.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentProjects.map((project) => (
                <li key={project._id}>
                  <Link 
                    href={`/customer-portal/projects/${project._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <p className="text-sm font-medium text-indigo-600 truncate">{project.title}</p>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status, 'project')}`}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </span>
                            </div>
                            <div className="ml-2 flex items-center text-sm text-gray-500">
                              <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span>{new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{project.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center">
              <p className="text-sm text-gray-500">No active projects at the moment.</p>
            </div>
          )}
          
          {recentProjects.length > 0 && (
            <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
              <div className="text-sm">
                <Link href="/customer-portal/projects" className="font-medium text-indigo-600 hover:text-indigo-900">
                  View all projects <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Invoices Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Invoices</h3>
            <p className="mt-1 text-sm text-gray-500">Your latest invoices and payment status</p>
          </div>
          
          {recentInvoices.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentInvoices.map((invoice) => (
                <li key={invoice._id}>
                  <Link 
                    href={`/customer-portal/invoices/${invoice._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">{invoice.invoiceNumber}</p>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-sm font-medium text-gray-900">
                            {invoice.currency.symbol}{invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <div className="mt-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status, 'invoice')}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center">
              <p className="text-sm text-gray-500">No invoices found.</p>
            </div>
          )}
          
          {recentInvoices.length > 0 && (
            <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
              <div className="text-sm">
                <Link href="/customer-portal/invoices" className="font-medium text-indigo-600 hover:text-indigo-900">
                  View all invoices <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Quotations */}
      {recentQuotations.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Quotations</h3>
            <p className="mt-1 text-sm text-gray-500">Your latest quotation requests</p>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {recentQuotations.map((quotation) => (
              <li key={quotation._id}>
                <Link 
                  href={`/customer-portal/quotations/${quotation._id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">{quotation.quotationNumber}</p>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>Valid until: {new Date(quotation.validUntil).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium text-gray-900">
                          {quotation.currency.symbol}{quotation.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="mt-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quotation.status, 'quotation')}`}>
                            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
            <div className="text-sm">
              <Link href="/customer-portal/quotations" className="font-medium text-indigo-600 hover:text-indigo-900">
                View all quotations <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}