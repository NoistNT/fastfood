'use client';

import { useState } from 'react';
import { Wifi, WifiOff, Clock, Trash2, RotateCcw } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { Badge } from '@/modules/core/ui/badge';
import { useOfflineOrders } from '@/modules/core/hooks/use-offline-orders';

export function OfflineStatus() {
  const { isOnline, offlineOrders, removeOfflineOrder, retryOfflineOrder } = useOfflineOrders();
  const [showDetails, setShowDetails] = useState(false);

  const pendingOrders = offlineOrders.filter((order) => order.status === 'pending');
  const failedOrders = offlineOrders.filter((order) => order.status === 'failed');

  if (isOnline && offlineOrders.length === 0) {
    return null; // Don't show anything if online and no offline orders
  }

  return (
    <Card className={`mb-6 border-2 ${!isOnline ? 'border-destructive' : 'border-orange-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-destructive" />
            )}
            <CardTitle className="text-lg">{isOnline ? 'Online' : 'Offline Mode'}</CardTitle>
          </div>
          {offlineOrders.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          )}
        </div>
        <CardDescription>
          {isOnline
            ? `You have ${offlineOrders.length} offline order(s) that will be synced.`
            : 'Your orders will be saved locally and submitted when you are back online.'}
        </CardDescription>
      </CardHeader>

      {showDetails && offlineOrders.length > 0 && (
        <CardContent>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Order #{order.id.split('_')[1]}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} items • ${order.total} •{' '}
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}

            {failedOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <WifiOff className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="font-medium">Order #{order.id.split('_')[1]}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} items • ${order.total} •{' '}
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => retryOfflineOrder(order.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOfflineOrder(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
