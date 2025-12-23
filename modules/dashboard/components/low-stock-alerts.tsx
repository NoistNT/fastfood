import { useTranslations } from 'next-intl';
import { AlertTriangle, Package } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { Button } from '@/modules/core/ui/button';
import { Badge } from '@/modules/core/ui/badge';

interface LowStockAlert {
  id: string;
  ingredientName: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
}

interface LowStockAlertsProps {
  alerts: LowStockAlert[];
}

export function LowStockAlerts({ alerts }: LowStockAlertsProps) {
  const t = useTranslations('Features.dashboard.inventory');
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('alerts.title')}
          </CardTitle>
          <CardDescription>{t('alerts.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('alerts.noAlerts')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {t('alerts.title')}
          <Badge
            variant="destructive"
            className="ml-auto"
          >
            {alerts.length}
          </Badge>
        </CardTitle>
        <CardDescription>{t('alerts.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5 border-destructive/20"
            >
              <div className="space-y-1">
                <p className="font-medium">{alert.ingredientName}</p>
                <p className="text-sm text-muted-foreground">
                  {t('alerts.currentStock')}: {alert.currentStock} {alert.unit} •
                  {t('alerts.minThreshold')}: {alert.minThreshold} {alert.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={alert.currentStock === 0 ? 'destructive' : 'secondary'}>
                  {alert.currentStock === 0 ? t('alerts.outOfStock') : t('alerts.lowStock')}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                >
                  {t('alerts.restock')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
