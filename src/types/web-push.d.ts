// Type definitions for web-push integration

// Extend the PushSubscription type to match what web-push expects
interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}
