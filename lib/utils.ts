import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(data: unknown[], filename: string, headers?: string[]) {
  if (data.length === 0) return;

  const firstRow = data[0] as Record<string, unknown>;
  const csvHeaders = headers ?? Object.keys(firstRow);
  const csvContent = [
    csvHeaders.join(','),
    ...data.map((row) => {
      const rowObj = row as Record<string, unknown>;
      return csvHeaders
        .map((header) => {
          const value = rowObj[header];
          // Escape commas and quotes
          const stringValue = String(value ?? '');
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',');
    }),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
