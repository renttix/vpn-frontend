import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-vpn-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold">
                VPN News
              </Link>
              <span className="text-sm bg-white text-vpn-blue px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/admin/comments" className="hover:underline">
                Comments
              </Link>
              <Link href="/" className="hover:underline">
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} VPN News Admin Panel
        </div>
      </footer>
    </div>
  );
}
