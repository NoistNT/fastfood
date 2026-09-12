'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { ChartSkeleton } from '@/modules/core/ui/skeleton-components';
import { useDashboardCharts } from '@/modules/core/hooks/use-api-cache';

interface StatusData {
  status: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function OrdersStatusChart() {
  const { data, isPending, isError } = useDashboardCharts('30d');
  const statusData = (data?.data as { statusData?: StatusData[] } | undefined)?.statusData ?? [];
  const chartData = statusData.map((item) => ({ name: item.status, value: item.count }));

  if (isPending) return <ChartSkeleton />;

  if (isError) return <div>Failed to load status data</div>;

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
