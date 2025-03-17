import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'My CRM - Customer Relationship Management',
  description: 'Manage your customers, invoices, and business relationships efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Starting in light mode by default (no dark-mode class) */}
        <div className="layout-container">
          <Sidebar />
          
          <div className="main-content">
            <Header />
            <main className="page-content">
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}