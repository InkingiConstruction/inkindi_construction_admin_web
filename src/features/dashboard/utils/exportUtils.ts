/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : exportUtils.ts
 * WHAT THIS FILE DOES : Provides client-side helpers to export data rows as CSV, Excel, or HTML/PDF
 * PRINCIPLE APPLIED   : DRY / Single Responsibility
 * ============================================================================
 */

import type { Row } from '../types';

export const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const escapeCsv = (value: string | number | boolean) =>
  `"${String(value).replaceAll('"', '""')}"`;

export const exportRows = (label: string, rows: Row[], type: 'csv' | 'xlsx' | 'pdf') => {
  const safeLabel = label.toLowerCase().replaceAll(/\s+/g, '-');
  const headers = Object.keys(rows[0] ?? { notice: 'No data' });
  const values = rows.length ? rows : [{ notice: 'No data available' }];

  if (type === 'csv') {
    const csv = [
      headers.join(','),
      ...values.map(row =>
        headers.map(header => escapeCsv(row[header] ?? '')).join(',')
      ),
    ].join('\n');
    downloadFile(`${safeLabel}.csv`, csv, 'text/csv;charset=utf-8');
  }

  if (type === 'xlsx') {
    const table = `<table><thead><tr>${headers
      .map(header => `<th>${header}</th>`)
      .join('')}</tr></thead><tbody>${values
      .map(
        row =>
          `<tr>${headers
            .map(header => `<td>${row[header] ?? ''}</td>`)
            .join('')}</tr>`
      )
      .join('')}</tbody></table>`;
    downloadFile(`${safeLabel}.xls`, table, 'application/vnd.ms-excel;charset=utf-8');
  }

  if (type === 'pdf') {
    const html = `<html><head><title>${label}</title><style>body{font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style></head><body><h1>${label}</h1><p>Use browser print to save as PDF.</p><table><thead><tr>${headers
      .map(header => `<th>${header}</th>`)
      .join('')}</tr></thead><tbody>${values
      .map(
        row =>
          `<tr>${headers
            .map(header => `<td>${row[header] ?? ''}</td>`)
            .join('')}</tr>`
      )
      .join('')}</tbody></table></body></html>`;
    downloadFile(`${safeLabel}.html`, html, 'text/html;charset=utf-8');
  }
};
