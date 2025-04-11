# Recommendation Engine Setup

This document explains how the recommendation engine works and how to maintain it.

## Overview

The recommendation engine provides personalized article recommendations based on user reading history. It tracks user activity anonymously and builds a profile of interests to suggest relevant content.

## Key Components

1. **User Activity Tracking**
   - Anonymous user IDs stored in cookies
   - Article views tracked in MongoDB
   - User profiles built based on reading patterns

2. **Recommendation Algorithm**
   - Weighted interests based on categories, tags, and authors
   - Fallback to popular articles for new users
   - Hybrid approach combining content-based and popularity-based recommendations

3. **UI Components**
   - RecommendedArticles component displays personalized suggestions
   - Seamless integration with existing article pages

## Technical Implementation

### Data Models

Two MongoDB collections are used:

1. **UserActivity**: Stores individual user interactions
   - `userId`: Anonymous user identifier
   - `articleId`: Sanity document ID
   - `type`: Interaction type (view, like, share, bookmark)
   - `timestamp`: When the interaction occurred
   - `categories`, `tags`, `author`: Article metadata for faster aggregation

2. **UserProfile**: Stores aggregated user interests
   - `userId`: Anonymous user identifier
   - `categoryWeights`: Map of category slugs to interest weights
   - `tagWeights`: Map of tag slugs to interest weights
   - `authorWeights`: Map of author slugs to interest weights
   - `lastUpdated`: When the profile was last updated

### API Endpoints

1. `/api/recommendations`: Fetches personalized article recommendations
   - Uses user profile to find relevant articles
   - Falls back to popular articles if no profile exists
   - Supports filtering out the current article

2. `/api/articles/[id]/view`: Tracks article views in Sanity
   - Increments the `pageViews` counter for popularity tracking

### Client-Side Integration

The recommendation engine is integrated into the article pages:

1. User views are tracked in `ArticlePageClient.tsx`
2. Recommendations are displayed using the `RecommendedArticles` component
3. Anonymous user IDs are managed via cookies

## Maintenance and Expansion

### Adding New Interest Factors

To add new factors for recommendations:

1. Update the `UserProfile` schema to include new weight types
2. Modify the `updateUserProfile` function in `userActivity.ts`
3. Update the recommendation query in `/api/recommendations/route.ts`

### Performance Considerations

- The `UserActivity` collection will grow over time and may need periodic cleanup
- Consider adding TTL indexes to automatically expire old activity records
- Monitor MongoDB performance and add indexes as needed

### Future Enhancements

Potential improvements to consider:

1. **Collaborative Filtering**: Recommend articles that similar users have read
2. **Recency Weighting**: Give more weight to recent reading behavior
3. **Explicit Feedback**: Allow users to rate articles or save favorites
4. **A/B Testing**: Test different recommendation algorithms for engagement
5. **Content Analysis**: Use NLP to analyze article content for deeper similarity matching

## Troubleshooting

Common issues and solutions:

1. **No recommendations appearing**:
   - Check MongoDB connection
   - Verify user cookies are being set correctly
   - Ensure Sanity queries are returning results

2. **Recommendations not personalized**:
   - Check that user activity is being tracked
   - Verify user profiles are being created and updated
   - Look for errors in the recommendation API logs

3. **Performance issues**:
   - Add appropriate indexes to MongoDB collections
   - Optimize Sanity queries
   - Consider caching recommendations for active users
