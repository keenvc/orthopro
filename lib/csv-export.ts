/**
 * CSV Export Utility
 */

export function exportToCSV(data: any[], filename: string, columns?: { key: string; label: string }[]) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Determine columns
  let cols: { key: string; label: string }[];
  if (columns) {
    cols = columns;
  } else {
    // Auto-detect columns from first object
    cols = Object.keys(data[0]).map(key => ({ key, label: key }));
  }

  // Create CSV header
  const header = cols.map(col => escapeCSVValue(col.label)).join(',');

  // Create CSV rows
  const rows = data.map(row => {
    return cols.map(col => {
      const value = getNestedValue(row, col.key);
      return escapeCSVValue(value);
    }).join(',');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create and download file
  downloadCSV(csv, filename);
}

function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return '';
    }
  }
  return value;
}

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  let str = String(value);

  // Escape quotes and wrap in quotes if needed
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
