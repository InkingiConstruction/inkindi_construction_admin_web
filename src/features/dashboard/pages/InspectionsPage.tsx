/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : InspectionsPage.tsx
 * WHAT THIS FILE DOES : Renders quality controls, supervisor checklists, and reviews inspections
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatDate } from '../../../data/adminTypes';
import {
  SectionHeader,
  DataTable,
  Badge,
  ViewButton,
  DetailModal,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

export const InspectionsPage: React.FC = () => {
  const { data, error, isLoading } = useAdminData();
  const [detail, setDetail] = useState<DetailModalState>(null);

  const getDocuments = (entityType: string, entityId: string) => {
    if (!data) return [];
    return data.uploadedDocuments.filter(
      document =>
        document.entityType === entityType && document.entityId === entityId
    );
  };

  const openDetail = (
    title: string,
    subtitle: string,
    fields: { label: string; value: React.ReactNode }[],
    documents: any[]
  ) => {
    setDetail({ title, subtitle, fields, documents });
  };

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

  const rows = data.inspections.map(item => ({
    ...item,
    createdAt: formatDate(item.createdAt),
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Wrench size={20} />}
        title="Inspection & Quality Control"
        subtitle="Review supervisor checklists, photos, signatures, GPS check-ins, and quality ratings."
        capabilities={capabilities.inspections}
      />

      <DataTable
        title="Inspection Reports"
        headers={[
          'Inspection',
          'Project',
          'Supervisor',
          'Checklist',
          'Quality',
          'GPS',
          'Action',
        ]}
        exportRowsData={rows}
        rows={data.inspections.map(item => [
          item.id,
          item.project,
          item.supervisor,
          item.checklist,
          `${item.qualityRating}/5`,
          <Badge key={`gps-${item.id}`} value={item.gpsCheckIn} />,
          <ViewButton
            key={`view-${item.id}`}
            onClick={() =>
              openDetail(
                `Inspection: ${item.id}`,
                'Supervisor inspection report, checklist, signature, and photo files.',
                [
                  { label: 'Project', value: item.project },
                  { label: 'Supervisor', value: item.supervisor },
                  { label: 'Checklist', value: item.checklist },
                  { label: 'Quality rating', value: `${item.qualityRating}/5` },
                  {
                    label: 'GPS check-in',
                    value: <Badge value={item.gpsCheckIn} />,
                  },
                  { label: 'Signature', value: <Badge value={item.signature} /> },
                ],
                getDocuments('inspection', item.id)
              )
            }
          />,
        ])}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default InspectionsPage;
