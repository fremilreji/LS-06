'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AgreementDraft, DraftStatus } from '@/types/agreement';
import { DraftStore } from '@/lib/storage/draftStore';
import { exportDraftToPdf } from '@/lib/agreement/exportPdf';
import { useAuth } from '@/lib/firebase/authContext';
import { FirestoreDraftService } from '@/lib/firebase/draftService';
import { 
  FileText, 
  BookmarkCheck, 
  PlusCircle, 
  FileDown, 
  Trash2, 
  Lock, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Cloud,
  HardDrive
} from 'lucide-react';
import AgreementEditor from '@/components/AgreementEditor';

export default function SavedDraftsPage() {
  const [drafts, setDrafts] = useState<AgreementDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<AgreementDraft | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isFirebaseActive } = useAuth();

  useEffect(() => {
    async function loadData() {
      // 1. Load from local store
      const localDrafts = DraftStore.getAll();
      let combined = [...localDrafts];

      // 2. If Firebase user logged in, fetch from Firestore and merge
      if (user && isFirebaseActive) {
        try {
          const remoteDrafts = await FirestoreDraftService.getUserDrafts(user.uid);
          const map = new Map<string, AgreementDraft>();
          localDrafts.forEach(d => map.set(d.id, d));
          remoteDrafts.forEach(d => map.set(d.id, d));
          combined = Array.from(map.values());
        } catch (err) {
          console.warn('Could not sync with Firestore:', err);
        }
      }

      setDrafts(combined);
      setIsLoaded(true);
    }

    loadData();
  }, [user, isFirebaseActive]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this draft record?')) {
      DraftStore.delete(id);
      if (user && isFirebaseActive) {
        await FirestoreDraftService.deleteDraft(id);
      }
      setDrafts(prev => prev.filter(d => d.id !== id));
      if (activeDraft?.id === id) {
        setActiveDraft(null);
      }
    }
  };

  const handleDownloadPdf = (draft: AgreementDraft, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const doc = exportDraftToPdf(draft);
      const safeFilename = `${draft.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${draft.version}.pdf`;
      doc.save(safeFilename);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('PDF generation encountered an error.');
    }
  };

  const handleUpdateActiveDraft = async (updated: AgreementDraft) => {
    setActiveDraft(updated);
    DraftStore.save(updated);
    if (user && isFirebaseActive) {
      await FirestoreDraftService.saveDraft(updated, user.uid);
    }
    setDrafts(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  };

  const handleSaveNewVersion = async (summary: string) => {
    if (!activeDraft) return;
    const updated = await DraftStore.createNewVersion(activeDraft, summary, user?.uid || 'Signatory');
    setActiveDraft(updated);
    if (user && isFirebaseActive) {
      await FirestoreDraftService.saveDraft(updated, user.uid);
    }
    setDrafts(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  };

  const renderStatusBadge = (status: DraftStatus) => {
    if (status === 'PARTY_CONFIRMED') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Party Confirmed
        </span>
      );
    }
    if (status === 'READY_FOR_PARTY_REVIEW') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          Ready for Review
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        Needs Review
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Saved Agreement Drafts</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {drafts.length} saved
            </span>
            {isFirebaseActive && user && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                <Cloud className="w-3 h-3 text-emerald-400" />
                Firestore Synced
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access previous drafts, version snapshots, and tamper-evident audit logs.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Agreement</span>
        </Link>
      </div>

      {/* In-place editor when active */}
      {activeDraft ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveDraft(null)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              ← Back to all saved drafts
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Draft ID: {activeDraft.id}
            </span>
          </div>

          <AgreementEditor
            draft={activeDraft}
            onUpdateDraft={handleUpdateActiveDraft}
            onSaveNewVersion={handleSaveNewVersion}
          />
        </div>
      ) : (
        /* Drafts List */
        <>
          {drafts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No saved drafts yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                When you extract and generate agreement drafts on the Create page, they are automatically stored here with full version control and audit history.
              </p>
              <div className="pt-2">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Agreement Draft</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map(d => (
                <div
                  key={d.id}
                  onClick={() => setActiveDraft(d)}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {renderStatusBadge(d.status)}
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        v{d.version}.0
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {d.title}
                    </h3>

                    <div className="text-xs text-slate-400 mt-2 space-y-1">
                      <div>
                        Party 1: <strong className="text-slate-200">{d.extractedData.partyA.name}</strong>
                      </div>
                      <div>
                        Party 2: <strong className="text-slate-200">{d.extractedData.partyB.name}</strong>
                      </div>
                      <div>
                        Scope:{' '}
                        <span className="text-slate-300">
                          {d.extractedData.scopeOrProducts.value}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-slate-400" />
                        {d.tamperEvidenceHash.slice(0, 10)}...
                      </span>
                      <span>{new Date(d.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={e => handleDownloadPdf(d, e)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDelete(d.id, e)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
