/**
 * ============================================================================
 * FILE NAME        : DataTable.tsx
 * WHAT THIS FILE DOES : Renders administrative data tables with batch selection,
 *                       pagination, filtering, export, and tooltip support
 * PRINCIPLE APPLIED   : Single Responsibility, DRY, KISS
 * ============================================================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { Row } from '../../types';
import { exportRows } from '../../utils/exportUtils';

interface DataTableProps {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
  exportRowsData: Row[];
  batchActions?: {
    onApprove?: (selectedIds: string[]) => Promise<void>;
    onReject?: (selectedIds: string[]) => Promise<void>;
    onDelete?: (selectedIds: string[]) => Promise<void>;
  };
  rowIds?: string[];
  enableBatchSelect?: boolean;
  tooltips?: Record<string, string>;
}

const PAGE_SIZE = 6;

export const DataTable: React.FC<DataTableProps> = ({
  title,
  headers,
  rows,
  exportRowsData,
  batchActions,
  rowIds = [],
  enableBatchSelect = false,
  tooltips = {},
}) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [actionInProgress, setActionInProgress] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  // Filter rows based on search query
  const filteredIndices = useMemo(() => {
    return rows.reduce<number[]>((acc, row, idx) => {
      const searchableText = row
        .map(cell => String(cell))
        .join(' ')
        .toLowerCase();
      if (searchableText.includes(query.toLowerCase())) {
        acc.push(idx);
      }
      return acc;
    }, []);
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredIndices.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  
  const visibleIndices = filteredIndices.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const visibleRows = visibleIndices.map(idx => rows[idx]);
  const visibleRowIds = visibleIndices.map(idx => rowIds[idx]);

  // Selection handlers
  const toggleSelectAll = useCallback(() => {
    if (selectedRows.size === visibleRowIds.length && visibleRowIds.length > 0) {
      const newSelected = new Set(selectedRows);
      visibleRowIds.forEach(id => newSelected.delete(id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      visibleRowIds.forEach(id => newSelected.add(id));
      setSelectedRows(newSelected);
    }
  }, [selectedRows, visibleRowIds]);

  const toggleSelectRow = useCallback((rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  }, [selectedRows]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  // Batch action handlers
  const handleBatchApprove = async () => {
    if (!batchActions?.onApprove || selectedRows.size === 0) return;
    setActionInProgress(true);
    try {
      await batchActions.onApprove(Array.from(selectedRows));
      clearSelection();
    } finally {
      setActionInProgress(false);
    }
  };

  const handleBatchReject = async () => {
    if (!batchActions?.onReject || selectedRows.size === 0) return;
    setActionInProgress(true);
    try {
      await batchActions.onReject(Array.from(selectedRows));
      clearSelection();
    } finally {
      setActionInProgress(false);
    }
  };

  const handleBatchDelete = async () => {
    if (!batchActions?.onDelete || selectedRows.size === 0) return;
    setActionInProgress(true);
    try {
      await batchActions.onDelete(Array.from(selectedRows));
      clearSelection();
    } finally {
      setActionInProgress(false);
    }
  };

  // Tooltip component
  const TooltipIcon: React.FC<{ content: string; label: string }> = ({ content, label }) => (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setTooltipVisible(label)}
        onMouseLeave={() => setTooltipVisible(null)}
        className="text-gray-400 hover:text-gray-600 transition"
        aria-label={`Info about ${label}`}
      >
        <Info size={14} />
      </button>
      {tooltipVisible === label && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-top-2">
          {content}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
        </div>
      )}
    </div>
  );

  const isAllSelected = visibleRowIds.length > 0 && 
    visibleRowIds.every(id => selectedRows.has(id));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header with Batch Actions Bar */}
      {(enableBatchSelect && selectedRows.size > 0) && (
        <div className="bg-brand-50 border-b border-brand-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
            <CheckSquare size={16} />
            <span>{selectedRows.size} item(s) selected</span>
          </div>
          <div className="flex gap-2">
            {batchActions?.onApprove && (
              <button
                onClick={handleBatchApprove}
                disabled={actionInProgress}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <CheckCircle size={14} />
                Approve All
              </button>
            )}
            {batchActions?.onReject && (
              <button
                onClick={handleBatchReject}
                disabled={actionInProgress}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
              >
                <XCircle size={14} />
                Reject All
              </button>
            )}
            {batchActions?.onDelete && (
              <button
                onClick={handleBatchDelete}
                disabled={actionInProgress}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
              >
                <Trash2 size={14} />
                Delete All
              </button>
            )}
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search and Export Bar */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            {title}
            {tooltips[title] && <TooltipIcon content={tooltips[title]} label={title} />}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredIndices.length} records • Page {safePage} of {totalPages}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search table..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-1">
            {[
              { icon: Download, onClick: () => exportRows(title, exportRowsData, 'csv'), label: 'Export CSV' },
              { icon: FileSpreadsheet, onClick: () => exportRows(title, exportRowsData, 'xlsx'), label: 'Export Excel' },
              { icon: FileText, onClick: () => exportRows(title, exportRowsData, 'pdf'), label: 'Export PDF' },
            ].map(({ icon: Icon, onClick, label }) => (
              <div key={label} className="relative group">
                <button
                  onClick={onClick}
                  className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 transition"
                  aria-label={label}
                >
                  <Icon size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
            <tr>
              {enableBatchSelect && (
                <th className="px-4 py-3 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-500 hover:text-brand-600 transition"
                    aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
                  >
                    {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
              )}
              {headers.map(header => (
                <th key={header} className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {header}
                    {tooltips[header] && <TooltipIcon content={tooltips[header]} label={header} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, idx) => {
              const rowId = visibleRowIds[idx];
              const isSelected = rowId ? selectedRows.has(rowId) : false;
              
              return (
                <tr
                  key={idx}
                  className={`border-t border-gray-50 transition hover:bg-gray-50/60 ${
                    isSelected ? 'bg-brand-50/30' : ''
                  }`}
                >
                  {enableBatchSelect && rowId && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelectRow(rowId)}
                        className="text-gray-400 hover:text-brand-600 transition"
                        aria-label={isSelected ? 'Deselect row' : 'Select row'}
                      >
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                  )}
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
            {visibleRows.length === 0 && (
              <tr className="border-t border-gray-50">
                <td
                  className="px-4 py-12 text-center text-sm text-gray-500"
                  colSpan={headers.length + (enableBatchSelect ? 1 : 0)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={32} className="text-gray-300" />
                    <p>No records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <button
          onClick={() => setPage(1)}
          disabled={safePage === 1}
          className="text-xs text-gray-500 disabled:opacity-40 hover:text-gray-700"
        >
          First
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(current => Math.max(1, current - 1))}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
            disabled={safePage === 1}
          >
            <ChevronLeft size={15} />
          </button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">{safePage}</span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm text-gray-500">{totalPages}</span>
          </div>
          <button
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
            disabled={safePage === totalPages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <button
          onClick={() => setPage(totalPages)}
          disabled={safePage === totalPages}
          className="text-xs text-gray-500 disabled:opacity-40 hover:text-gray-700"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default DataTable;