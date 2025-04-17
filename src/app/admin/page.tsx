"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import { Comment } from "@/models/Comment";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalComments: 0,
    pendingComments: 0,
    approvedComments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats when the component mounts
  useEffect(() => {
    fetchStats();
  }, []);

  // Function to fetch comment stats
  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/comments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      const comments = data.comments || [];
      
      // Calculate stats
      const totalComments = comments.length;
      const pendingComments = comments.filter((comment: any) => !comment.isApproved).length;
      const approvedComments = comments.filter((comment: any) => comment.isApproved).length;
      
      setStats({
        totalComments,
        pendingComments,
        approvedComments
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load stats. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Display error message if there is one */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Comments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Total Comments</h2>
          {isLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-vpn-blue">{stats.totalComments}</p>
          )}
        </div>
        
        {/* Pending Comments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Pending Comments</h2>
          {isLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-yellow-500">{stats.pendingComments}</p>
          )}
        </div>
        
        {/* Approved Comments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Approved Comments</h2>
          {isLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-green-500">{stats.approvedComments}</p>
          )}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/comments" 
            className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="mr-4 bg-vpn-blue text-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Manage Comments</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approve or reject user comments</p>
            </div>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="mr-4 bg-vpn-blue text-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">View Website</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Go to the main website</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
