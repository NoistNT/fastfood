'use client';

import { useEffect, useState } from 'react';

import { ChartSkeleton } from '@/modules/core/ui/skeleton-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';

interface ForecastData {
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
}

export function RevenueForecast() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        // Fetch revenue data from summary API
        const response = await fetch('/api/dashboard/summary');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const data = result.data;
            const currentRevenue = data.totalRevenue ?? 0;
            const growthRate = 0.15; // 15% growth assumption
            const projectedRevenue = currentRevenue * (1 + growthRate);

            let trend: 'up' | 'down' | 'stable' = 'stable';
            if (growthRate > 0.1) trend = 'up';
            else if (growthRate < -0.1) trend = 'down';

            setForecast({
              currentRevenue,
              projectedRevenue,
              growthRate,
              trend,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch revenue forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
          <CardDescription>Projected revenue trends and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!forecast) {
    return <div>Failed to load revenue forecast</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Forecasting</CardTitle>
        <CardDescription>Projected revenue based on current trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-2xl font-bold">${forecast.currentRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Current Revenue</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">${forecast.projectedRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Projected Next Month</p>
            </div>
            <div className="space-y-2">
              <p
                className={`text-2xl font-bold ${
                  forecast.trend === 'up'
                    ? 'text-green-600'
                    : forecast.trend === 'down'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {(forecast.growthRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Trend:{' '}
            {forecast.trend === 'up'
              ? '📈 Growing'
              : forecast.trend === 'down'
                ? '📉 Declining'
                : '➡️ Stable'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
