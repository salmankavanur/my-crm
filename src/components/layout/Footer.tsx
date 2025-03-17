'use client';

import { FiHeart, FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="flex flex-col md:flex-row items-center md:justify-between w-full">
        <div className="flex flex-col md:flex-row items-center md:space-x-4">
          <div className="text-sm">
            &copy; {currentYear} My CRM. All rights reserved.
          </div>
          <div className="hidden md:block h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
          <div className="hidden md:flex space-x-4 mt-2 md:mt-0">
            <a href="/privacy" className="text-xs hover:text-gray-900 dark:hover:text-gray-100">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs hover:text-gray-900 dark:hover:text-gray-100">
              Terms of Service
            </a>
            <a href="/contact" className="text-xs hover:text-gray-900 dark:hover:text-gray-100">
              Contact Us
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <span className="text-xs flex items-center">
            Made with <FiHeart className="text-red-500 mx-1" size={12} /> using Next.js
          </span>
          <span className="text-xs">Version 1.0.0</span>
          <div className="flex items-center space-x-2">
            <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FiTwitter size={16} />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FiGithub size={16} />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FiLinkedin size={16} />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Mobile links */}
      <div className="flex justify-center space-x-4 mt-4 md:hidden">
        <a href="/privacy" className="text-xs hover:text-gray-900 dark:hover:text-gray-100">
          Privacy
        </a>
        <a href="/terms" className="text-xs hover:text-gray-900 dark:hover:text-gray-100">
          Terms
        </a>
        <a href="/contact" className="text-xs hover:text-gray-900 dark:hover:text-gray-100">
          Contact
        </a>
      </div>
    </footer>
  );
};

export default Footer;