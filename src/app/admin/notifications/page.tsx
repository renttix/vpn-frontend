"use client";

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

interface SubscriptionMetadata {
  ip?: string;
  browser?: string;
  platform?: string;
  referrer?: string;
}

interface Subscription {
  _id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
  lastNotified: string | null;
  lastSeen: string | null;
  userAgent?: string;
  active: boolean;
  metadata?: SubscriptionMetadata;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  byBrowser: Record<string, number>;
  byPlatform: Record<string, number>;
  recentlyNotified: number;
}

export default function NotificationsAdmin() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testBody, setTestBody] = useState('This is a test notification from the admin panel');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isMockData, setIsMockData] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/subscriptions');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions: ${response.status}`);
      }
      
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      setIsMockData(data.isMockData || false);
      
      // Calculate stats
      const allSubs = data.subscriptions || [];
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const stats: Stats = {
        total: allSubs.length,
        active: allSubs.filter((sub: Subscription) => sub.active !== false).length,
        inactive: allSubs.filter((sub: Subscription) => sub.active === false).length,
        byBrowser: {},
        byPlatform: {},
        recentlyNotified: allSubs.filter((sub: Subscription) => 
          sub.lastNotified && new Date(sub.lastNotified) > oneDayAgo
        ).length
      };
      
      // Count by browser and platform
      allSubs.forEach((sub: Subscription) => {
        if (sub.metadata?.browser) {
          stats.byBrowser[sub.metadata.browser] = (stats.byBrowser[sub.metadata.browser] || 0) + 1;
        }
        
        if (sub.metadata?.platform) {
          stats.byPlatform[sub.metadata.platform] = (stats.byPlatform[sub.metadata.platform] || 0) + 1;
        }
      });
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to load subscriptions. MongoDB connection may not be properly configured.');
      
      // For demonstration purposes, add some mock data
      const mockData = [
        {
          _id: 'mock-id-1',
          endpoint: 'https://fcm.googleapis.com/fcm/send/example-endpoint-1',
          keys: {
            p256dh: 'mock-p256dh-key-1',
            auth: 'mock-auth-key-1'
          },
          createdAt: new Date().toISOString(),
          lastNotified: null,
          lastSeen: new Date().toISOString(),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          active: true,
          metadata: {
            browser: 'Chrome',
            platform: 'Windows'
          }
        },
        {
          _id: 'mock-id-2',
          endpoint: 'https://fcm.googleapis.com/fcm/send/example-endpoint-2',
          keys: {
            p256dh: 'mock-p256dh-key-2',
            auth: 'mock-auth-key-2'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          lastNotified: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
          active: true,
          metadata: {
            browser: 'Safari',
            platform: 'iOS'
          }
        }
      ];
      
      setSubscriptions(mockData);
      setIsMockData(true);
      
      // Mock stats
      setStats({
        total: mockData.length,
        active: mockData.length,
        inactive: 0,
        byBrowser: { 'Chrome': 1, 'Safari': 1 },
        byPlatform: { 'Windows': 1, 'iOS': 1 },
        recentlyNotified: 1
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }
    
    try {
      // Check if this is a mock subscription (starts with 'mock-id')
      if (id.startsWith('mock-id')) {
        // For mock data, just remove from state without API call
        setSubscriptions(subscriptions.filter(sub => sub._id !== id));
        return;
      }
      
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete subscription: ${response.status}`);
      }
      
      // Remove the deleted subscription from the state
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
      
      // Update stats
      if (stats) {
        const deletedSub = subscriptions.find(sub => sub._id === id);
        if (deletedSub) {
          const newStats = { ...stats };
          newStats.total--;
          
          if (deletedSub.active !== false) {
            newStats.active--;
          } else {
            newStats.inactive--;
          }
          
          setStats(newStats);
        }
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription. MongoDB connection may not be properly configured.');
      
      // Remove from state anyway for demo purposes
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
    }
  };

  const handleSendTestNotification = async () => {
    if (isMockData) {
      setTestNotificationStatus('Cannot send test notifications in mock data mode');
      setTimeout(() => setTestNotificationStatus(null), 3000);
      return;
    }
    
    try {
      setTestNotificationLoading(true);
      setTestNotificationStatus(null);
      
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-notification' // This should be replaced with a proper API key in production
        },
        body: JSON.stringify({
          title: testTitle,
          slug: { current: 'test-notification' },
          mainImage: { asset: { url: '/logo.png' } }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to send test notification: ${response.status}`);
      }
      
      const data = await response.json();
      
      setTestNotificationStatus(
        `Test notification sent successfully! Results: ${data.results?.success || 0} sent, ${data.results?.failed || 0} failed`
      );
      
      // Refresh the subscriptions list to update lastNotified timestamps
      setTimeout(() => {
        fetchSubscriptions();
      }, 1000);
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      setTestNotificationStatus(`Error: ${error.message}`);
    } finally {
      setTestNotificationLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions
    .filter(sub => filterActive === null || sub.active === filterActive)
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Subscription];
      let bValue: any = b[sortBy as keyof Subscription];
      
      // Handle null values
      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';
      
      // Handle dates
      if (typeof aValue === 'string' && (sortBy === 'createdAt' || sortBy === 'lastNotified' || sortBy === 'lastSeen')) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notification Subscriptions</h1>
        <Link 
          href="/admin" 
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back to Admin
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn-blue"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Data source indicator */}
          {isMockData && (
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-2 rounded mb-4 text-sm">
              Using mock data - MongoDB connection unavailable
            </div>
          )}
          
          {/* Stats cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recently Notified</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.recentlyNotified}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Browsers</h3>
                <div className="space-y-2">
                  {Object.entries(stats.byBrowser).map(([browser, count]) => (
                    <div key={browser} className="flex justify-between">
                      <span>{browser}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2">Platforms</h3>
                <div className="space-y-2">
                  {Object.entries(stats.byPlatform).map(([platform, count]) => (
                    <div key={platform} className="flex justify-between">
                      <span>{platform}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Test notification form */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6">
            <h3 className="text-lg font-semibold mb-2">Send Test Notification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="testTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="testTitle"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={testNotificationLoading}
                />
              </div>
              <div>
                <label htmlFor="testBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Body
                </label>
                <input
                  type="text"
                  id="testBody"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={testNotificationLoading}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handleSendTestNotification}
                disabled={testNotificationLoading || isMockData}
                className={`px-4 py-2 rounded text-white ${
                  testNotificationLoading || isMockData
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-vpn-blue hover:bg-blue-600'
                }`}
              >
                {testNotificationLoading ? 'Sending...' : 'Send Test Notification'}
              </button>
              {testNotificationStatus && (
                <div className={`text-sm ${
                  testNotificationStatus.startsWith('Error')
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {testNotificationStatus}
                </div>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterActive(null)}
              className={`px-3 py-1 rounded text-sm ${
                filterActive === null
                  ? 'bg-vpn-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`px-3 py-1 rounded text-sm ${
                filterActive === true
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`px-3 py-1 rounded text-sm ${
                filterActive === false
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Inactive
            </button>
          </div>
          
          {/* Subscriptions table */}
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No subscriptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th 
                      className="border border-gray-200 dark:border-gray-700 p-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleSort('active')}
                    >
                      Status {sortBy === 'active' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="border border-gray-200 dark:border-gray-700 p-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="border border-gray-200 dark:border-gray-700 p-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleSort('lastNotified')}
                    >
                      Last Notified {sortBy === 'lastNotified' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="border border-gray-200 dark:border-gray-700 p-2 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleSort('lastSeen')}
                    >
                      Last Seen {sortBy === 'lastSeen' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Browser / Platform</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub._id} className={`border-b border-gray-200 dark:border-gray-700 ${
                      sub.active === false ? 'bg-red-50 dark:bg-red-900/20' : ''
                    }`}>
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          sub.active === false ? 'bg-red-500' : 'bg-green-500'
                        }`}></span>
                        {sub.active === false ? 'Inactive' : 'Active'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        {formatDate(sub.lastNotified)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        {formatDate(sub.lastSeen)}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        {sub.metadata?.browser && (
                          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs mr-1">
                            {sub.metadata.browser}
                          </span>
                        )}
                        {sub.metadata?.platform && (
                          <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                            {sub.metadata.platform}
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        <button
                          onClick={() => handleDeleteSubscription(sub._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
