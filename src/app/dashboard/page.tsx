'use client';

import Link from 'next/link';
import { 
  FiUserPlus, 
  FiFileText, 
  FiDollarSign, 
  FiUsers, 
  FiTrendingUp, 
  FiCalendar, 
  FiActivity,
  FiPieChart,
  FiClock
} from 'react-icons/fi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We'll use a simple fetch to check auth status
        // This is optional since we already have middleware protection
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Redirect to login if not authenticated
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, redirect to login as a fallback
        router.push('/login');
      }
    };

    // Uncomment this if you want an additional auth check beyond middleware
    // checkAuth();
  }, [router]);

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard</h1>
          <p style={{ color: 'var(--gray-500)' }}>Welcome back! Here's what's happening with your business today.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/dashboard/customers/new" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              padding: '0.5rem 1rem', 
              backgroundColor: 'var(--primary, #3b82f6)', 
              color: 'white', 
              borderRadius: '0.375rem',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            <FiUserPlus style={{ marginRight: '0.5rem' }} size={18} />
            New Customer
          </Link>
          <Link 
            href="/dashboard/invoices/create" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              padding: '0.5rem 1rem', 
              backgroundColor: 'var(--primary, #3b82f6)', 
              color: 'white', 
              borderRadius: '0.375rem',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            <FiFileText style={{ marginRight: '0.5rem' }} size={18} />
            New Invoice
          </Link>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem', 
        marginBottom: '1.5rem', 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        border: '1px solid var(--gray-200, #e5e7eb)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FiCalendar style={{ marginRight: '0.5rem', color: 'var(--gray-400, #9ca3af)' }} size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Period:</span>
          <select style={{ 
            marginLeft: '0.5rem', 
            backgroundColor: 'transparent', 
            border: 'none', 
            fontSize: '0.875rem',
            outline: 'none'
          }}>
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--gray-500, #6b7280)' }}>
          <span>Last updated: Today, 9:41 AM</span>
          <FiClock style={{ marginLeft: '0.5rem' }} size={14} />
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        {/* Total Customers */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '1.25rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--gray-500, #6b7280)' }}>Total Customers</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>152</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success, #22c55e)', display: 'flex', alignItems: 'center' }}>
                <FiTrendingUp style={{ marginRight: '0.25rem' }} size={14} />
                15% from last month
              </div>
            </div>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FiUsers size={24} style={{ color: 'var(--primary, #3b82f6)' }} />
            </div>
          </div>
        </div>
        
        {/* Total Invoices */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '1.25rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--gray-500, #6b7280)' }}>Total Invoices</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>289</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success, #22c55e)', display: 'flex', alignItems: 'center' }}>
                <FiTrendingUp style={{ marginRight: '0.25rem' }} size={14} />
                8% from last month
              </div>
            </div>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FiFileText size={24} style={{ color: 'var(--secondary, #6366f1)' }} />
            </div>
          </div>
        </div>
        
        {/* Revenue */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '1.25rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--gray-500, #6b7280)' }}>Revenue</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>₹54,250</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success, #22c55e)', display: 'flex', alignItems: 'center' }}>
                <FiTrendingUp style={{ marginRight: '0.25rem' }} size={14} />
                12% from last month
              </div>
            </div>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FiDollarSign size={24} style={{ color: 'var(--success, #22c55e)' }} />
            </div>
          </div>
        </div>
        
        {/* Outstanding */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          padding: '1.25rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--gray-500, #6b7280)' }}>Outstanding</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>₹12,580</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--error, #ef4444)', display: 'flex', alignItems: 'center' }}>
                <FiTrendingUp style={{ marginRight: '0.25rem' }} size={14} />
                3% from last month
              </div>
            </div>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FiDollarSign size={24} style={{ color: 'var(--warning, #f59e0b)' }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)',
          overflow: 'hidden',
          height: '300px'
        }}>
          <div style={{ 
            padding: '1rem 1.5rem', 
            borderBottom: '1px solid var(--gray-200, #e5e7eb)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '500' }}>Revenue Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <select style={{ 
                fontSize: '0.875rem', 
                backgroundColor: 'transparent', 
                border: 'none', 
                paddingRight: '2rem',
                outline: 'none'
              }}>
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>
          </div>
          <div style={{ 
            height: '240px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: 'var(--gray-50, #f9fafb)',
            color: 'var(--gray-500, #6b7280)'
          }}>
            <FiActivity style={{ marginBottom: '1rem', opacity: 0.5 }} size={48} />
            <p>Revenue trend chart would appear here</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Using your preferred charting library</p>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)',
          overflow: 'hidden',
          height: '300px'
        }}>
          <div style={{ 
            padding: '1rem 1.5rem', 
            borderBottom: '1px solid var(--gray-200, #e5e7eb)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '500' }}>Sales Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <select style={{ 
                fontSize: '0.875rem', 
                backgroundColor: 'transparent', 
                border: 'none', 
                paddingRight: '2rem',
                outline: 'none'
              }}>
                <option>By Category</option>
                <option>By Customer</option>
              </select>
            </div>
          </div>
          <div style={{ 
            height: '240px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: 'var(--gray-50, #f9fafb)',
            color: 'var(--gray-500, #6b7280)'
          }}>
            <FiPieChart style={{ marginBottom: '1rem', opacity: 0.5 }} size={48} />
            <p>Distribution chart would appear here</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Using your preferred charting library</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '1.5rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '1rem 1.5rem', 
            borderBottom: '1px solid var(--gray-200, #e5e7eb)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '500' }}>Recent Customers</h3>
            <Link 
              href="/customers" 
              style={{ 
                fontSize: '0.875rem', 
                color: 'var(--primary, #3b82f6)', 
                textDecoration: 'none' 
              }}
            >
              View All
            </Link>
          </div>
          <div style={{ padding: '1px' }}>
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--gray-500, #6b7280)' }}>
              Recent customers will appear here
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))', 
          border: '1px solid var(--gray-200, #e5e7eb)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '1rem 1.5rem', 
            borderBottom: '1px solid var(--gray-200, #e5e7eb)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '500' }}>Recent Invoices</h3>
            <Link 
              href="/invoices" 
              style={{ 
                fontSize: '0.875rem', 
                color: 'var(--primary, #3b82f6)', 
                textDecoration: 'none' 
              }}
            >
              View All
            </Link>
          </div>
          <div style={{ padding: '1px' }}>
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--gray-500, #6b7280)' }}>
              Recent invoices will appear here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
