"use client";

import React, { useState } from "react";

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setComment("");
    }, 1000);
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="font-roboto font-bold text-xl mb-6 text-foreground" style={{ fontFamily: 'Roboto, sans-serif' }}>Comments</h3>
      
      {/* Sample comments */}
      <div className="space-y-6 mb-8">
        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-foreground">Michael Johnson</h4>
              <p className="text-xs text-foreground/70">March 2, 2025</p>
            </div>
          </div>
          <p className="text-foreground/80 text-sm">
            This is shocking but unfortunately not surprising. The oversight mechanisms in fast-growing startups are often inadequate. I've seen similar issues in my consulting work.
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-foreground">Rebecca Liu</h4>
              <p className="text-xs text-foreground/70">March 1, 2025</p>
            </div>
          </div>
          <p className="text-foreground/80 text-sm">
            I'm curious about how this will affect TechVision's upcoming product launches. Anyone have insights on whether their AI healthcare platform is still on track for Q2?
          </p>
        </div>
      </div>
      
      {/* Comment form */}
      <div className="bg-card border border-border rounded-md p-4">
        <h4 className="font-medium text-foreground mb-4">Leave a Comment</h4>
        
        {isSubmitted ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded-md text-sm">
            Thank you for your comment! It will appear after moderation.
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
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
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
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
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
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
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
