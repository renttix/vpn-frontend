// Check if notifications are enabled (only in development mode)
export const NOTIFICATIONS_ENABLED = process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === 'true' || process.env.NODE_ENV === 'development';

// VAPID keys for Web Push Notifications (only used in development)
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLBz5U0ynWG4O3RsQKR-eLmEt0srZSIVM8k-RgFawuO5fFX8PQYCvnE0xKOV9wbVP6j9RK1NKl_rNzFdPeUJUAA';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'QD0GhRTY0qgYT0eeXTTYrfj7A7Q9QKsXYP_YrxpnQQA';

// Utility functions for handling push notifications

// Check if the browser supports service workers and push notifications
export function isPushNotificationSupported() {
  // Return false if notifications are disabled or not in browser environment
  if (!NOTIFICATIONS_ENABLED || typeof window === 'undefined') {
    return false;
  }
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Register the service worker
export async function registerServiceWorker() {
  if (!isPushNotificationSupported()) {
    console.log('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Request permission to show notifications
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Get the current notification permission status
export function getNotificationPermission() {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    // Get the server's public key from the API
    const response = await fetch('/api/notifications/vapid-public-key');
    const { publicKey } = await response.json();

    // Subscribe the user to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Always show notifications to the user
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    console.log('User subscribed to push notifications');

    // Send the subscription object to the server
    await saveSubscription(subscription);

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('No subscription to unsubscribe from');
      return true;
    }

    // Unsubscribe from push notifications
    const success = await subscription.unsubscribe();

    if (success) {
      // Remove the subscription from the server
      await deleteSubscription(subscription);
      console.log('User unsubscribed from push notifications');
    }

    return success;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Get the current push notification subscription
export async function getSubscription() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

// Save the subscription to the server
async function saveSubscription(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }

    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
}

// Delete the subscription from the server
async function deleteSubscription(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to delete subscription');
    }

    return true;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return false;
  }
}

// Convert a base64 string to a Uint8Array for the applicationServerKey
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
