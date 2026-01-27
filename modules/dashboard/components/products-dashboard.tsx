'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Package } from 'lucide-react';

import { Button } from '@/modules/core/ui/button';
import { DataTable } from '@/modules/core/components/data-table';
import { ProductFormDialog } from '@/modules/dashboard/components/product-form-dialog';
import { createColumns } from '@/modules/dashboard/components/products-columns';
import { InventoryTable } from '@/modules/dashboard/components/inventory-table';
import { InventoryStats } from '@/modules/dashboard/components/inventory-stats';
import { LowStockAlerts } from '@/modules/dashboard/components/low-stock-alerts';
import { exportToCSV } from '@/lib/utils';
import { TableSkeleton } from '@/modules/core/ui/skeleton-components';

export type ProductWithIngredients = {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  available: boolean;
  ingredients: string[];
  ingredientIds: number[];
};

interface InventoryStatsData {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  outOfStockItems: number;
}

interface LowStockAlert {
  id: string;
  ingredientName: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
}

interface ProductsDashboardProps {
  initialProducts: ProductWithIngredients[];
  inventoryStats: InventoryStatsData;
  lowStockAlerts: LowStockAlert[];
}

export function ProductsDashboard({
  initialProducts,
  inventoryStats,
  lowStockAlerts,
}: ProductsDashboardProps) {
  const t = useTranslations('Features.dashboard.products');
  const tTable = useTranslations('Common.table');
  const [products, setProducts] = useState<ProductWithIngredients[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithIngredients | undefined>();
  const [activeTab, setActiveTab] = useState<'products' | 'inventory'>('products');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (_error) {
      // TODO: Add proper error handling
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchProducts();
  };

  const handleEditSuccess = () => {
    fetchProducts();
    setEditingProduct(undefined);
  };

  const handleExportProductsCSV = () => {
    exportToCSV(products, 'products.csv');
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <TableSkeleton
          rows={3}
          columns={4}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-medium tracking-tighter">
          {activeTab === 'products' ? t('title') : t('inventoryTitle')}
        </h1>
        {activeTab === 'products' && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addProduct')}
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('products')}
          className="flex-1"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('productsTab')}
        </Button>
        <Button
          variant={activeTab === 'inventory' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('inventory')}
          className="flex-1"
        >
          <Package className="mr-2 h-4 w-4" />
          {t('inventoryTab')}
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-primary-foreground px-2 py-0">
          <DataTable
            columns={createColumns(setEditingProduct, tTable)}
            data={products}
            onExportCSV={handleExportProductsCSV}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <InventoryStats stats={inventoryStats} />
          <LowStockAlerts alerts={lowStockAlerts} />
          <div className="overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-primary-foreground">
            <InventoryTable />
          </div>
        </div>
      )}

      <ProductFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <ProductFormDialog
        open={!!editingProduct}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(undefined);
        }}
        product={editingProduct}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
