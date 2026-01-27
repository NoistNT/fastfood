'use client';

import type { ColumnDef } from '@tanstack/react-table';

import Link from 'next/link';

import { DataTableColumnHeader } from '@/modules/core/components/data-table-column-header';
import { ProductActionsCell } from '@/modules/dashboard/components/product-actions-cell';
import { ProductAvailabilityBadge } from '@/modules/dashboard/components/product-availability-badge';

type ProductWithIngredients = {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  imageUrl: string;
  ingredients: string[];
  ingredientIds: number[];
};

export const createColumns = (
  onEdit: (product: ProductWithIngredients) => void,
  tTable?: (key: string) => string
): ColumnDef<ProductWithIngredients>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={tTable ? tTable('columns.name') : 'Name'}
      />
    ),
    cell: ({ row }) => {
      const name: string = row.getValue('name');
      const productId = row.original.id;
      return (
        <Link
          href={`/products/${productId}`}
          className="font-medium text-primary hover:text-primary/80 hover:underline"
        >
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={tTable ? tTable('columns.description') : 'Description'}
      />
    ),
    cell: ({ row }) => {
      const description: string = row.getValue('description');
      return <span className="text-muted-foreground text-sm max-w-xs truncate">{description}</span>;
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={tTable ? tTable('columns.price') : 'Price'}
      />
    ),
    cell: ({ row }) => {
      const price: string = row.getValue('price');
      return <span className="font-medium">${price}</span>;
    },
  },
  {
    accessorKey: 'ingredients',
    header: 'Ingredients',
    cell: ({ row }) => {
      const ingredients: string[] = row.getValue('ingredients');
      return (
        <div className="flex flex-wrap gap-1">
          {ingredients.slice(0, 2).map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs"
            >
              {ingredient}
            </span>
          ))}
          {ingredients.length > 2 && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
              +{ingredients.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'available',
    header: tTable ? tTable('columns.status') : 'Status',
    cell: ({ row }) => {
      const available: boolean = row.getValue('available');
      return <ProductAvailabilityBadge available={available} />;
    },
  },
  {
    id: 'actions',
    header: tTable ? tTable('columns.actions') : 'Actions',
    cell: ({ row }) => (
      <ProductActionsCell
        product={row.original}
        onEdit={onEdit}
      />
    ),
  },
];
