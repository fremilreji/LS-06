'use client';

import React from 'react';
import { ExtractedAgreementData, ExtractedTermItem, PartyInfo } from '@/types/agreement';
import { 
  Building2, 
  User, 
  Package, 
  DollarSign, 
  Calendar, 
  Truck, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle, 
  Quote, 
  Info,
  Clock,
  RotateCcw
} from 'lucide-react';

interface ExtractedTermsViewProps {
  data: ExtractedAgreementData;
}

export default function ExtractedTermsView({ data }: ExtractedTermsViewProps) {
  const renderConfidenceBadge = (confidence: 'HIGH' | 'MEDIUM' | 'LOW', isExplicit: boolean) => {
    if (!isExplicit) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <HelpCircle className="w-3 h-3" />
          Inferred / Unstated
        </span>
      );
    }

    if (confidence === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Explicitly Stated
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Info className="w-3 h-3" />
        Needs Verification
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Completeness Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Extracted Commercial Terms</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Engine: {data.engineUsed}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Structured terms extracted directly from conversation excerpts without inventing unverified facts.
            </p>
          </div>

          {/* Completeness Meter */}
          <div className="w-full sm:w-56 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Draft Completeness</span>
              <span className={`font-bold font-mono ${
                data.completenessScore >= 75 ? 'text-emerald-400' : data.completenessScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {data.completenessScore}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.completenessScore >= 75 ? 'bg-emerald-500' : data.completenessScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${data.completenessScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contracting Parties Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Party A */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Party 1 ({data.partyA.role})</span>
            </div>
            {renderConfidenceBadge(data.partyA.confidence, data.partyA.isExplicit)}
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-white tracking-wide">{data.partyA.name}</h4>
            {data.partyA.clarificationNeeded && (
              <p className="text-xs text-amber-300/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50 mt-2">
                <strong className="text-amber-200">Notice:</strong> {data.partyA.clarificationNeeded}
              </p>
            )}
          </div>
        </div>

        {/* Party B */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Party 2 ({data.partyB.role})</span>
            </div>
            {renderConfidenceBadge(data.partyB.confidence, data.partyB.isExplicit)}
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-white tracking-wide">{data.partyB.name}</h4>
            {data.partyB.clarificationNeeded && (
              <p className="text-xs text-amber-300/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50 mt-2">
                <strong className="text-amber-200">Notice:</strong> {data.partyB.clarificationNeeded}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Commercial Terms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Scope / Deliverables */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Package className="w-3.5 h-3.5 text-blue-400" /> Scope / Product
              </span>
              {renderConfidenceBadge(data.scopeOrProducts.confidence, data.scopeOrProducts.isExplicit)}
            </div>
            <div className="text-sm font-semibold text-white">{data.scopeOrProducts.value}</div>
            <div className="text-xs text-slate-400 mt-1">Quantity: <strong className="text-slate-200">{data.quantity.value}</strong></div>
          </div>
          {data.scopeOrProducts.excerpt && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1 italic">
              <Quote className="w-3 h-3 shrink-0 text-blue-400 mt-0.5" />
              <span>&ldquo;{data.scopeOrProducts.excerpt}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Pricing & GST */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Consideration
              </span>
              {renderConfidenceBadge(data.price.confidence, data.price.isExplicit)}
            </div>
            <div className="text-base font-bold text-emerald-400">{data.price.value}</div>
            <div className="text-xs text-slate-300 mt-1">
              GST / Tax Status:{' '}
              <span className={`font-semibold ${data.taxInclusiveStatus === 'UNSPECIFIED' ? 'text-amber-400' : 'text-slate-200'}`}>
                {data.taxInclusiveStatus}
              </span>
            </div>
          </div>
          {data.price.excerpt && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1 italic">
              <Quote className="w-3 h-3 shrink-0 text-emerald-400 mt-0.5" />
              <span>&ldquo;{data.price.excerpt}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Payment Terms */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Payment Terms
              </span>
              {renderConfidenceBadge(data.paymentTerms.confidence, data.paymentTerms.isExplicit)}
            </div>
            <div className="text-sm font-semibold text-white">{data.paymentTerms.value}</div>
            {data.paymentTerms.ambiguityNotes && (
              <p className="text-[11px] text-amber-300 mt-1">
                {data.paymentTerms.ambiguityNotes}
              </p>
            )}
          </div>
          {data.paymentTerms.excerpt && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1 italic">
              <Quote className="w-3 h-3 shrink-0 text-indigo-400 mt-0.5" />
              <span>&ldquo;{data.paymentTerms.excerpt}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Delivery Timeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Delivery Timeline
              </span>
              {renderConfidenceBadge(data.deliveryTimeline.confidence, data.deliveryTimeline.isExplicit)}
            </div>
            <div className="text-sm font-semibold text-white">{data.deliveryTimeline.value}</div>
            {data.deliveryTimeline.ambiguityNotes && (
              <p className="text-[11px] text-amber-300 mt-1">
                {data.deliveryTimeline.ambiguityNotes}
              </p>
            )}
          </div>
          {data.deliveryTimeline.excerpt && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1 italic">
              <Quote className="w-3 h-3 shrink-0 text-cyan-400 mt-0.5" />
              <span>&ldquo;{data.deliveryTimeline.excerpt}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Transport & Shipping Responsibility */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="w-3.5 h-3.5 text-amber-400" /> Transport / Logistics
              </span>
              {renderConfidenceBadge(data.transportResponsibility.confidence, data.transportResponsibility.isExplicit)}
            </div>
            <div className="text-sm font-semibold text-white">{data.transportResponsibility.value}</div>
          </div>
          {data.transportResponsibility.excerpt && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1 italic">
              <Quote className="w-3 h-3 shrink-0 text-amber-400 mt-0.5" />
              <span>&ldquo;{data.transportResponsibility.excerpt}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Quality & Acceptance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Inspection & Quality
              </span>
              {renderConfidenceBadge(data.qualityAcceptance.confidence, data.qualityAcceptance.isExplicit)}
            </div>
            <div className="text-sm font-semibold text-white">{data.qualityAcceptance.value}</div>
          </div>
          {data.qualityAcceptance.excerpt && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1 italic">
              <Quote className="w-3 h-3 shrink-0 text-emerald-400 mt-0.5" />
              <span>&ldquo;{data.qualityAcceptance.excerpt}&rdquo;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
