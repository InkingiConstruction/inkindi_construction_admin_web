/**
 * Decorative admin dashboard preview for the login marketing panel.
 */
import React from 'react';

const AdminDashboardPreview: React.FC = () => (
  <div
    className="mt-8 w-full overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl shadow-black/20"
    aria-hidden="true"
  >
    <div className="flex min-h-[280px]">
      {/* Sidebar */}
      <div className="w-[72px] shrink-0 border-r border-gray-100 bg-gray-50 p-2">
        <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
          <div className="h-4 w-4 rounded bg-brand" />
        </div>
        {['Overview', 'KYC', 'Users', 'Projects', 'Escrow'].map((item, index) => (
          <div
            key={item}
            className={`mb-1.5 rounded-md px-2 py-1.5 text-[7px] font-semibold ${
              index === 1 ? 'bg-brand text-white' : 'text-gray-400'
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-gray-900">KYC Review Queue</p>
            <p className="text-[7px] text-gray-400">Identity & compliance oversight</p>
          </div>
          <div className="h-6 w-20 rounded-md bg-brand/10" />
        </div>

        <div className="mb-3 grid grid-cols-4 gap-1.5">
          {[
            { label: 'Users', value: '248' },
            { label: 'Pending KYC', value: '12' },
            { label: 'Projects', value: '86' },
            { label: 'Escrow', value: 'RWF 4.2M' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg border border-gray-100 bg-gray-50 p-1.5">
              <p className="text-[8px] font-black text-gray-900">{stat.value}</p>
              <p className="text-[6px] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-100">
          <div className="grid grid-cols-5 gap-1 border-b border-gray-100 bg-gray-50 px-2 py-1 text-[6px] font-bold uppercase text-gray-400">
            <span className="col-span-2">Applicant</span>
            <span>Risk</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {[
            { name: 'Jean M.', risk: 'Low', status: 'Pending' },
            { name: 'Alice K.', risk: 'Med', status: 'Review' },
            { name: 'Paul N.', risk: 'Low', status: 'Approved' },
          ].map(row => (
            <div key={row.name} className="grid grid-cols-5 items-center gap-1 border-b border-gray-50 px-2 py-1.5 last:border-0">
              <span className="col-span-2 text-[7px] font-semibold text-gray-800">{row.name}</span>
              <span className="rounded-full bg-amber-50 px-1 py-0.5 text-[6px] font-bold text-amber-700">{row.risk}</span>
              <span className="rounded-full bg-emerald-50 px-1 py-0.5 text-[6px] font-bold text-emerald-700">{row.status}</span>
              <span className="h-3 w-6 rounded bg-gray-100" />
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-1.5">
          <div className="h-12 flex-1 rounded-lg bg-brand/5 p-2">
            <p className="text-[6px] font-bold text-gray-500">Escrow releases</p>
            <div className="mt-1 flex h-6 items-end gap-0.5">
              {[40, 65, 45, 80, 55, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-brand/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="h-12 w-16 rounded-lg bg-gray-50 p-2">
            <p className="text-[6px] font-bold text-gray-500">Disputes</p>
            <div className="relative mx-auto mt-1 h-6 w-6">
              <div className="absolute inset-0 rounded-full border-[3px] border-brand/20" />
              <div className="absolute inset-0 rounded-full border-[3px] border-brand border-r-transparent border-b-transparent rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboardPreview;
