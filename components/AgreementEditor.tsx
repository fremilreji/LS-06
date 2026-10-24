'use client';

import React, { useState } from 'react';
import { AgreementDraft, DraftClause, DraftStatus } from '@/types/agreement';
import { exportDraftToPdf } from '@/lib/agreement/exportPdf';
import { 
  FileDown, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  ShieldCheck, 
  History, 
  Quote, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  Sparkles
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

interface AgreementEditorProps {
  draft: AgreementDraft;
  onUpdateDraft: (updated: AgreementDraft) => void;
  onSaveNewVersion?: (summary: string) => void;
}

export default function AgreementEditor({
  draft,
  onUpdateDraft,
  onSaveNewVersion,
}: AgreementEditorProps) {
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState<string>('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const startEditClause = (clause: DraftClause) => {
    setEditingClauseId(clause.id);
    setEditedBody(clause.body);
  };

  const saveClauseEdit = (clauseId: string) => {
    const updatedClauses = draft.clauses.map(c => {
      if (c.id === clauseId) {
        return {
          ...c,
          body: editedBody,
          userEdited: true,
          needsConfirmation: editedBody.includes('[Needs confirmation]') || editedBody.includes('[Unspecified]'),
        };
      }
      return c;
    });

    onUpdateDraft({
      ...draft,
      clauses: updatedClauses,
      updatedAt: new Date().toISOString(),
    });

    setEditingClauseId(null);
  };

  const toggleClauseConfirmation = (clauseId: string) => {
    const updatedClauses = draft.clauses.map(c => {
      if (c.id === clauseId) {
        return {
          ...c,
          needsConfirmation: !c.needsConfirmation,
        };
      }
      return c;
    });

    onUpdateDraft({
      ...draft,
      clauses: updatedClauses,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStatusChange = (newStatus: DraftStatus) => {
    onUpdateDraft({
      ...draft,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      bothPartiesConfirmed: newStatus === 'PARTY_CONFIRMED',
    });
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = exportDraftToPdf(draft);
      const safeFilename = `${draft.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${draft.version}.pdf`;
      doc.save(safeFilename);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('PDF generation encountered an issue. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyDraftText = () => {
    const fullText = [
      `DEALPROOF AI — AGREEMENT DRAFT (v${draft.version})`,
      `Title: ${draft.title}`,
      `Status: ${draft.status}`,
      `Generated: ${new Date(draft.updatedAt).toLocaleString()}`,
      `SHA-256 Digest: ${draft.tamperEvidenceHash}`,
      `\n${LEGAL_DISCLAIMER}\n`,
      '----------------------------------------',
      ...draft.clauses.map(c => `${c.clauseNumber}. ${c.title}${c.needsConfirmation ? ' [NEEDS CONFIRMATION]' : ''}\n${c.body}`),
    ].join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleCommitNewVersion = () => {
    if (!versionNote.trim()) {
      alert('Please enter a brief note explaining what changed.');
      return;
    }
    if (onSaveNewVersion) {
      onSaveNewVersion(versionNote);
    }
    setShowVersionModal(false);
    setVersionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Editor Top Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60">
                v{draft.version}.0
              </span>

              {/* Status Selector */}
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-slate-400">Review Status:</span>
                <select
                  value={draft.status}
                  onChange={e => handleStatusChange(e.target.value as DraftStatus)}
                  className="bg-slate-950 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="DRAFT_NEEDS_REVIEW">Draft: Needs Review</option>
                  <option value="READY_FOR_PARTY_REVIEW">Ready for Counterparty Review</option>
                  <option value="PARTY_CONFIRMED">Parties Confirmed (Operational)</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mt-1.5">{draft.title}</h3>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleCopyDraftText}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedDraft ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Text</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {onSaveNewVersion && (
              <button
                type="button"
                onClick={() => setShowVersionModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>Save New Version</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Cryptographic Hash Banner */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Tamper-Evident SHA-256 Digest:</span>
            <code className="bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 border border-slate-800">
              {draft.tamperEvidenceHash}
            </code>
          </div>
          <span className="text-[11px] text-slate-500">
            Updated: {new Date(draft.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Prominent Statutory Legal Disclaimer */}
      <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-100">Draft Disclaimer:</strong> {LEGAL_DISCLAIMER}
        </div>
      </div>

      {/* Clauses List */}
      <div className="space-y-4">
        {draft.clauses.map(clause => {
          const isEditing = editingClauseId === clause.id;

          return (
            <div
              key={clause.id}
              className={`bg-slate-900/90 border rounded-xl p-5 transition-all ${
                clause.needsConfirmation
                  ? 'border-amber-900/50 shadow-sm'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                    {clause.clauseNumber}
                  </span>
                  <h4 className="text-sm font-bold text-white">{clause.title}</h4>

                  {clause.needsConfirmation ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Needs Confirmation
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Confirmed by User
                    </span>
                  )}

                  {clause.userEdited && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">
                      Edited
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleClauseConfirmation(clause.id)}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    {clause.needsConfirmation ? 'Mark Confirmed' : 'Flag Question'}
                  </button>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEditClause(clause)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Clause Body */}
              <div className="mt-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      rows={5}
                      value={editedBody}
                      onChange={e => setEditedBody(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-500/70 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-400 leading-relaxed"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingClauseId(null)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveClauseEdit(clause.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Clause</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {clause.body}
                  </p>
                )}
              </div>

              {/* Supporting Conversation Excerpt */}
              {clause.supportingExcerpt && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-slate-400 italic">
                  <Quote className="w-3 h-3 shrink-0 text-blue-400 mt-0.5" />
                  <span>
                    Source Excerpt: &ldquo;{clause.supportingExcerpt}&rdquo;
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Save Version v{draft.version + 1}.0</h4>
                <p className="text-xs text-slate-400">
                  Record an immutable snapshot and recompute the cryptographic hash.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Summary of Changes Made:
              </label>
              <textarea
                rows={3}
                value={versionNote}
                onChange={e => setVersionNote(e.target.value)}
                placeholder="e.g., Confirmed Party GST details and updated delivery window to 7 business days"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitNewVersion}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
