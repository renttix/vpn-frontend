"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Redirect to login page after successful logout
        router.push('/admin-login.html');
      } else {
        console.error('Logout failed');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Notification Management Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-3">Notification Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage push notification subscriptions and view subscriber statistics.
            </p>
            <Link 
              href="/admin/notifications" 
              className="inline-block px-4 py-2 bg-vpn-blue text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Manage Notifications
            </Link>
          </div>
        </div>
        
        {/* Recommendation Engine Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-3">Recommendation Engine</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Monitor user activity and manage personalized content recommendations.
            </p>
            <Link 
              href="/admin/recommendations" 
              className="inline-block px-4 py-2 bg-vpn-blue text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Manage Recommendations
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/" 
          className="text-vpn-blue dark:text-blue-400 hover:underline"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
