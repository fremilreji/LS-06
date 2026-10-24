'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  Info, 
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface StampDutyAdvisorProps {
  dealPriceText?: string;
  isGoodsOnly?: boolean;
}

export default function StampDutyAdvisor({ dealPriceText = '₹50,000', isGoodsOnly = false }: StampDutyAdvisorProps) {
  const [selectedState, setSelectedState] = useState<'Karnataka' | 'Maharashtra' | 'Delhi' | 'Other'>('Karnataka');
  const [dealNature, setDealNature] = useState<'goods' | 'services' | 'mixed'>(isGoodsOnly ? 'goods' : 'mixed');

  const getAdvisoryDetails = () => {
    if (selectedState === 'Karnataka') {
      const isExempt = dealNature === 'goods';
      return {
        state: 'Karnataka',
        statute: 'Karnataka Stamp Act, 1957 — Article 5(j) (as amended by Karnataka Act 04 of 2024)',
        effectiveDate: '3 February 2024',
        headlineDuty: isExempt ? 'Statutorily Exempt (or ₹500 if mixed)' : '₹500 flat',
        impoundingPenalty: isExempt ? '₹0' : '₹5,000 (10x penalty) + ₹500 deficit = ₹5,500 total cure cost',
        governingArticle: isExempt 
          ? 'Article 5 Exemption — Agreement relating exclusively to the sale of goods/merchandise' 
          : 'Article 5(j) — Agreement or memorandum of an agreement, not otherwise provided for',
        explanation: (
          'The Karnataka Stamp (Amendment) Act, 2023 (Act No. 04 of 2024) increased the general agreement rate under Article 5(j) from ₹200 to ₹500. ' +
          'Under Sections 33 and 34 of the Karnataka Stamp Act, an unstamped agreement cannot be admitted in evidence in any civil suit (or arbitration) ' +
          'until impounded and cured with payment of 10 times the deficient stamp duty.'
        ),
        eStampPortal: 'KAWERI Online Services / Stock Holding Corporation of India (SHCIL)',
      };
    }

    if (selectedState === 'Maharashtra') {
      const isExempt = dealNature === 'goods';
      return {
        state: 'Maharashtra',
        statute: 'Maharashtra Stamp Act, 1958 — Article 5(h)(B) & Article 5(h)(A)',
        effectiveDate: '14 October 2024',
        headlineDuty: isExempt ? 'Statutorily Exempt (Exemption a)' : '₹500 flat (or 0.1%–0.2% ad valorem)',
        impoundingPenalty: isExempt ? '₹0' : '2% per month (capped at 4x deficient duty under Section 34)',
        governingArticle: isExempt
          ? 'Article 5 Exemption (a) — Routine merchandise sale between merchants'
          : 'Article 5(h)(B) (Non-monetary: ₹500) or Article 5(h)(A)(iv) (Monetary obligation: 0.1% ≤₹10L / 0.2% >₹10L)',
        explanation: (
          'The Maharashtra Stamp (Amendment) Ordinance/Act, 2024 raised the flat catch-all rate from ₹100 to ₹500. ' +
          'Crucially, if the deal summary states a quantifiable monetary value (e.g. ₹50,000+), tax authorities may assess under Article 5(h)(A)(iv) ' +
          '(0.1% up to ₹10 Lakhs). Section 33 mandates impounding if unstamped.'
        ),
        eStampPortal: 'IGR Maharashtra e-SBTR / Virtual Treasury (Gras)',
      };
    }

    if (selectedState === 'Delhi') {
      const isExempt = dealNature === 'goods';
      return {
        state: 'NCT of Delhi',
        statute: 'Indian Stamp Act, 1899 (Delhi Schedule 1A) — Article 5(c)',
        effectiveDate: 'Current Delhi Schedule 1A',
        headlineDuty: isExempt ? 'Statutorily Exempt (Exemption a)' : '₹50 flat',
        impoundingPenalty: isExempt ? '₹0' : '₹500 (10x statutory penalty under Section 35 Proviso a) + ₹50 = ₹550',
        governingArticle: isExempt
          ? 'Article 5 Exemption (a) — Agreement relating to sale of goods exclusively'
          : 'Article 5(c) — Agreement or memorandum if not otherwise provided for',
        explanation: (
          'In Delhi, general commercial memoranda and service agreements fall under Schedule 1A Article 5(c) charging ₹50. ' +
          'Under Section 35 of the Indian Stamp Act, 1899, an unstamped document is inadmissible in civil proceedings until the court impounds it ' +
          'and collects a mandatory 10x penalty (₹500).'
        ),
        eStampPortal: 'e-Stamping via Stock Holding Corporation of India (SHCIL) Delhi',
      };
    }

    return {
      state: 'Other Indian States',
      statute: 'Indian Stamp Act, 1899 / State Stamp Act Schedule',
      effectiveDate: 'Residuary Article',
      headlineDuty: '₹100 to ₹500 typical',
      impoundingPenalty: 'Up to 10x deficient duty under Section 35 / Section 33 impounding',
      governingArticle: 'General Commercial Agreement / Memorandum of Agreement',
      explanation: 'Stamp duty is a State subject in India. Rates vary based on execution state, property location, and transaction nature.',
      eStampPortal: 'State E-Stamping Gateway (SHCIL / NeSL)',
    };
  };

  const advisory = getAdvisoryDetails();

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>State Stamp Duty & Impounding Risk Advisor</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Fiscal Admissibility Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Under Indian law, an electronic contract is valid under Section 10A IT Act, but <strong>inadmissible in court</strong> unless duly stamped.
              </p>
            </div>
          </div>
        </div>

        {/* State and Deal Nature Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Jurisdiction (State of Execution / Counterparty):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Karnataka', 'Maharashtra', 'Delhi', 'Other'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedState(st)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                    selectedState === st
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nature of Commercial Deal:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDealNature('goods')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  dealNature === 'goods'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Pure Goods (Exempt)
              </button>
              <button
                type="button"
                onClick={() => setDealNature('services')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  dealNature === 'services'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Services / Works
              </button>
              <button
                type="button"
                onClick={() => setDealNature('mixed')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  dealNature === 'mixed'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Mixed Supply + Terms
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Estimated Stamp Duty */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">Statutory Stamp Duty</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                {advisory.state}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight mt-1">
              {advisory.headlineDuty}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono leading-relaxed">
              {advisory.governingArticle}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            Effective: {advisory.effectiveDate}
          </div>
        </div>

        {/* Card 2: Section 33 Impounding Exposure */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Section 33 Impounding Risk
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                Up to 10x Penalty
              </span>
            </div>
            <div className="text-sm font-bold text-rose-300 mt-1">
              {advisory.impoundingPenalty}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              If an unstamped deal memorandum is tendered before an Indian Civil or Commercial Court, the Judge is statutorily mandated to <strong>impound the document</strong> under Section 33 before it can be read in evidence.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            Curable fiscal defect under <em>In Re: Interplay (2023)</em>
          </div>
        </div>

        {/* Card 3: E-Stamping Procurement Rail */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-blue-300">E-Stamping Gateway</span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                Authorized Channels
              </span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              {advisory.eStampPortal}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Small business owners can digitally purchase e-stamp certificates online via authorized state portals and cryptographically append the e-stamp certificate number to the Deal Summary.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-blue-400 font-medium">
            Affixing e-stamp unlocks 100% court admissibility
          </div>
        </div>
      </div>

      {/* Statutory Guidance Note */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Judicial Distinction: Contract Validity vs. Evidentiary Admissibility</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          {advisory.explanation}
        </p>
        <div className="pt-2 text-[11px] text-slate-500 italic">
          * Note: Purely oral sales of merchandise without a separate written instrument transferring title are exempt under Article 5. However, when parties confirm a consolidated Deal Summary or incorporate delivery/payment covenants, it crystallizes into a stampable &ldquo;instrument&rdquo;.
        </div>
      </div>
    </div>
  );
}
