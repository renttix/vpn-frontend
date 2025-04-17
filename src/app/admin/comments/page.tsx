"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";

interface Comment {
  _id: string;
  articleId: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export default function CommentsAdminPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all comments when the component mounts
  useEffect(() => {
    fetchComments();
  }, []);

  // Function to fetch all comments
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/comments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to approve a comment
  const approveComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve comment');
      }
      
      // Update the comment in the local state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId 
            ? { ...comment, isApproved: true } 
            : comment
        )
      );
      
      setSuccessMessage('Comment approved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error approving comment:', err);
      setError('Failed to approve comment. Please try again later.');
    }
  };

  // Function to reject a comment
  const rejectComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject comment');
      }
      
      // Remove the comment from the local state
      setComments(prevComments => 
        prevComments.filter(comment => comment._id !== commentId)
      );
      
      setSuccessMessage('Comment rejected successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error rejecting comment:', err);
      setError('Failed to reject comment. Please try again later.');
    }
  };

  // Function to format date for display
  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Comments Administration</h1>
      
      {/* Display error message if there is one */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}
      
      {/* Display success message if there is one */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded-md text-sm mb-6">
          {successMessage}
        </div>
      )}
      
      {/* Comments list */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Comments</h2>
          <button 
            onClick={fetchComments}
            className="px-3 py-1 bg-vpn-blue text-white rounded-md text-sm hover:bg-vpn-blue/90"
          >
            Refresh
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {comments.map((comment) => (
              <div key={comment._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{comment.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{comment.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatCommentDate(comment.createdAt)}</p>
                  </div>
                  <div className="flex space-x-2">
                    {!comment.isApproved && (
                      <button
                        onClick={() => approveComment(comment._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => rejectComment(comment._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="mt-2 text-xs">
                  <span className="font-medium">Article ID:</span> {comment.articleId}
                </div>
                <div className="mt-1 text-xs">
                  <span className="font-medium">Status:</span> {comment.isApproved ? (
                    <span className="text-green-600 dark:text-green-400">Approved</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No comments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
