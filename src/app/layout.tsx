import type { Metadata } from 'next';
import './globals.css';

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
          <div className="main-content">
            <main className="page-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}