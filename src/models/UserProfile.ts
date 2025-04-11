import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the user profile document
export interface IUserProfile extends Document {
  userId: string;
  categoryWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  authorWeights: Record<string, number>;
  lastUpdated: Date;
}

// Define the schema for user profiles
const UserProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  categoryWeights: {
    type: Map,
    of: Number,
    default: {},
  },
  tagWeights: {
    type: Map,
    of: Number,
    default: {},
  },
  authorWeights: {
    type: Map,
    of: Number,
    default: {},
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const UserProfile = mongoose.models.UserProfile || 
  mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

export default UserProfile;
