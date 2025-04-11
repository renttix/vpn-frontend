import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for subscription metadata
interface SubscriptionMetadata {
  ip?: string;
  browser?: string;
  platform?: string;
  referrer?: string;
}

// Define the interface for the subscription document
export interface ISubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  lastNotified: Date | null;
  lastSeen: Date | null;
  userAgent?: string;
  categories?: string[];
  metadata?: SubscriptionMetadata;
  active: boolean;
}

// Define the schema for push subscriptions
const SubscriptionSchema = new Schema<ISubscription>({
  endpoint: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastNotified: {
    type: Date,
    default: null,
    index: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // Optional: track user info or preferences
  userAgent: String,
  categories: [String], // If you want to allow category-specific notifications
  metadata: {
    ip: String,
    browser: String,
    platform: String,
    referrer: String,
  },
  active: {
    type: Boolean,
    default: true,
    index: true,
  }
});

// Add TTL index to automatically remove subscriptions that haven't been seen in 6 months
// This helps keep the database clean of abandoned subscriptions
SubscriptionSchema.index({ lastSeen: 1 }, { 
  expireAfterSeconds: 15552000, // 180 days (6 months)
  background: true 
});

// Add compound index for more efficient queries
SubscriptionSchema.index({ active: 1, lastNotified: 1 });

// Create the model
const Subscription = mongoose.models.Subscription || 
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
