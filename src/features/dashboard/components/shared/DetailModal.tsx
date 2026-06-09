/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : DetailModal.tsx
 * WHAT THIS FILE DOES : Renders administrative details, keys, values, and attached files/licenses
 * PRINCIPLE APPLIED   : Single Responsibility / Interface Segregation
 * ============================================================================
 */

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { DetailModalState } from '../../types';
import { formatDate } from '../../../../data/adminTypes';

interface DetailModalProps {
  detail: DetailModalState;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ detail, onClose }) => {
  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-2xl md:max-w-3xl md:rounded-xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white p-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{detail.title}</h2>
            <p className="text-sm text-gray-500">{detail.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close detail modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {detail.fields.map(field => (
              <div
                key={field.label}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-[11px] font-bold uppercase text-gray-400">
                  {field.label}
                </p>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {field.value}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                Uploaded documents
              </h3>
              <span className="rounded-full bg-brand-light px-2 py-1 text-[11px] font-bold text-brand">
                {detail.documents.length} files
              </span>
            </div>
            {detail.documents.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {detail.documents.map(document => (
                  <div
                    key={document.id}
                    className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={document.url}
                        alt={document.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="font-bold text-gray-900">{document.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {document.fileType} | {document.size} |{' '}
                      {formatDate(document.uploadedAt)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Uploaded by {document.uploadedBy}
                    </p>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white"
                    >
                      Preview file <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                No uploaded documents are linked to this record yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
