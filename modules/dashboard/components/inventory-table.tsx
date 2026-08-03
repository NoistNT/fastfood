'use client';

import { useTranslations } from 'next-intl';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Download } from 'lucide-react';

import { TableSkeleton } from '@/modules/core/ui/skeleton-components';
import { Button } from '@/modules/core/ui/button';
import { Input } from '@/modules/core/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/core/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/modules/core/ui/dropdown-menu';
import { Badge } from '@/modules/core/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/core/ui/card';
import { useInventory } from '@/modules/core/hooks/use-api-cache';
import { exportToCSV } from '@/lib/utils';

interface InventoryItem {
  id: string;
  ingredientName: string;
  quantity: number;
  minThreshold: number;
  unit: string;
  lastUpdated: string;
  status: 'normal' | 'low' | 'out';
}

export function InventoryTable() {
  const t = useTranslations('Features.dashboard.inventory');
  const { data, isPending, isError } = useInventory();
  const items: InventoryItem[] = ((data?.data ?? []) as InventoryItem[]).map((item) => {
    let status: 'normal' | 'low' | 'out' = 'normal';
    if (item.quantity === 0) {
      status = 'out';
    } else if (item.quantity <= item.minThreshold) {
      status = 'low';
    }
    return { ...item, status };
  });

  const handleExportCSV = () => {
    exportToCSV(items as unknown as Record<string, unknown>[], 'inventory.csv');
  };

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage your ingredient stock levels and thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton
            rows={5}
            columns={4}
          />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6 text-muted-foreground">Failed to load inventory</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('inventoryTable.title')}</CardTitle>
            <CardDescription>{t('inventoryTable.description')}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('inventoryTable.search')}
                className="pl-8 w-64"
              />
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('inventoryTable.addItem')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventoryTable.columns.ingredient')}</TableHead>
              <TableHead className="text-right">
                {t('inventoryTable.columns.currentStock')}
              </TableHead>
              <TableHead className="text-right">
                {t('inventoryTable.columns.minThreshold')}
              </TableHead>
              <TableHead>{t('inventoryTable.columns.unit')}</TableHead>
              <TableHead>{t('inventoryTable.columns.status')}</TableHead>
              <TableHead>{t('inventoryTable.columns.lastUpdated')}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.ingredientName}</TableCell>
                <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                <TableCell className="text-right font-mono">{item.minThreshold}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === 'out'
                        ? 'destructive'
                        : item.status === 'low'
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {item.status === 'out'
                      ? t('inventoryTable.status.outOfStock')
                      : item.status === 'low'
                        ? t('inventoryTable.status.lowStock')
                        : t('inventoryTable.status.inStock')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(item.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('inventoryTable.actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('inventoryTable.actions.adjustStock')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('inventoryTable.actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
