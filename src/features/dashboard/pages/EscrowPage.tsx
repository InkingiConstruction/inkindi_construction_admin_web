import React, { useState, useMemo } from 'react';
import { Landmark, Lock, FileText, Scale, CheckCircle } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatRwf, formatDate } from '../../../data/adminTypes';
import {
  SectionHeader,
  DataTable,
  Badge,
  StatTile,
  ViewButton,
  DetailModal,
  Avatar,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

export const EscrowPage: React.FC = () => {
  const { data, error, isLoading } = useAdminData();
  const [detail, setDetail] = useState<DetailModalState>(null);

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      escrowTotal: data.projects.reduce(
        (total, item) => total + item.escrowBalance,
        0
      ),
      openDisputes: data.disputes.filter(item => item.status !== 'RESOLVED')
        .length,
    };
  }, [data]);

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

  if (isLoading || !data || !stats) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  }

  const rows = data.transactions.map(item => ({
    id: item.id,
    project: item.project,
    type: item.type,
    party: item.party,
    amount: item.amount,
    status: item.status,
    date: formatDate(item.createdAt),
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Landmark size={20} />}
        title="Financial & Escrow Oversight"
        subtitle="Reconcile deposits, payment releases, fee configuration, provider health, and emergency overrides."
        capabilities={capabilities.escrow}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Escrow Held"
          value={formatRwf(stats.escrowTotal)}
          icon={<Lock size={18} />}
        />
        <StatTile
          label="Transactions"
          value={data.transactions.length}
          icon={<FileText size={18} />}
        />
        <StatTile
          label="Open Disputes"
          value={stats.openDisputes}
          icon={<Scale size={18} />}
        />
        <StatTile
          label="Provider Records"
          value={data.transactions.length > 0 ? 'Loaded' : 'No records'}
          icon={<CheckCircle size={18} />}
        />
      </div>

      <DataTable
        title="Append-only Transaction History"
        headers={[
          'Transaction',
          'Project',
          'Type',
          'Party',
          'Amount',
          'Status',
          'Action',
        ]}
        exportRowsData={rows}
        rows={data.transactions.map(item => [
          <div key={`txn-col-${item.id}`} className="flex items-center gap-3">
            <Avatar name={item.project} type="escrow" />
            <div className="flex flex-col">
              <strong className="text-gray-900">{item.id}</strong>
              <span className="text-xs text-gray-500">{item.party}</span>
            </div>
          </div>,
          item.project,
          item.type.replaceAll('_', ' '),
          item.party,
          formatRwf(item.amount),
          <Badge key={`status-${item.id}`} value={item.status} />,
          <ViewButton
            key={`action-${item.id}`}
            onClick={() =>
              openDetail(
                `Transaction: ${item.id}`,
                'Append-only transaction record for reconciliation review.',
                [
                  { label: 'Project', value: item.project },
                  { label: 'Type', value: item.type.replaceAll('_', ' ') },
                  { label: 'Party', value: item.party },
                  { label: 'Amount', value: formatRwf(item.amount) },
                  { label: 'Status', value: <Badge value={item.status} /> },
                  { label: 'Date', value: formatDate(item.createdAt) },
                ],
                []
              )
            }
          />,
        ])}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default EscrowPage;
