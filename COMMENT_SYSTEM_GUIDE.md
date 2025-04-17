# Comment System Implementation Guide

This document provides information about the comment system implementation for VPN News. The system allows users to submit comments on articles, which are stored in MongoDB and can be moderated through an admin interface. Comment data is also sent to HubSpot for lead management.

## Overview

The comment system includes the following components:

1. **Comment Model**: Defines the schema for storing comments in MongoDB
2. **Public API Endpoints**: For submitting and retrieving comments
3. **Admin API Endpoints**: For managing comments (approving/rejecting)
4. **Comment Section Component**: UI for displaying and submitting comments
5. **Admin Interface**: UI for moderating comments
6. **HubSpot Integration**: Sends commenter information to HubSpot for lead management

## Database Schema

Comments are stored in MongoDB using the following schema:

```typescript
interface IComment {
  articleId: string;
  name: string;
  email: string;
  content: string;
  createdAt: Date;
  isApproved: boolean;
}
```

- `articleId`: The ID of the article the comment belongs to
- `name`: The name of the commenter
- `email`: The email of the commenter (not displayed publicly)
- `content`: The text content of the comment
- `createdAt`: The date and time when the comment was submitted
- `isApproved`: Whether the comment has been approved by a moderator

## Public API Endpoints

### Submit a Comment

**Endpoint**: `POST /api/comments`

**Request Body**:
```json
{
  "articleId": "article-id",
  "name": "John Doe",
  "email": "john@example.com",
  "content": "This is a great article!"
}
```

**Response**:
```json
{
  "message": "Comment submitted successfully",
  "comment": {
    "id": "comment-id",
    "name": "John Doe",
    "content": "This is a great article!",
    "createdAt": "2025-04-16T20:30:00.000Z",
    "isApproved": false
  }
}
```

### Get Comments for an Article

**Endpoint**: `GET /api/comments?articleId=article-id`

**Response**:
```json
{
  "comments": [
    {
      "_id": "comment-id-1",
      "name": "John Doe",
      "content": "This is a great article!",
      "createdAt": "2025-04-16T20:30:00.000Z"
    },
    {
      "_id": "comment-id-2",
      "name": "Jane Smith",
      "content": "I learned a lot from this.",
      "createdAt": "2025-04-16T20:35:00.000Z"
    }
  ]
}
```

**Note**: This endpoint only returns approved comments.

## Admin API Endpoints

### Get All Comments (Including Unapproved)

**Endpoint**: `GET /api/admin/comments`

**Response**:
```json
{
  "comments": [
    {
      "_id": "comment-id-1",
      "articleId": "article-id",
      "name": "John Doe",
      "email": "john@example.com",
      "content": "This is a great article!",
      "createdAt": "2025-04-16T20:30:00.000Z",
      "isApproved": true
    },
    {
      "_id": "comment-id-2",
      "articleId": "article-id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "content": "I learned a lot from this.",
      "createdAt": "2025-04-16T20:35:00.000Z",
      "isApproved": false
    }
  ]
}
```

### Approve a Comment

**Endpoint**: `PUT /api/admin/comments/{commentId}/approve`

**Response**:
```json
{
  "message": "Comment approved successfully",
  "comment": {
    "_id": "comment-id",
    "articleId": "article-id",
    "name": "John Doe",
    "email": "john@example.com",
    "content": "This is a great article!",
    "createdAt": "2025-04-16T20:30:00.000Z",
    "isApproved": true
  }
}
```

### Delete a Comment

**Endpoint**: `DELETE /api/admin/comments/{commentId}`

**Response**:
```json
{
  "message": "Comment deleted successfully"
}
```

## Frontend Components

### Comment Section Component

The `CommentSection` component is used to display comments for an article and allow users to submit new comments. It is used in article pages.

```tsx
import { CommentSection } from '@/components/article/CommentSection';

// In your article page component
<CommentSection articleId={article._id} />
```

### Admin Interface

The admin interface consists of:

1. **Admin Dashboard**: Shows statistics about comments
2. **Comments Management Page**: Allows moderators to approve or reject comments

To access the admin interface, navigate to:
- Dashboard: `/admin`
- Comments Management: `/admin/comments`

## Comment Moderation Workflow

1. A user submits a comment on an article
2. The comment is saved to the database with `isApproved` set to `false`
3. The user sees a message that their comment will appear after moderation
4. An administrator logs into the admin interface
5. The administrator reviews pending comments
6. The administrator approves or rejects each comment
7. Approved comments appear on the article page

## Security Considerations

- Only approved comments are displayed publicly
- User emails are collected but not displayed publicly
- User data is sent to HubSpot for lead management and marketing purposes
- The admin interface should be protected with authentication (to be implemented)
- API endpoints for admin operations should be secured (to be implemented)

## Future Enhancements

Potential future enhancements for the comment system:

1. **Authentication**: Require users to log in to comment
2. **Notifications**: Notify administrators of new comments
3. **Spam Detection**: Automatically filter spam comments
4. **Rich Text**: Allow formatting in comments
5. **Replies**: Support nested comments/replies
6. **Reactions**: Allow users to react to comments (like, etc.)
7. **Reporting**: Allow users to report inappropriate comments
8. **User Profiles**: Link comments to user profiles

## HubSpot Integration

When a user submits a comment, their information is also sent to HubSpot:

1. The user's name is split into first name and last name
2. The comment content is included as a message
3. The form type is set to "comment"
4. The submission date is recorded

This integration allows you to:
- Track user engagement through comments
- Build your contact database
- Include commenters in marketing campaigns
- Analyze user engagement patterns

### HubSpot Environment Variables

For the HubSpot integration to work, ensure the following environment variables are set:

```
HUBSPOT_API_KEY=your-hubspot-api-key
```

## Deployment Considerations

When deploying to Vercel, ensure:

1. **MongoDB Connection**: The `MONGODB_URI` environment variable is set in Vercel
2. **HubSpot API Key**: The `HUBSPOT_API_KEY` environment variable is set in Vercel
3. **Error Handling**: The system gracefully handles database connection issues
4. **Rate Limiting**: Consider implementing rate limiting to prevent abuse

## Troubleshooting

### Comments Not Appearing

If comments are not appearing on the article page:

1. Check if the comments have been approved in the admin interface
2. Verify that the correct `articleId` is being passed to the `CommentSection` component
3. Check the browser console for any API errors

### Admin Interface Issues

If the admin interface is not working correctly:

1. Check the browser console for any errors
2. Verify that the MongoDB connection is working
3. Check that the API endpoints are accessible

## Conclusion

This comment system provides a solid foundation for user engagement on the VPN News website. It includes all the essential features for submitting, displaying, and moderating comments, with room for future enhancements as needed.
