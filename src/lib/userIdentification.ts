/**
 * User Identification Utility
 * 
 * This file provides utilities for identifying users and storing their information
 * for tracking purposes.
 */

/**
 * Store user email in localStorage
 * @param email User's email address
 */
export function storeUserEmail(email: string): void {
  if (typeof window === 'undefined' || !email) return;
  
  try {
    localStorage.setItem('userEmail', email);
  } catch (error) {
    console.error('Error storing user email:', error);
  }
}

/**
 * Get user email from localStorage
 * @returns User's email address or null if not found
 */
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('userEmail');
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Clear user email from localStorage
 */
export function clearUserEmail(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('userEmail');
  } catch (error) {
    console.error('Error clearing user email:', error);
  }
}

/**
 * Check if user is identified
 * @returns True if user is identified, false otherwise
 */
export function isUserIdentified(): boolean {
  return !!getUserEmail();
}
