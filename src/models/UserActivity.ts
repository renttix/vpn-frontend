import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the user activity document
export interface IUserActivity extends Document {
  userId: string;
  articleId: string;
  type: 'view' | 'like' | 'share' | 'bookmark';
  timestamp: Date;
  categories?: string[];
  tags?: string[];
  author?: string;
}

// Define the schema for user activity
const UserActivitySchema = new Schema<IUserActivity>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  articleId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['view', 'like', 'share', 'bookmark'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Article metadata for faster aggregation
  categories: [String],
  tags: [String],
  author: String,
});

// Create compound index for faster queries
UserActivitySchema.index({ userId: 1, articleId: 1, type: 1 });

// Create the model
const UserActivity = mongoose.models.UserActivity || 
  mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);

export default UserActivity;
