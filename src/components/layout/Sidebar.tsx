'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiCheckSquare, 
  FiClock, 
  FiMessageSquare,
  FiLifeBuoy,
  FiSettings
} from 'react-icons/fi';

const Sidebar = () => {
  const pathname = usePathname();

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Customers', href: '/customers', icon: FiUsers },
    { name: 'Invoices', href: '/invoices', icon: FiFileText },
    { name: 'Reports', href: '/reports', icon: FiBarChart2 },
  ];
  
  const secondaryNavItems = [
    { name: 'Tasks', href: '/tasks', icon: FiCheckSquare },
    { name: 'Analytics', href: '/analytics', icon: FiClock },
    { name: 'Messages', href: '/messages', icon: FiMessageSquare },
    { name: 'Support', href: '/support', icon: FiLifeBuoy },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">C</div>
          <span>My CRM</span>
        </div>
      </div>
      
      <div className="sidebar-section">
        <div className="flex items-center space-x-3 mx-3 mb-6 p-3 rounded-lg bg-[var(--card-bg)] dark:bg-[var(--muted)] border border-[var(--border)]">
          <div className="avatar bg-[var(--primary-light)] dark:bg-[var(--secondary)] text-white">N</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[var(--foreground)] dark:text-[var(--muted-foreground)]">Admin User</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">admin@example.com</p>
          </div>
        </div>
        
        <div className="sidebar-section-title">MAIN</div>
        <nav>
          {mainNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <item.icon className="sidebar-nav-item-icon" size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="sidebar-section">
        <div className="sidebar-section-title">SECONDARY</div>
        <nav>
          {secondaryNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <item.icon className="sidebar-nav-item-icon" size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="sidebar-upgrade">
  <div className="upgrade-card">
    <h3 className="upgrade-title">Create New Invoice</h3>
    <p className="upgrade-desc">Bill your clients quickly and efficiently</p>
    <Link href="/invoices/create">
      <button className="upgrade-button">Create Now</button>
    </Link>
  </div>
</div>
    </aside>
  );
};

export default Sidebar;