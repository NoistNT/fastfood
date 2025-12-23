import { useTranslations } from 'next-intl';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { Badge } from '@/modules/core/ui/badge';

interface InventoryStatsData {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  outOfStockItems: number;
}

interface InventoryStatsProps {
  stats: InventoryStatsData;
}

export function InventoryStats({ stats }: InventoryStatsProps) {
  const t = useTranslations('Features.dashboard.inventory');
  const statItems = [
    {
      title: t('stats.totalItems'),
      value: stats.totalItems.toString(),
      icon: Package,
      description: t('stats.totalItemsDesc'),
    },
    {
      title: t('stats.lowStock'),
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      description: t('stats.lowStockDesc'),
      variant: 'secondary' as const,
    },
    {
      title: t('stats.outOfStock'),
      value: stats.outOfStockItems.toString(),
      icon: TrendingUp,
      description: t('stats.outOfStockDesc'),
      variant: 'destructive' as const,
    },
    {
      title: t('stats.totalValue'),
      value: `$${(stats.totalValue || 0).toFixed(2)}`,
      icon: DollarSign,
      description: t('stats.totalValueDesc'),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value}
              {stat.variant === 'secondary' && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs"
                >
                  {t('stats.lowStockBadge')}
                </Badge>
              )}
              {stat.variant === 'destructive' && (
                <Badge
                  variant="destructive"
                  className="ml-2 text-xs"
                >
                  {t('stats.outOfStockBadge')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
