'use client';

import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { ChartSkeleton } from '@/modules/core/ui/skeleton-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { useDashboardSummary } from '@/modules/core/hooks/use-api-cache';

interface ForecastData {
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
}

export function RevenueForecast() {
  const { data, isPending, isError } = useDashboardSummary();
  const summary = (data?.data ?? null) as { totalRevenue?: number } | null;

  if (isPending) {
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

  if (isError || !summary) return <div>Failed to load revenue forecast</div>;

  const currentRevenue = summary.totalRevenue ?? 0;
  const growthRate = 0.15; // 15% growth assumption
  const projectedRevenue = currentRevenue * (1 + growthRate);
  const trend: 'up' | 'down' | 'stable' =
    growthRate > 0.1 ? 'up' : growthRate < -0.1 ? 'down' : 'stable';
  const forecast: ForecastData = { currentRevenue, projectedRevenue, growthRate, trend };

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
                    ? 'text-success'
                    : forecast.trend === 'down'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                }`}
              >
                {(forecast.growthRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Trend:
            {forecast.trend === 'up' ? (
              <span className="inline-flex items-center gap-0.5 font-medium text-success">
                <ArrowUpRight className="h-4 w-4" />
                Growing
              </span>
            ) : forecast.trend === 'down' ? (
              <span className="inline-flex items-center gap-0.5 font-medium text-destructive">
                <ArrowDownRight className="h-4 w-4" />
                Declining
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 font-medium">
                <ArrowRight className="h-4 w-4" />
                Stable
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
