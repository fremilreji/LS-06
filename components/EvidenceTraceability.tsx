'use client';

import React, { useState } from 'react';
import { AgreementDraft } from '@/types/agreement';
import { 
  FileCheck, 
  Quote, 
  ShieldCheck, 
  Clock, 
  User, 
  Search, 
  Layers, 
  Hash, 
  AlertCircle 
} from 'lucide-react';

interface EvidenceTraceabilityProps {
  draft: AgreementDraft;
}

export default function EvidenceTraceability({ draft }: EvidenceTraceabilityProps) {
  const [highlightedExcerpt, setHighlightedExcerpt] = useState<string | null>(null);

  const evidenceRows = [
    {
      term: 'Party 1 (Supplier/Provider)',
      extracted: draft.extractedData.partyA.name,
      status: draft.extractedData.partyA.isExplicit ? 'Explicit' : 'Inferred / Needs Confirmation',
      excerpt: draft.extractedData.partyA.excerpt || 'Implicit from first-person offer ("I can supply")',
      notes: draft.extractedData.partyA.clarificationNeeded || 'Explicit registered entity unstated',
    },
    {
      term: 'Party 2 (Buyer/Client)',
      extracted: draft.extractedData.partyB.name,
      status: draft.extractedData.partyB.isExplicit ? 'Explicit' : 'Inferred / Needs Confirmation',
      excerpt: draft.extractedData.partyB.excerpt || 'Unstated in text',
      notes: draft.extractedData.partyB.clarificationNeeded || 'Addressed by personal name',
    },
    {
      term: 'Scope & Products',
      extracted: `${draft.extractedData.scopeOrProducts.value} (${draft.extractedData.quantity.value})`,
      status: draft.extractedData.scopeOrProducts.isExplicit ? 'Explicit' : 'Unspecified',
      excerpt: draft.extractedData.scopeOrProducts.excerpt || 'Not found',
      notes: 'Extracted directly from product descriptor',
    },
    {
      term: 'Price Consideration',
      extracted: draft.extractedData.price.value,
      status: draft.extractedData.price.isExplicit ? 'Explicit' : 'Unspecified',
      excerpt: draft.extractedData.price.excerpt || 'Not found',
      notes: `Tax Status: ${draft.extractedData.taxInclusiveStatus}`,
    },
    {
      term: 'Payment Terms',
      extracted: draft.extractedData.paymentTerms.value,
      status: draft.extractedData.paymentTerms.isExplicit ? 'Explicit' : 'Unspecified',
      excerpt: draft.extractedData.paymentTerms.excerpt || 'Not found',
      notes: draft.extractedData.paymentTerms.ambiguityNotes || 'Payment condition recorded',
    },
    {
      term: 'Delivery Timeline',
      extracted: draft.extractedData.deliveryTimeline.value,
      status: draft.extractedData.deliveryTimeline.isExplicit ? 'Explicit' : 'Unspecified',
      excerpt: draft.extractedData.deliveryTimeline.excerpt || 'Not found',
      notes: draft.extractedData.deliveryTimeline.ambiguityNotes || 'Delivery duration specified',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Evidence Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Evidence & Text Traceability</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect the exact conversational statements that substantiate each extracted term. No invented facts.
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-side or stacked layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Original Raw Conversation */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-blue-400" /> Original Conversation
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {draft.extractedData.rawConversation.length} characters
              </span>
            </div>

            <div className="mt-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {draft.extractedData.rawConversation}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>Digital Digest: </span>
            <code className="text-slate-400 font-mono">{draft.extractedData.tamperEvidenceHash.slice(0, 16)}...</code>
          </div>
        </div>

        {/* Right: Traceability Mapping Table */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Term-to-Source Mapping
            </span>
            <span className="text-[11px] text-slate-400">Click row to inspect excerpt</span>
          </div>

          <div className="space-y-2.5">
            {evidenceRows.map((row, idx) => (
              <div
                key={idx}
                onClick={() => setHighlightedExcerpt(row.excerpt)}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{row.term}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      row.status.includes('Explicit')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="text-xs text-white font-medium">{row.extracted}</div>

                <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800 flex items-start gap-1.5 italic">
                  <Quote className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                  <span>&ldquo;{row.excerpt}&rdquo;</span>
                </div>

                <div className="text-[10px] text-slate-500">
                  <strong className="text-slate-400">Analysis Note:</strong> {row.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <Clock className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Version & Modification Audit Trail
          </h4>
        </div>

        <div className="mt-3 space-y-2">
          {draft.auditTrail.map((log, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 gap-2"
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  {log.action}
                </span>
                <span className="text-slate-300 font-medium">{log.details}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center space-x-3 shrink-0">
                <span>By: {log.actor}</span>
                <span>•</span>
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
