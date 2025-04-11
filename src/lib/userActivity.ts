import { v4 as uuidv4 } from 'uuid';
import connectToDatabase from './mongodb';
import UserActivity from '@/models/UserActivity';
import UserProfile from '@/models/UserProfile';

/**
 * Get or create anonymous user ID from cookies
 */
export function getUserId(): string {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return '';
  }

  // Try to get the user ID from cookies
  let userId = getCookie('vpn_user_id');
  
  // If no user ID exists, create a new one and set the cookie
  if (!userId) {
    userId = uuidv4();
    setCookie('vpn_user_id', userId, 365); // 365 days expiry
  }
  
  return userId;
}

/**
 * Track article view
 */
export async function trackArticleView(
  userId: string, 
  articleId: string, 
  articleData: {
    categories?: string[];
    tags?: string[];
    author?: string;
  }
): Promise<void> {
  try {
    // Skip if no user ID
    if (!userId) return;
    
    // Connect to database
    await connectToDatabase();
    
    // Create activity record
    await UserActivity.create({
      userId,
      articleId,
      type: 'view',
      timestamp: new Date(),
      categories: articleData.categories || [],
      tags: articleData.tags || [],
      author: articleData.author,
    });
    
    // Update user profile with aggregated interests
    await updateUserProfile(userId, articleData);
    
    console.log(`Tracked view for article ${articleId} by user ${userId}`);
  } catch (error) {
    console.error('Error tracking article view:', error);
  }
}

/**
 * Track user interaction with article (like, share, bookmark)
 */
export async function trackArticleInteraction(
  userId: string,
  articleId: string,
  interactionType: 'like' | 'share' | 'bookmark',
  articleData: {
    categories?: string[];
    tags?: string[];
    author?: string;
  }
): Promise<void> {
  try {
    // Skip if no user ID
    if (!userId) return;
    
    // Connect to database
    await connectToDatabase();
    
    // Create activity record
    await UserActivity.create({
      userId,
      articleId,
      type: interactionType,
      timestamp: new Date(),
      categories: articleData.categories || [],
      tags: articleData.tags || [],
      author: articleData.author,
    });
    
    // Update user profile with stronger weight for interactions
    await updateUserProfile(userId, articleData, 2); // Double weight for interactions
    
    console.log(`Tracked ${interactionType} for article ${articleId} by user ${userId}`);
  } catch (error) {
    console.error(`Error tracking article ${interactionType}:`, error);
  }
}

/**
 * Update user profile with aggregated interests
 */
async function updateUserProfile(
  userId: string, 
  articleData: {
    categories?: string[];
    tags?: string[];
    author?: string;
  },
  weight: number = 1
): Promise<void> {
  try {
    // Find existing profile or create new one
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({
        userId,
        categoryWeights: {},
        tagWeights: {},
        authorWeights: {},
      });
    }
    
    // Update category weights
    if (articleData.categories && articleData.categories.length > 0) {
      for (const category of articleData.categories) {
        const currentWeight = profile.categoryWeights[category] || 0;
        profile.categoryWeights[category] = currentWeight + weight;
      }
    }
    
    // Update tag weights
    if (articleData.tags && articleData.tags.length > 0) {
      for (const tag of articleData.tags) {
        const currentWeight = profile.tagWeights[tag] || 0;
        profile.tagWeights[tag] = currentWeight + weight;
      }
    }
    
    // Update author weights
    if (articleData.author) {
      const currentWeight = profile.authorWeights[articleData.author] || 0;
      profile.authorWeights[articleData.author] = currentWeight + weight;
    }
    
    // Update last updated timestamp
    profile.lastUpdated = new Date();
    
    // Save the profile
    await profile.save();
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

/**
 * Helper function to get a cookie value
 */
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}

/**
 * Helper function to set a cookie
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}
