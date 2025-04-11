"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Define types for our stats data
interface ActivityRecord {
  userId: string;
  articleId: string;
  type: string;
  timestamp: string;
}

interface CountRecord {
  _id: string;
  count: number;
}

interface RecommendationStats {
  activityCount: number;
  viewCount: number;
  uniqueUserCount: number;
  uniqueArticleCount: number;
  profileCount: number;
  recentActivity: ActivityRecord[];
  topUsers: CountRecord[];
  topArticles: CountRecord[];
  isMockData?: boolean; // Flag to indicate if this is mock data
}

// Simple stat card component
function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

// Connection status indicator component
function ConnectionStatus({ isMockData }: { isMockData?: boolean }) {
  if (isMockData === undefined) return null;
  
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
      isMockData 
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }`}>
      {isMockData 
        ? 'Using Mock Data (MongoDB Unavailable)' 
        : 'Connected to MongoDB'}
    </div>
  );
}

export default function RecommendationsAdminPage() {
  const [stats, setStats] = useState<RecommendationStats>({
    activityCount: 0,
    viewCount: 0,
    uniqueUserCount: 0,
    uniqueArticleCount: 0,
    profileCount: 0,
    recentActivity: [],
    topUsers: [],
    topArticles: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'mock' | 'unknown'>('unknown');

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching recommendation stats...');
        const response = await fetch('/api/admin/recommendations/stats');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received recommendation stats:', data);
        
        // Check if this is mock data
        if (data.isMockData) {
          console.log('Using mock data for recommendations (MongoDB unavailable)');
          setConnectionStatus('mock');
        } else {
          console.log('Successfully connected to MongoDB');
          setConnectionStatus('connected');
        }
        
        setStats(data);
      } catch (err) {
        console.error('Error fetching recommendation stats:', err);
        setError('Failed to load recommendation stats');
        setConnectionStatus('mock');
        
        // For demonstration purposes, set mock data
        setStats({
          activityCount: 125,
          viewCount: 98,
          uniqueUserCount: 42,
          uniqueArticleCount: 15,
          profileCount: 38,
          recentActivity: Array(5).fill(null).map((_, i) => ({
            userId: `mock-user-${i}`,
            articleId: `mock-article-${i}`,
            type: i % 2 === 0 ? 'view' : 'bookmark',
            timestamp: new Date(Date.now() - i * 3600000).toISOString()
          })),
          topUsers: Array(5).fill(null).map((_, i) => ({
            _id: `mock-user-${i}`,
            count: 50 - i * 8
          })),
          topArticles: Array(5).fill(null).map((_, i) => ({
            _id: `mock-article-${i}`,
            count: 30 - i * 5
          })),
          isMockData: true
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Recommendation Engine Dashboard</h1>
            <ConnectionStatus isMockData={stats.isMockData} />
          </div>
          <Link 
            href="/admin" 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Admin
          </Link>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Activities" value={stats.activityCount} />
          <StatCard title="Article Views" value={stats.viewCount} />
          <StatCard title="Unique Users" value={stats.uniqueUserCount} />
          <StatCard title="User Profiles" value={stats.profileCount} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{activity.userId.substring(0, 8)}...</td>
                      <td className="px-4 py-2 text-sm">{activity.articleId.substring(0, 8)}...</td>
                      <td className="px-4 py-2 text-sm">{activity.type}</td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {stats.recentActivity.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-sm text-center">No activity recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Top Users */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
            <h2 className="text-lg font-bold mb-4">Top Users by Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activity Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.topUsers.map((user: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{user._id.substring(0, 8)}...</td>
                      <td className="px-4 py-2 text-sm">{user.count}</td>
                    </tr>
                  ))}
                  {stats.topUsers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-sm text-center">No users recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Top Articles */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
            <h2 className="text-lg font-bold mb-4">Top Articles by Views</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">View Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.topArticles.map((article: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{article._id.substring(0, 8)}...</td>
                      <td className="px-4 py-2 text-sm">{article.count}</td>
                    </tr>
                  ))}
                  {stats.topArticles.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-sm text-center">No article views recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Maintenance Tools */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
            <h2 className="text-lg font-bold mb-4">Maintenance</h2>
            <p className="text-sm mb-4">
              These tools help manage the recommendation engine data. Use with caution.
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <h3 className="font-medium">Clean Old Activity Data</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Removes activity data older than 90 days to keep the database size manageable.
                </p>
                <form action="/api/admin/recommendations/clean-old-data" method="POST">
                  <button 
                    type="submit"
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Run Cleanup
                  </button>
                </form>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                <h3 className="font-medium">Rebuild User Profiles</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Regenerates all user profiles based on activity data. Useful if profiles become inconsistent.
                </p>
                <form action="/api/admin/recommendations/rebuild-profiles" method="POST">
                  <button 
                    type="submit"
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Rebuild Profiles
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
