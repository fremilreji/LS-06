'use client';

import React, { useState } from 'react';
import { AgreementDraft } from '@/types/agreement';
import { exportDraftToPdf } from '@/lib/agreement/exportPdf';
import { 
  FileDown, 
  Copy, 
  Check, 
  MessageSquare, 
  Lock, 
  Scale, 
  ShieldCheck, 
  Edit3,
  Sparkles
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

interface LegalPaperDocumentProps {
  draft: AgreementDraft;
  jurisdictionCity?: string;
  onUpdateDraft?: (updated: AgreementDraft) => void;
}

export default function LegalPaperDocument({
  draft,
  jurisdictionCity = 'Bengaluru, Karnataka',
  onUpdateDraft,
}: LegalPaperDocumentProps) {
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedAsk, setCopiedAsk] = useState(false);
  const [showFormalDoc, setShowFormalDoc] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const partyAName = draft.extractedData.partyA.name || 'Seller';
  const partyBName = draft.extractedData.partyB.name || 'Buyer';
  const cleanedPartyB = partyBName.replace(/^[\[(]+/, '').trim();
  const rawFirstName = cleanedPartyB.split(/[ \/(]/)[0] || '';
  const partyBFirstName = (rawFirstName && !rawFirstName.toLowerCase().includes('counterparty') && !rawFirstName.toLowerCase().includes('buyer'))
    ? rawFirstName
    : 'Hello';

  const todayStr = new Date(draft.updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const whatsappMessage = `${partyBFirstName}, so we're on the same page regarding our agreement:\n` +
    `• Scope: ${draft.extractedData.scopeOrProducts.value} (${draft.extractedData.quantity.value})\n` +
    `• Consideration: ${draft.extractedData.price.value} (${draft.extractedData.currency})\n` +
    `• Delivery: ${draft.extractedData.deliveryTimeline.value}\n` +
    `• Payment: ${draft.extractedData.paymentTerms.value}\n\n` +
    `Please reply "Confirmed" to lock this version.`;

  const handleCopyDoc = () => {
    const docElement = document.getElementById('legal-doc-content');
    if (!docElement) return;
    navigator.clipboard.writeText(docElement.innerText);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const handleCopyAsk = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedAsk(true);
    setTimeout(() => setCopiedAsk(false), 2500);
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = exportDraftToPdf(draft);
      const safeFilename = `${draft.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${draft.version}.pdf`;
      doc.save(safeFilename);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('PDF generation encountered an error.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <span className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
            One-Page Record
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Agreement Memorandum (Version v{draft.version}.0)
          </h3>
          <p className="text-xs text-slate-400">
            Click anywhere on the white paper sheet to edit text before downloading.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyDoc}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copiedDoc ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting...' : 'Download Letter (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* 2. White Paper Document Sheet (.doc style) */}
      <div className="legal-paper p-8 sm:p-12 text-slate-900 shadow-2xl relative">
        <div id="legal-doc-content" contentEditable suppressContentEditableWarning className="space-y-6 focus:outline-none">
          {/* Header & Double Line */}
          <div className="pb-3 border-b-4 border-double border-slate-300">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
              {draft.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              Operational understanding recorded on <strong>{todayStr}</strong> between <strong>{partyAName}</strong> (First Party) and <strong>{partyBName}</strong> (Second Party).
            </p>
          </div>

          {/* Structured Clauses */}
          <div className="space-y-5 text-sm sm:text-base leading-relaxed text-slate-800 font-serif">
            {/* Clause 1: Scope */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-1">
                1. SCOPE OF SUPPLY OR SERVICES
              </h3>
              <p>
                The transaction concerns the provision of <strong>{draft.extractedData.scopeOrProducts.value}</strong>
                {draft.extractedData.quantity.value && !draft.extractedData.quantity.value.includes('Unspecified')
                  ? ` (Agreed Quantity: ${draft.extractedData.quantity.value})`
                  : ''}. Context: {draft.extractedData.businessContext || 'Commercial transaction'}.
              </p>
            </div>

            {/* Clause 2: Consideration & Taxes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-1">
                2. FINANCIAL CONSIDERATION & TAXES
              </h3>
              <p>
                The total agreed consideration is <strong>{draft.extractedData.price.value}</strong> ({draft.extractedData.currency}). 
                Tax applicability is noted as: <em>{draft.extractedData.taxInclusiveStatus === 'INCLUSIVE' ? 'Inclusive of applicable GST' : draft.extractedData.taxInclusiveStatus === 'EXCLUSIVE' ? 'Exclusive of GST (charged extra)' : 'Unspecified — to be finalized upon tax invoice issuance'}</em>.
              </p>
            </div>

            {/* Clause 3: Delivery */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-1">
                3. DELIVERY TIMELINE & LOGISTICS
              </h3>
              <p>
                Target completion/delivery timeline: <strong>{draft.extractedData.deliveryTimeline.value}</strong>. Logistics & freight: {draft.extractedData.transportResponsibility.value}.
              </p>
            </div>

            {/* Clause 4: Payment */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-1">
                4. PAYMENT SCHEDULE
              </h3>
              <p>
                Agreed payment condition: <strong>{draft.extractedData.paymentTerms.value}</strong>.
              </p>
            </div>

            {/* Clause 5: Governing Law & Jurisdiction */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-1">
                5. DISPUTES & GOVERNING LAW
              </h3>
              <p>
                This agreement is governed by the laws of India. Any disputes arising in connection with this agreement shall be heard before the competent courts at <strong>{jurisdictionCity}</strong>.
              </p>
            </div>
          </div>

          {/* Signature Table */}
          <div className="pt-8 mt-6 border-t border-slate-300">
            <div className="grid grid-cols-2 gap-8 text-xs font-sans text-slate-800">
              <div>
                <div className="border-t border-slate-900 pt-1 font-semibold">
                  For {partyAName}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">Authorized Signatory</div>
              </div>
              <div>
                <div className="border-t border-slate-900 pt-1 font-semibold">
                  For {partyBName}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Footer Disclaimer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-500 font-sans leading-relaxed">
          <strong>Notice: </strong> {LEGAL_DISCLAIMER} An unstamped memorandum may attract impounding under Section 33 of the Stamp Act before being admitted in evidence.
        </div>
      </div>

      {/* 3. Fingerprint Hash Bar */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>Fingerprint of this version: </span>
          <code className="text-blue-300">{draft.tamperEvidenceHash}</code>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Changes if the letter is edited</span>
      </div>

      {/* 4. "Ask the other side to confirm" (WhatsApp Speech Bubble) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Ask the other side to confirm</h4>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            Send this in the same chat. A one-word &ldquo;Confirmed&rdquo; reply is your proof they agreed.
          </span>
        </div>

        <div className="whatsapp-bubble p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed">
          {whatsappMessage}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">
            Formatted for 1-click WhatsApp copy-paste
          </span>

          <button
            type="button"
            onClick={handleCopyAsk}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            {copiedAsk ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied Message!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Message for WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. Formal Agreement Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowFormalDoc(!showFormalDoc)}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <Scale className="w-4 h-4 text-blue-400" />
          <span>{showFormalDoc ? 'Hide Formal Multi-Clause Agreement' : 'Generate Full Formal Agreement with Witness Lines'}</span>
        </button>

        {showFormalDoc && (
          <div className="mt-4 legal-paper p-8 sm:p-12 text-slate-900 shadow-2xl space-y-6 animate-in fade-in">
            <div className="pb-3 border-b-4 border-double border-slate-300">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif">
                FORMAL COMMERCIAL SUPPLY AGREEMENT
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-sans">
                This Agreement is made on {todayStr} between {partyAName} (&ldquo;Seller/Provider&rdquo;) and {partyBName} (&ldquo;Buyer/Client&rdquo;).
              </p>
            </div>

            <div className="space-y-4 text-sm font-serif leading-relaxed text-slate-800">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans">1. Background & Recitals</h4>
                <p className="mt-0.5">1.1 The Seller engages in commercial supply, and the Buyer desires to procure agreed goods or services in the ordinary course of business.</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans">2. Scope & Specifications</h4>
                <p className="mt-0.5">2.1 The Seller agrees to supply {draft.extractedData.scopeOrProducts.value} in the quantity of {draft.extractedData.quantity.value} strictly as agreed.</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans">3. Financial Consideration & Invoicing</h4>
                <p className="mt-0.5">3.1 The Buyer shall remit total consideration of {draft.extractedData.price.value} ({draft.extractedData.currency}). Tax invoices shall clearly state applicable GST.</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans">4. Delivery, Title & Logistics</h4>
                <p className="mt-0.5">4.1 Delivery shall be completed within {draft.extractedData.deliveryTimeline.value}. Risk of transit shall be borne as mutually designated.</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans">5. Inspection, Defect Notification & Remedies</h4>
                <p className="mt-0.5">5.1 The Buyer shall inspect deliverables upon arrival. Discrepancies shall be notified within reasonable commercial timeframes.</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-sans">6. Dispute Resolution & Jurisdiction</h4>
                <p className="mt-0.5">6.1 The parties agree to resolve disputes through good-faith mutual consultation, failing which the courts of {jurisdictionCity} shall have jurisdiction.</p>
              </div>
            </div>

            {/* 4-Signature Table with 2 Witnesses */}
            <div className="pt-8 border-t border-slate-300">
              <div className="grid grid-cols-2 gap-8 text-xs font-sans text-slate-800 mb-6">
                <div>
                  <div className="border-t border-slate-900 pt-1 font-semibold">For {partyAName} (Seller)</div>
                  <div className="text-slate-500 text-[11px]">Authorized Signatory</div>
                </div>
                <div>
                  <div className="border-t border-slate-900 pt-1 font-semibold">For {partyBName} (Buyer)</div>
                  <div className="text-slate-500 text-[11px]">Authorized Signatory</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-xs font-sans text-slate-800 pt-4 border-t border-dashed border-slate-200">
                <div>
                  <div className="border-t border-slate-700 pt-1">Witness 1: _____________________</div>
                  <div className="text-slate-500 text-[11px]">Name & Address</div>
                </div>
                <div>
                  <div className="border-t border-slate-700 pt-1">Witness 2: _____________________</div>
                  <div className="text-slate-500 text-[11px]">Name & Address</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
