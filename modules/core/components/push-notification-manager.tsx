'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { useToast } from '@/modules/core/hooks/use-toast';

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribeToNotifications = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        // You'll need to generate these from your server
        // For demo purposes, using placeholder values
        const vapidPublicKey =
          'BKxQzA3YV8QH_9kxGxO7BqNJzO1YV8QH_9kxGxO7BqNJzO1YV8QH_9kxGxO7BqNJzO1YV8QH_9kxGxO7BqNJzO1Y'; // Replace with actual VAPID key

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Send subscription to server
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        });

        if (response.ok) {
          setIsSubscribed(true);
          toast({
            title: 'Notifications enabled',
            description: 'You will now receive order status updates.',
          });
        } else {
          throw new Error('Failed to subscribe on server');
        }
      } else {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: 'Subscription failed',
        description: 'Unable to enable push notifications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        setIsSubscribed(false);
        toast({
          title: 'Notifications disabled',
          description: 'You will no longer receive push notifications.',
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast({
        title: 'Unsubscription failed',
        description: 'Unable to disable notifications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return null; // Hide component if not supported
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
      disabled={isLoading}
      className="fixed bottom-20 right-4 z-10"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Disable Notifications
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Enable Notifications
        </>
      )}
    </Button>
  );
}
