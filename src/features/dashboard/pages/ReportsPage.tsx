/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : ReportsPage.tsx
 * WHAT THIS FILE DOES : Renders analytics export options
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React from 'react';
import { BarChart3, FileText } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { SectionHeader } from '../components/shared';
import { exportRows } from '../utils/exportUtils';
import { capabilities } from '../constants/capabilities';
import type { Row } from '../types';

export const ReportsPage: React.FC = () => {
  const { data, error, isLoading } = useAdminData();

  if (error) {
    return (
      <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  }

  const reports: [string, Row[]][] = [
    [
      'Project Progress Gantt',
      data.projects.map(item => ({
        project: item.name,
        progress: item.progress,
        status: item.status,
      })),
    ],
    [
      'Financial Reconciliation',
      data.transactions.map(item => ({
        project: item.project,
        amount: item.amount,
        status: item.status,
      })),
    ],
    [
      'Supplier Performance',
      data.supplierQuotes.map(item => ({
        supplier: item.supplier,
        amount: item.amount,
        rating: item.rating,
      })),
    ],
    [
      'KYC Compliance',
      data.kycDocuments.map(item => ({
        user: item.userName,
        status: item.status,
        risk: item.risk,
      })),
    ],
  ];

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<BarChart3 size={20} />}
        title="Analytics & Reporting"
        subtitle="Generate PDF, Excel, CSV, compliance, financial, supplier, growth, revenue, and audit reports."
        capabilities={capabilities.reports}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {reports.map(([label, rows]) => (
          <div
            key={label}
            className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
          >
            <FileText className="mb-3 text-brand" size={20} />
            <h2 className="font-bold text-gray-900">{label}</h2>
            <p className="mt-1 text-xs text-gray-500">
              Export the full report dataset.
            </p>
            <div className="mt-4 flex gap-1">
              <button
                onClick={() => exportRows(label, rows, 'csv')}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-50"
              >
                CSV
              </button>
              <button
                onClick={() => exportRows(label, rows, 'xlsx')}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-50"
              >
                Excel
              </button>
              <button
                onClick={() => exportRows(label, rows, 'pdf')}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold hover:bg-gray-50"
              >
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
