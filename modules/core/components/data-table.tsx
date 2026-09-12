'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnVisibilityState,
  RowData,
  SortingState,
} from '@tanstack/react-table';
import type { DataTableFeatures } from './data-table-features';

import { useState } from 'react';
import { flexRender, useTable } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/core/ui/table';
import { Input } from '@/modules/core/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/modules/core/ui/dropdown-menu';
import { Button } from '@/modules/core/ui/button';

import { dataTableFeatures } from './data-table-features';

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  searchColumn?: string;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchColumn,
  onExportCSV,
  onExportPDF,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div>
      <div className="flex items-center py-4">
        {searchColumn && table.getColumn(searchColumn) && (
          <Input
            placeholder={`Filter ${searchColumn}...
`}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        )}
        <div className="ml-auto flex gap-2">
          {onExportCSV && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
            >
              Export CSV
            </Button>
          )}
          {onExportPDF && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
            >
              Export PDF
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
