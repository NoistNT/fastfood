'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { ChartSkeleton } from '@/modules/core/ui/skeleton-components';

interface StatusData {
  status: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function OrdersStatusChart() {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/charts?period=30d');
      if (!response.ok) {
        throw new Error('Failed to fetch status data');
      }
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? 'Failed to fetch status data');
      }

      setData(result.data.statusData ?? []);
    } catch (error) {
      console.error('Error fetching status data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <PieChart>
        <Pie
          data={data.map((item) => ({ name: item.status, value: item.count }))}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
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
