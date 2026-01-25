'use client';

import { useEffect, useState, useCallback } from 'react';

import { useToast } from '@/modules/core/hooks/use-toast';

// Types for offline order storage
interface OfflineOrder {
  id: string;
  items: unknown[];
  total: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
}

// Storage key for offline orders
const OFFLINE_ORDERS_KEY = 'fastfood_offline_orders';

// Custom hook for offline order management
export function useOfflineOrders() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineOrders, setOfflineOrders] = useState<OfflineOrder[]>([]);
  const { toast } = useToast();

  // Load offline orders from storage
  const loadOfflineOrders = useCallback(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_ORDERS_KEY);
      if (stored) {
        const orders = JSON.parse(stored);
        setOfflineOrders(orders);
      }
    } catch (_error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading offline orders');
      }
    }
  }, []);

  // Save offline orders to storage
  const saveOfflineOrders = useCallback((orders: OfflineOrder[]) => {
    try {
      localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
      setOfflineOrders(orders);
    } catch (_error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading offline orders');
      }
    }
  }, []);

  // Add order to offline queue
  const addOfflineOrder = useCallback(
    (orderData: { items: unknown[]; total: string }) => {
      const offlineOrder: OfflineOrder = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: orderData.items,
        total: orderData.total,
        timestamp: Date.now(),
        status: 'pending',
      };

      const updatedOrders = [...offlineOrders, offlineOrder];
      saveOfflineOrders(updatedOrders);

      // Register for background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          (
            registration as unknown as { sync: { register: (tag: string) => Promise<void> } }
          ).sync.register('background-sync-orders');
        });
      }

      toast({
        title: 'Order saved offline',
        description: 'Your order will be submitted when you are back online.',
      });

      return offlineOrder;
    },
    [offlineOrders, saveOfflineOrders, toast]
  );

  // Sync offline orders when back online
  const syncOfflineOrders = useCallback(async () => {
    if (!isOnline || offlineOrders.length === 0) return;

    const pendingOrders = offlineOrders.filter((order) => order.status === 'pending');
    if (pendingOrders.length === 0) return;

    toast({
      title: 'Syncing orders',
      description: `Submitting ${pendingOrders.length} offline order(s)...`,
    });

    // Update status to syncing
    const syncingOrders = offlineOrders.map((order) =>
      pendingOrders.includes(order) ? { ...order, status: 'syncing' as const } : order
    );
    saveOfflineOrders(syncingOrders);

    // Try to submit each order
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: order.items,
            total: order.total,
          }),
        });

        if (response.ok) {
          // Remove successful order from offline storage
          const updatedOrders = offlineOrders.filter((o) => o.id !== order.id);
          saveOfflineOrders(updatedOrders);

          toast({
            title: 'Order synced',
            description: 'Your offline order has been submitted successfully.',
          });
        } else {
          // Mark as failed
          const updatedOrders = offlineOrders.map((o) =>
            o.id === order.id ? { ...o, status: 'failed' as const } : o
          );
          saveOfflineOrders(updatedOrders);

          toast({
            title: 'Sync failed',
            description: 'Some orders could not be submitted. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (_error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error saving offline orders');
        }
      }
    }
  }, [isOnline, offlineOrders, saveOfflineOrders, toast]);

  // Remove failed orders
  const removeOfflineOrder = useCallback(
    (orderId: string) => {
      const updatedOrders = offlineOrders.filter((order) => order.id !== orderId);
      saveOfflineOrders(updatedOrders);
    },
    [offlineOrders, saveOfflineOrders]
  );

  // Retry failed orders
  const retryOfflineOrder = useCallback(
    async (orderId: string) => {
      const order = offlineOrders.find((o) => o.id === orderId);
      if (order?.status !== 'failed') return;

      // Mark as syncing
      const updatedOrders = offlineOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'syncing' as const } : o
      );
      saveOfflineOrders(updatedOrders);

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: order.items,
            total: order.total,
          }),
        });

        if (response.ok) {
          // Remove successful order
          const updatedOrders = offlineOrders.filter((o) => o.id !== orderId);
          saveOfflineOrders(updatedOrders);

          toast({
            title: 'Order synced',
            description: 'Your order has been submitted successfully.',
          });
        } else {
          throw new Error('Submission failed');
        }
      } catch (_error) {
        // Mark as failed again
        const updatedOrders = offlineOrders.map((o) =>
          o.id === orderId ? { ...o, status: 'failed' as const } : o
        );
        saveOfflineOrders(updatedOrders);

        toast({
          title: 'Retry failed',
          description: 'Could not submit the order. Please try again later.',
          variant: 'destructive',
        });
      }
    },
    [offlineOrders, saveOfflineOrders, toast]
  );

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOrders();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineOrders]);

  // Load orders on mount
  useEffect(() => {
    loadOfflineOrders();
  }, [loadOfflineOrders]);

  return {
    isOnline,
    offlineOrders,
    addOfflineOrder,
    removeOfflineOrder,
    retryOfflineOrder,
    syncOfflineOrders,
  };
}
