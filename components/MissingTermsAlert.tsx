'use client';

import React, { useState } from 'react';
import { MissingTermIssue, AmbiguousTermIssue } from '@/types/agreement';
import { 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  Info, 
  AlertCircle, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

interface MissingTermsAlertProps {
  missingTerms: MissingTermIssue[];
  ambiguousTerms: AmbiguousTermIssue[];
}

export default function MissingTermsAlert({ missingTerms, ambiguousTerms }: MissingTermsAlertProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'IMPORTANT'>('ALL');

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredMissing = missingTerms.filter(m => {
    if (filter === 'CRITICAL') return m.criticality === 'CRITICAL';
    if (filter === 'IMPORTANT') return m.criticality === 'IMPORTANT' || m.criticality === 'CRITICAL';
    return true;
  });

  const criticalCount = missingTerms.filter(m => m.criticality === 'CRITICAL').length;
  const importantCount = missingTerms.filter(m => m.criticality === 'IMPORTANT').length;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Missing Terms & Ambiguity Triage
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Informal messages leave critical questions unrecorded. Clarifying these terms before delivery prevents 90% of commercial payment disputes.
            </p>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filter === 'ALL'
                  ? 'bg-slate-800 text-white border-slate-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              All ({missingTerms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filter === 'CRITICAL'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-700'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-rose-300'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('IMPORTANT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filter === 'IMPORTANT'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-amber-300'
              }`}
            >
              Important ({importantCount})
            </button>
          </div>
        </div>
      </div>

      {/* Ambiguous Terms Section if any */}
      {ambiguousTerms.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Ambiguous or Indefinite Statements ({ambiguousTerms.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ambiguousTerms.map(amb => (
              <div key={amb.id} className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{amb.term}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      Ambiguity
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {amb.explanation}
                  </p>
                  {amb.conflictingStatements.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800 italic">
                      Original text: &ldquo;{amb.conflictingStatements[0]}&rdquo;
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-900/30 text-xs text-amber-200/90 font-medium">
                  <strong>Resolution:</strong> {amb.suggestedResolution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Terms List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>Gaps Requiring Clarification ({filteredMissing.length})</span>
        </div>

        <div className="space-y-3">
          {filteredMissing.map(item => {
            const isCritical = item.criticality === 'CRITICAL';
            const isImportant = item.criticality === 'IMPORTANT';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-rose-950/15 border-rose-900/40 hover:border-rose-800'
                    : isImportant
                    ? 'bg-amber-950/15 border-amber-900/40 hover:border-amber-800'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isImportant
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {item.criticality} RISK
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        WHERE IS THE GAP: {item.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-amber-400 font-mono uppercase text-[10px] block">
                        Issue Found in Chat
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        {item.issue}
                      </h4>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-0.5">
                        How this hurts the small business / worker:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {item.whyItMatters}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp / Chat Suggested Question & Copy Button */}
                  <div className="sm:w-80 shrink-0 bg-slate-950/90 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <MessageSquare className="w-3.5 h-3.5" /> How to solve it (Voice / WhatsApp)
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 italic line-clamp-3 bg-emerald-950/30 p-2 rounded border border-emerald-900/40">
                        &ldquo;{item.suggestedQuestion}&rdquo;
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                      <span className="text-[10px] text-slate-500">1-tap action</span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(item.suggestedQuestion)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                          title="Open directly in WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyQuestion(item.id, item.suggestedQuestion)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
