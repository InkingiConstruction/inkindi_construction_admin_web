import React, { useState } from 'react';
import { Briefcase, Loader2 } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { formatRwf } from '../../../data/adminTypes';
import { api } from '../../../lib/api';
import {
  SectionHeader,
  DataTable,
  Badge,
  ActionsMenuButton,
  ActionsMenuPanel,
  DetailModal,
  Avatar,
} from '../components/shared';
import { capabilities } from '../constants/capabilities';
import type { DetailModalState } from '../types';

export const ProjectsPage: React.FC = () => {
  const { data, error, isLoading, refreshData } = useAdminData();
  const [detail, setDetail] = useState<DetailModalState>(null);
  const [actionBusy, setActionBusy] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const toggleMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    menuId: string,
    menuWidth = 340,
    estimatedHeight = 280
  ) => {
    event.stopPropagation();

    if (activeMenu === menuId) {
      setActiveMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)
    );
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openBelow = spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove;
    const top = openBelow
      ? Math.min(rect.bottom + 8, window.innerHeight - estimatedHeight - 8)
      : Math.max(8, rect.top - estimatedHeight - 8);

    setMenuPosition({ top, left });
    setActiveMenu(menuId);
  };

  const closeMenu = () => setActiveMenu(null);

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

  const runAdminAction = async (
    key: string,
    action: () => Promise<unknown>,
    success: string
  ) => {
    setActionBusy(key);
    setActionError('');
    setActionMessage('');

    try {
      await action();
      setActionMessage(success);
      await refreshData();
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message || err?.message || 'Action failed'
      );
    } finally {
      setActionBusy('');
    }
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

  const rows = data.projects.map(item => ({
    project: item.name,
    client: item.client,
    engineer: item.engineer,
    supervisor: item.supervisor,
    location: item.location,
    budget: item.budget,
    progress: item.progress,
    status: item.status,
  }));

  return (
    <div className="space-y-5 pb-12">
      <SectionHeader
        icon={<Briefcase size={20} />}
        title="Project Portfolio Oversight"
        subtitle="Audit project timelines, assignments, budgets, documents, photos, Gantt state, and contractor performance."
        capabilities={capabilities.projects}
      />
      {actionError && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {actionMessage}
        </div>
      )}

      <DataTable
        title="Project Portfolio"
        headers={[
          'Project',
          'Team',
          'Location',
          'Budget',
          'Progress',
          'Status',
          'Actions',
        ]}
        exportRowsData={rows}
        rows={data.projects.map(item => [
          <div key={`project-col-${item.id}`} className="flex items-center gap-3">
            <Avatar name={item.name} type="project" />
            <div className="flex flex-col">
              <strong className="text-gray-900">{item.name}</strong>
              <span className="text-xs text-gray-500">{item.client}</span>
            </div>
          </div>,
          <div key={`team-${item.id}`}>
            <p>{item.client}</p>
            <p className="text-xs text-gray-500">
              {item.engineer} / {item.supervisor}
            </p>
          </div>,
          item.location,
          formatRwf(item.budget),
          `${item.progress}%`,
          <Badge key={`status-${item.id}`} value={item.status} />,
          <div key={`actions-${item.id}`} className="relative flex justify-center">
            <ActionsMenuButton
              menuId={`project-${item.id}`}
              isOpen={activeMenu === `project-${item.id}`}
              onToggle={event => toggleMenu(event, `project-${item.id}`, 340, 280)}
            />
            <ActionsMenuPanel
              menuId={`project-${item.id}`}
              isOpen={activeMenu === `project-${item.id}`}
              position={menuPosition}
              onClose={closeMenu}
              widthClass="w-[340px] p-4"
            >
              <button
                onClick={() => {
                  closeMenu();
                  openDetail(
                    `Project: ${item.name}`,
                    'Project documents, photos, ownership, budget, and status details.',
                    [
                      { label: 'Client', value: item.client },
                      { label: 'Engineer', value: item.engineer },
                      { label: 'Supervisor', value: item.supervisor },
                      { label: 'Location', value: item.location },
                      { label: 'Budget', value: formatRwf(item.budget) },
                      { label: 'Progress', value: `${item.progress}%` },
                    ],
                    getDocuments('project', item.id)
                  );
                }}
                className="mb-3 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-left text-base font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100"
              >
                <span>View Documents</span>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  openDetail(
                    `Gantt: ${item.name}`,
                    'Milestone progress loaded from the backend project timeline.',
                    [
                      { label: 'Project', value: item.name },
                      { label: 'Milestones', value: item.milestones },
                      { label: 'Progress', value: `${item.progress}%` },
                      { label: 'Status', value: <Badge value={item.status} /> },
                    ],
                    getDocuments('project', item.id)
                  );
                }}
                className="mb-3 flex w-full items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-base font-bold text-blue-700 transition-all duration-200 hover:bg-blue-100"
              >
                <span>Open Gantt Timeline</span>
              </button>

              <button
                disabled={actionBusy === `project-override-${item.id}`}
                onClick={async () => {
                  await runAdminAction(
                    `project-override-${item.id}`,
                    () =>
                      api.patch(`/api/v1/projects/${item.id}/status`, {
                        status: item.status === 'PAUSED' ? 'active' : 'paused',
                      }),
                    'Project status overridden successfully.'
                  );
                  closeMenu();
                }}
                className="flex w-full items-center justify-between rounded-2xl bg-amber-100 px-5 py-4 text-left text-base font-bold text-amber-800 transition-all duration-200 hover:bg-amber-200 disabled:opacity-50"
              >
                <span>
                  {item.status === 'PAUSED' ? 'Resume Project' : 'Pause Project'}
                </span>
                {actionBusy === `project-override-${item.id}` && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </button>
            </ActionsMenuPanel>
          </div>,
        ])}
      />
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default ProjectsPage;
