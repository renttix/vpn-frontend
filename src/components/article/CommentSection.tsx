"use client";

import React, { useState, useEffect, useRef } from "react";

// Function to reset reCAPTCHA
const resetReCaptcha = () => {
  if (typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).grecaptcha.reset) {
    try {
      (window as any).grecaptcha.reset();
    } catch (error) {
      console.error('Error resetting reCAPTCHA:', error);
    }
  }
};

interface Comment {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<HTMLDivElement>(null);

  // Fetch comments when the component mounts
  useEffect(() => {
    fetchComments();
  }, [articleId]);

  // Function to fetch comments for the article
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments?articleId=${articleId}`);
      
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

  // Function to format date for display
  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle reCAPTCHA callback
  useEffect(() => {
    // Define the callback function for reCAPTCHA
    if (typeof window !== 'undefined') {
      (window as any).onRecaptchaCallback = (token: string) => {
        setRecaptchaToken(token);
      };
      
      // Clean up
      return () => {
        delete (window as any).onRecaptchaCallback;
      };
    }
  }, []);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    if (recaptchaRef.current) {
      // Clear any existing content
      recaptchaRef.current.innerHTML = '';
      
      // Load reCAPTCHA script if not already loaded
      if (typeof window !== 'undefined') {
        if (!(window as any).grecaptcha) {
          const script = document.createElement('script');
          script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
          
          (window as any).onRecaptchaLoaded = () => {
            renderRecaptcha();
          };
          
          return () => {
            document.head.removeChild(script);
            delete (window as any).onRecaptchaLoaded;
          };
        } else {
          renderRecaptcha();
        }
      }
    }
  }, []);
  
  // Function to render the reCAPTCHA widget
  const renderRecaptcha = () => {
    if (recaptchaRef.current && typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).grecaptcha.render) {
      try {
        (window as any).grecaptcha.render(recaptchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          callback: 'onRecaptchaCallback',
          theme: 'light',
        });
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In development mode, allow empty tokens for testing
      if (!recaptchaToken && process.env.NODE_ENV === 'production') {
        setIsSubmitting(false);
        setError('Please complete the reCAPTCHA verification.');
        return;
      }
      
      // Use a fallback token in development if needed
      const tokenToUse = recaptchaToken || (process.env.NODE_ENV !== 'production' ? 'dev-token' : '');
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          name,
          email,
          content: comment,
          recaptchaToken: tokenToUse,
          recaptchaVersion: 'v2'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit comment');
      }
      
      // Reset form and show success message
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setComment("");
      resetReCaptcha();
      
      // Refresh comments after a short delay (to allow for database update)
      setTimeout(() => {
        fetchComments();
      }, 1000);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setIsSubmitting(false);
      setError('Failed to submit comment. Please try again later.');
      resetReCaptcha();
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="font-roboto font-bold text-xl mb-6 text-foreground" style={{ fontFamily: 'Roboto, sans-serif' }}>Comments</h3>
      
      {/* Display error message if there is one */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}
      
      {/* Comments list */}
      <div className="space-y-6 mb-8">
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-vpn-gray-light dark:text-gray-400">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="bg-card border border-border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{comment.name}</h4>
                  <p className="text-xs text-foreground/70">{formatCommentDate(comment.createdAt)}</p>
                </div>
              </div>
              <p className="text-foreground/80 text-sm">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-vpn-gray-light dark:text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
      
      {/* Comment form */}
      <div className="bg-card border border-border rounded-md p-4">
        <h4 className="font-medium text-foreground mb-4">Leave a Comment</h4>
        
        {isSubmitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded-md text-sm">
            Thank you for your comment!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-foreground/80 mb-1">
                Comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground"
                required
              />
            </div>
            
            {/* reCAPTCHA container */}
            <div className="my-4">
              <div ref={recaptchaRef} className="g-recaptcha"></div>
              <p className="text-xs text-foreground/60 mt-2">
                Please complete the reCAPTCHA verification above to submit your comment.
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !recaptchaToken}
                className="bg-vpn-blue hover:bg-vpn-blue/90 text-white font-medium py-2 px-4 rounded-md text-sm disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Post Comment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
