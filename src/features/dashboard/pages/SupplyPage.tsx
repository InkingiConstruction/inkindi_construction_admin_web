import React, { useState } from 'react';
import { Truck } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatRwf, formatDate } from '../../../data/adminTypes';
import {
  SectionHeader,
  DataTable,
  Badge,
  ViewButton,
  DetailModal,
  Avatar,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

export const SupplyPage: React.FC = () => {
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

  const exportRowsData = [
    ...data.rfqs.map(item => ({
      type: 'RFQ',
      id: item.id,
      project: item.project,
      supplier: '',
      material: item.material,
      status: item.status,
    })),
    ...data.deliveries.map(item => ({
      type: 'Delivery',
      id: item.id,
      project: item.project,
      supplier: item.supplier,
      material: item.material,
      status: item.status,
    })),
  ];

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Truck size={20} />}
        title="Supply Chain Oversight"
        subtitle="Monitor RFQs, quotes, purchase orders, deliveries, GPS confirmations, and supplier compliance."
        capabilities={capabilities.supply}
      />

      <DataTable
        title="RFQs & Supplier Quotes"
        headers={[
          'ID',
          'Project/RFQ',
          'Material/Supplier',
          'Quotes/Amount',
          'Status',
          'Due/Rating',
        ]}
        exportRowsData={exportRowsData}
        rows={[
          ...data.rfqs.map(item => [
            item.id,
            <div key={`rfq-col-${item.id}`} className="flex items-center gap-3">
              <Avatar name={item.project} type="supplier" />
              <div className="flex flex-col">
                <strong className="text-gray-900">{item.project}</strong>
                <span className="text-xs text-gray-500">RFQ Request</span>
              </div>
            </div>,
            item.material,
            item.quotes,
            <Badge key={`rfq-status-${item.id}`} value={item.status} />,
            <ViewButton
              key={`rfq-view-${item.id}`}
              onClick={() =>
                openDetail(
                  `RFQ: ${item.id}`,
                  'Request for quote and supplier response overview.',
                  [
                    { label: 'Project', value: item.project },
                    { label: 'Material', value: item.material },
                    { label: 'Created by', value: item.createdBy },
                    { label: 'Quotes', value: item.quotes },
                    { label: 'Status', value: <Badge value={item.status} /> },
                    { label: 'Deadline', value: formatDate(item.deadline) },
                  ],
                  []
                )
              }
            />,
          ]),
          ...data.supplierQuotes.map(item => [
            item.id,
            <div key={`quote-col-${item.id}`} className="flex items-center gap-3">
              <Avatar name={item.supplier} type="supplier" />
              <div className="flex flex-col">
                <strong className="text-gray-900">{item.supplier}</strong>
                <span className="text-xs text-gray-500">Quote Response</span>
              </div>
            </div>,
            item.supplier,
            formatRwf(item.amount),
            <Badge key={`quote-status-${item.id}`} value={item.status} />,
            <ViewButton
              key={`quote-view-${item.id}`}
              onClick={() =>
                openDetail(
                  `Quote: ${item.id}`,
                  'Supplier quote details for procurement review.',
                  [
                    { label: 'RFQ', value: item.rfqId },
                    { label: 'Supplier', value: item.supplier },
                    { label: 'Amount', value: formatRwf(item.amount) },
                    { label: 'Delivery days', value: item.deliveryDays },
                    { label: 'Rating', value: `${item.rating} stars` },
                    { label: 'Status', value: <Badge value={item.status} /> },
                  ],
                  data.uploadedDocuments.filter(
                    document => document.uploadedBy === item.supplier
                  )
                )
              }
            />,
          ]),
        ]}
      />

      <DataTable
        title="Delivery Tracking"
        headers={[
          'Delivery',
          'Project',
          'Supplier',
          'Material',
          'GPS',
          'Distance',
          'Action',
        ]}
        exportRowsData={data.deliveries.map(item => ({
          ...item,
          eta: formatDate(item.eta),
        }))}
        rows={data.deliveries.map(item => [
          <div key={`del-col-${item.id}`} className="flex items-center gap-3">
            <Avatar name={item.project} type="supplier" />
            <div className="flex flex-col">
              <strong className="text-gray-900">{item.id}</strong>
              <span className="text-xs text-gray-500">{item.supplier}</span>
            </div>
          </div>,
          item.project,
          item.supplier,
          item.material,
          <Badge key={`gps-${item.id}`} value={item.gpsStatus} />,
          `${item.distanceMeters}m`,
          <ViewButton
            key={`delivery-view-${item.id}`}
            onClick={() =>
              openDetail(
                `Delivery: ${item.id}`,
                'Delivery tracking details and proof of delivery files.',
                [
                  { label: 'Project', value: item.project },
                  { label: 'Supplier', value: item.supplier },
                  { label: 'Material', value: item.material },
                  { label: 'GPS status', value: <Badge value={item.gpsStatus} /> },
                  { label: 'Distance', value: `${item.distanceMeters}m` },
                  { label: 'ETA', value: formatDate(item.eta) },
                ],
                getDocuments('delivery', item.id)
              )
            }
          />,
        ])}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default SupplyPage;
