'use client';

import { useState } from 'react';
import { 
  FiMenu, FiBell, FiUser, FiSearch, FiChevronDown, 
  FiSettings, FiHelpCircle, FiLogOut, FiMoon, FiSun,
  FiFileText, FiUsers 
} from 'react-icons/fi';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set to true to match your screenshot

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual dark mode toggle logic
    document.body.classList.toggle('dark-mode');
  };

  const notifications = [
    {
      id: 1,
      title: 'New customer sign up',
      message: 'Acme Inc. has registered as a new customer',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Invoice paid',
      message: 'Invoice #INV-2023-001 has been paid',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'System update',
      message: 'CRM system will be updated tonight at 2AM',
      time: '1 day ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="flex md:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <FiMenu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="search-container">
        <FiSearch className="search-icon" size={18} />
        <input
          type="search"
          placeholder="Search customers, invoices..."
          className="search-input"
        />
      </div>
      
      <div className="header-actions">
        {/* Notifications */}
        <div className="relative">
          <button
            className="notification-button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{notification.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                  <a href="#" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    View all notifications
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Theme Toggle */}
        <button 
          className="notification-button"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
        
        {/* Profile dropdown */}
        <div className="relative">
          <div 
            className="user-menu"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <div className="avatar">N</div>
            <span className="hidden sm:block font-medium">Admin User</span>
            <FiChevronDown size={16} className="hidden sm:block ml-1" />
          </div>
          
          {/* Profile dropdown panel */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiUser className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Your Profile
                </a>
                <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiSettings className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Settings
                </a>
                <a href="/help" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiHelpCircle className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Help Center
                </a>
                <div className="border-t border-gray-100 dark:border-gray-700"></div>
                <a href="/logout" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiLogOut className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Sign out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white dark:bg-gray-800 shadow-lg">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-xl font-bold">My CRM</div>
                </div>
                <div>
                  <button
                    type="button"
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  <a
                    href="/dashboard"
                    className="flex items-center p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  >
                    <FiMenu className="mr-3 h-6 w-6" />
                    <span className="text-base font-medium">Dashboard</span>
                  </a>
                  <a
                    href="/customers"
                    className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <FiUsers className="mr-3 h-6 w-6" />
                    <span className="text-base font-medium">Customers</span>
                  </a>
                  <a
                    href="/invoices"
                    className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <FiFileText className="mr-3 h-6 w-6" />
                    <span className="text-base font-medium">Invoices</span>
                  </a>
                  <a
                    href="/reports"
                    className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <FiUser className="mr-3 h-6 w-6" />
                    <span className="text-base font-medium">Reports</span>
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <FiSettings className="mr-3 h-6 w-6" />
                    <span className="text-base font-medium">Settings</span>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;