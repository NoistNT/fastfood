'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Button } from '@/modules/core/ui/button';
import { ChartSkeleton } from '@/modules/core/ui/skeleton-components';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/modules/core/ui/dropdown-menu';
import { useDashboardCharts } from '@/modules/core/hooks/use-api-cache';

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

const timePeriods = [
  { value: '1w', label: '1 Week' },
  { value: '2w', label: '2 Weeks' },
  { value: '30d', label: '30 Days' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export function RevenueChart() {
  const [period, setPeriod] = useState('30d');
  const { data, isPending, isError } = useDashboardCharts(period);
  const chartData = (data?.data as { revenueData?: ChartData[] } | undefined)?.revenueData ?? [];

  if (isPending) return <ChartSkeleton />;

  if (isError) return <div>Failed to load chart data</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[140px]"
            >
              {timePeriods.find((p) => p.value === period)?.label ?? 'Select period'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {timePeriods.map((p) => (
              <DropdownMenuItem
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={period === p.value ? 'bg-accent' : ''}
              >
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
          <Tooltip
            labelFormatter={(value) =>
              typeof value === 'string' || typeof value === 'number'
                ? new Date(value).toLocaleDateString()
                : ''
            }
            formatter={(value) =>
              value ? [`$${Number(value).toFixed(2)}`, 'Revenue'] : ['N/A', 'Revenue']
            }
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: '#8884d8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
