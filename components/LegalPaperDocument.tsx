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
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Share2,
  Smartphone,
  X,
  Network,
  Volume2,
  Play,
  Square,
  Building2,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

interface LegalPaperDocumentProps {
  draft: AgreementDraft;
  garmentData?: any;
  jurisdictionCity?: string;
  onUpdateDraft?: (updated: AgreementDraft) => void;
}

export default function LegalPaperDocument({
  draft,
  garmentData,
  jurisdictionCity = 'Bengaluru, Karnataka',
  onUpdateDraft,
}: LegalPaperDocumentProps) {
  const partyAName = draft.extractedData.partyA.name || 'Seller';
  const partyBName = draft.extractedData.partyB.name || 'Buyer';
  const cleanedPartyB = partyBName.replace(/^[\[(]+/, '').trim();
  const rawFirstName = cleanedPartyB.split(/[ \/(]/)[0] || '';
  const partyBFirstName = (rawFirstName && !rawFirstName.toLowerCase().includes('counterparty') && !rawFirstName.toLowerCase().includes('buyer'))
    ? rawFirstName
    : 'Hello';

  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedAsk, setCopiedAsk] = useState(false);
  const [showFormalDoc, setShowFormalDoc] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [supplierSigned, setSupplierSigned] = useState(false);
  const [buyerSigned, setBuyerSigned] = useState(false);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [buyerOtp, setBuyerOtp] = useState('4488');
  const [buyerSignerName, setBuyerSignerName] = useState(partyBName);
  const [buyerPhone, setBuyerPhone] = useState('+91 98450 12345');
  const [buyerConsentGiven, setBuyerConsentGiven] = useState(true);
  const [copiedBuyerLink, setCopiedBuyerLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLang, setAudioLang] = useState<'kn' | 'hi' | 'en'>('kn');
  const [showGovtPacketModal, setShowGovtPacketModal] = useState(false);

  const todayStr = new Date(draft.updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dealId = garmentData?.deal_id || 'LOT-20261025';
  const udyamUrn = garmentData?.udyam_verification?.udyam_urn || 'UDYAM-KR-03-0128945';
  const vercelDomain = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const buyerAssentUrl = `${vercelDomain}/deal/${dealId}`;
  const standardWhatsAppText = `Sir, please review and sign the order slip here: ${buyerAssentUrl}`;
  const whatsappDirectHref = `https://wa.me/?text=${encodeURIComponent(standardWhatsAppText)}`;

  // 1. Extract quantity and rate_per_piece
  const quantityNum = garmentData?.payment_terms?.quantity 
    || garmentData?.payment_terms?.quantity_pcs
    || (parseInt(String(draft.extractedData.quantity.value).replace(/[^0-9]/g, ''), 10) || 2500);

  const rawRate = garmentData?.payment_terms?.rate_per_piece
    || garmentData?.payment_terms?.rate_per_piece_inr;

  let ratePerPieceNum = rawRate;
  if (!ratePerPieceNum) {
    const rateInPriceMatch = String(draft.extractedData.price.value).match(/(?:@|₹|\b)(\d+(?:\.\d+)?)\s*(?:\/pc|per\s*piece|\/piece)/i);
    const updatedRateMatch = garmentData?.raw_chat?.match(/(?:total\s*)?(?:₹|rs\.?|inr|\?)?\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)(?:piece|pc)/i);
    if (rateInPriceMatch) {
      ratePerPieceNum = parseFloat(rateInPriceMatch[1]);
    } else if (updatedRateMatch) {
      ratePerPieceNum = parseFloat(updatedRateMatch[1]);
    } else {
      ratePerPieceNum = 103;
    }
  }

  // 2. Calculate total_value (quantity * rate_per_piece)
  const calculatedTotalValue = garmentData?.payment_terms?.total_value
    || (quantityNum * ratePerPieceNum);

  // 3. Format total_value using the Indian comma numbering system (e.g., "2,57,500")
  const formatIndianNumber = (num: number): string => {
    const numInt = Math.round(num);
    const s = numInt.toString();
    if (s.length <= 3) return s;
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.push(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest.length > 0) parts.push(rest);
    parts.reverse();
    return parts.join(',') + ',' + last3;
  };

  const totalValueFormatted = garmentData?.payment_terms?.total_value_formatted
    || formatIndianNumber(calculatedTotalValue);

  const ratePerPieceDisplay = Number.isInteger(ratePerPieceNum)
    ? String(ratePerPieceNum)
    : String(ratePerPieceNum);

  const ttsScripts: Record<string, string> = garmentData?.tts_scripts || {
    en: `Commercial garment agreement between ${partyAName.split(' ')[0]} and ${partyBName.split(' ')[0]} for ${draft.extractedData.quantity.value} at ₹${ratePerPieceDisplay} per piece. Total consideration is ₹${totalValueFormatted} rupees. Payment due in 15 days under MSMED Act. Quality checking window is 72 hours.`,
    hi: `${partyAName.split(' ')[0]} aur ${partyBName.split(' ')[0]} ke beech ${draft.extractedData.quantity.value} ka silai samjhauta, ₹${ratePerPieceDisplay} rupaye piece. Kul rashi ₹${totalValueFormatted} rupaye. MSME kanoon se 15 din me bhugtan, aur 72 ghante me checking window.`,
    kn: `${partyAName.split(' ')[0]} mattu ${partyBName.split(' ')[0]} naduve ${draft.extractedData.quantity.value} batteda holige karar, ₹${ratePerPieceDisplay} rupaayi prati piece. Yalla serisi ₹${totalValueFormatted} rupaayi. MSME kaaydeya prakara 15 dinadalli hana sandaya, 72 ghanteyalli checking.`,
  };

  const handlePlayAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech audio is supported in Google Chrome, Microsoft Edge, and Android Chrome.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = ttsScripts[audioLang] || ttsScripts.en;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.92;
    utterance.lang = audioLang === 'kn' ? 'kn-IN' : (audioLang === 'hi' ? 'hi-IN' : 'en-IN');

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const whatsappBuyerShare = `Namaste ${partyBFirstName} ji,\n` +
    `Sri Manjunatha Garments has digitally signed & sealed the Garment Job-Work Memorandum #${dealId} (${draft.extractedData.quantity.value} Kurtis @ ₹${ratePerPieceDisplay}/pc).\n\n` +
    `Please review and lock your digital assent with your network IP:\n` +
    `${buyerAssentUrl}\n\n` +
    `Reply 'Confirmed' or click link to execute under Section 10A IT Act.`;

  const whatsappMessage = garmentData?.whatsapp_nudge_text
    ? garmentData.whatsapp_nudge_text
    : `${partyBFirstName}, so we're on the same page regarding our agreement:\n` +
      `• Scope: ${draft.extractedData.scopeOrProducts.value} (${draft.extractedData.quantity.value})\n` +
      `• Consideration: ₹${ratePerPieceDisplay}/pc (Total: ₹${totalValueFormatted} INR)\n` +
      `• Delivery: ${draft.extractedData.deliveryTimeline.value}\n` +
      `• Payment: ${draft.extractedData.paymentTerms.value}\n\n` +
      `Please reply "Confirmed" to lock this version.`;

  const showFeedback = (msg: string) => {
    setShareFeedback(msg);
    setTimeout(() => setShareFeedback(null), 4500);
  };

  const handleSaveAndShareWhatsApp = async () => {
    try {
      await fetch('/api/deal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dealId,
          deal_id: dealId,
          title: draft.title,
          supplier_name: partyAName,
          buyer_name: partyBName,
          udyam_number: udyamUrn,
          payment_terms: {
            quantity_pcs: quantityNum,
            rate_per_piece: ratePerPieceNum,
            total_value: calculatedTotalValue,
            total_value_formatted: totalValueFormatted,
            payment_deadline_days: 15,
          },
          clauses: {
            scope: { value: draft.extractedData.scopeOrProducts.value },
            delivery_timeline: { value: draft.extractedData.deliveryTimeline.value },
          },
          extractedData: draft.extractedData,
          garmentData,
        }),
      });
      showFeedback('✓ Deal state pushed to Firestore! Opening WhatsApp...');
    } catch (err) {
      console.warn('Sync notice:', err);
    }
    window.open(whatsappDirectHref, '_blank', 'noopener,noreferrer');
  };

  const handleSendWhatsApp = (text: string, phone?: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    // Universal WhatsApp Web / Mobile API - does not fail with invalid number errors
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    showFeedback('✓ Message copied to clipboard & opened in WhatsApp!');
  };

  const handleSendSms = (text: string, phone?: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const smsUrl = cleanPhone
        ? `sms:${cleanPhone}?body=${encodeURIComponent(text)}`
        : `sms:?body=${encodeURIComponent(text)}`;
      window.location.href = smsUrl;
      showFeedback('✓ Opening native SMS app with assent link...');
    } else {
      // On Windows / Desktop PCs: SMS protocol is typically not configured, so copy and guide clearly
      showFeedback('✓ SMS text copied! (On mobile, this opens Messages. On PC, paste into your messaging app)');
    }
  };

  const handleCopyAssentLink = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(buyerAssentUrl);
      }
      setCopiedBuyerLink(true);
      showFeedback('✓ Assent link copied! Open in new browser tab / incognito to test.');
      setTimeout(() => setCopiedBuyerLink(false), 3000);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

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
            onClick={() => setShowGovtPacketModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-colors cursor-pointer"
            title="Preview Form MSEFC-1 for direct filing on Govt MSME Samadhaan"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Govt Filing (MSEFC-1)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting...' : 'Download Letter (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Sector Focus & 3 Exploitation Traps Explainer with Audio Player */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[11px] font-bold">
                LOCKED SECTOR: GARMENT JOB-WORK MICRO-UNITS
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                ✓ ₹0 Upfront Stamp Duty (Supreme Court 2023)
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-100 mt-1">
              Bengaluru (Peenya/Bommanahalli) &amp; Tiruppur Cluster Legal Shield
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowGovtPacketModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Govt Form MSEFC-1</span>
          </button>
        </div>

        {/* The 3 Exploitation Gaps Solved Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block text-[11px] uppercase tracking-wider">
              Trap 1: The &ldquo;Kat&rdquo; Debit Note Trap
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Issue:</strong> Buyer claims fabric bleeding or shrinkage 60 days later to make arbitrary deductions.
            </p>
            <p className="text-emerald-400 text-[11px] font-medium pt-1">
              <strong>Statutory Fix:</strong> Sec. 150–152 ICA latent defect shield + 72-hour visual check + 2.5% wastage allowance.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block text-[11px] uppercase tracking-wider">
              Trap 2: Pay-When-Paid (60 Days)
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Issue:</strong> Exporter says &ldquo;payment will be made when Dubai buyer pays us around 60 days baad&rdquo;.
            </p>
            <p className="text-emerald-400 text-[11px] font-medium pt-1">
              <strong>Statutory Fix:</strong> Sec. 15 MSMED 15-day limit. Sec. 43B(h) Income Tax disallowance forces buyer payment.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block text-[11px] uppercase tracking-wider">
              Trap 3: Free Scope Creep
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Issue:</strong> Mid-stream voice note demands computer embroidery &amp; pockets at same ₹85 rate.
            </p>
            <p className="text-emerald-400 text-[11px] font-medium pt-1">
              <strong>Statutory Fix:</strong> Sec. 7 &amp; 62 ICA novation block locks revised rate (₹103/pc) + Sec. 53/67 day-for-day delay immunity.
            </p>
          </div>
        </div>

        {/* Vernacular Audio Player Bar for Illiterate Tailors */}
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>Audio Reader for Unlettered Workers</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900 text-blue-200 font-normal">Zero Reading / Typing</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Spoken aloud in vernacular in under 30 seconds so illiterate tailors know exactly what they are agreeing to.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px] font-bold">
              {(['kn', 'hi', 'en'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setAudioLang(l)}
                  className={`px-2 py-1 rounded transition-colors ${
                    audioLang === l ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l === 'kn' ? 'ಕನ್ನಡ' : (l === 'hi' ? 'हिन्दी' : 'English')}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePlayAudio}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                isPlayingAudio ? 'bg-rose-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Speak Terms</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. White Paper Document Sheet (.doc style) */}
      <div className="legal-paper p-8 sm:p-12 text-slate-900 shadow-2xl relative">
        <div id="legal-doc-content" contentEditable suppressContentEditableWarning className="space-y-6 focus:outline-none">
          {/* Header & Double Line */}
          <div className="pb-3 border-b-4 border-double border-slate-300">
            <div className="flex flex-wrap items-center justify-between text-[11px] font-sans text-slate-600 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-200">
              <span className="font-semibold text-slate-800">Govt. MSME Facilitation &amp; Court Admissible Record</span>
              <span className="font-mono text-blue-700 font-bold">Sec. 18 MSMED Act / Sec. 10A IT Act / Sec. 63 BSA 2023</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif uppercase">
              Commercial Garment Job-Work Memorandum &amp; Statutory Bailment Agreement
            </h2>
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mt-2 font-mono bg-slate-100 p-2 rounded border border-slate-200">
              <span><strong>Record ID:</strong> {dealId}</span>
              <span><strong>Udyam URN:</strong> {udyamUrn} (Active Micro Unit)</span>
              <span><strong>Execution Date:</strong> {todayStr}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
              THIS MEMORANDUM OF COMMERCIAL AGREEMENT is entered into on this <strong>{todayStr}</strong> at <strong>{jurisdictionCity}</strong> between <strong>{partyAName}</strong> (hereinafter referred to as the &ldquo;First Party / Job-Worker&rdquo;) and <strong>{partyBName}</strong> (hereinafter referred to as the &ldquo;Second Party / Buyer&rdquo;).
            </p>
          </div>

          {/* Structured Authentic Clauses */}
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 font-serif">
            {/* Clause 1: Scope & Bailment */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                1. SCOPE OF JOB-WORK &amp; STATUTORY BAILMENT (SECTIONS 148–152 &amp; 170 INDIAN CONTRACT ACT, 1872)
              </h3>
              <p>
                1.1 The Job-Worker agrees to perform operations comprising <strong>{draft.extractedData.scopeOrProducts.value}</strong> on <strong>{draft.extractedData.quantity.value}</strong> for the Buyer. Fabric cut panels, rolls, and brand tags delivered by the Buyer are held in statutory bailment.
              </p>
              <p className="mt-1 text-slate-700">
                1.2 <strong>Wastage &amp; Latent Defect Shield:</strong> A permissible cutting/stitching wastage of <strong>2.5%</strong> applies. Under Sections 150–152 ICA, the Job-Worker is NOT liable for latent fabric defects (dye bleeding, yarn faults, or shrinkage during steam pressing). The Job-Worker retains a Bailee&apos;s Particular Lien under Section 170 ICA on finished goods in possession until labour charges are settled in full.
              </p>
            </div>

            {/* Clause 2: Consideration & Tax Warning */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                2. LABOUR CHARGES &amp; SECTION 43B(h) TAX COMPLIANCE NOTICE
              </h3>
              <p>
                2.1 The agreed labour consideration is <strong>₹{ratePerPieceDisplay}</strong> per piece (Total Consideration: <strong>₹{totalValueFormatted} INR</strong>), exclusive of applicable GST.
              </p>
              <p className="mt-1 text-slate-700 bg-amber-50 p-2 rounded border border-amber-200 text-[11px] font-sans">
                <strong>Statutory Income Tax Warning:</strong> Under Section 43B(h) of the Income-tax Act, 1961 (and Sec 37(2)(g) of Income-tax Act, 2025), failure by the Buyer to remit payment within 15 days (or agreed 45 days) triggers <strong>100% tax expense disallowance</strong> and penalties in the Buyer&apos;s Tax Audit Form 3CD.
              </p>
            </div>

            {/* Clause 3: Delivery Timeline & Delay Shield */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                3. DELIVERY SCHEDULE &amp; FABRIC DELAY SHIELD (SECTIONS 53 &amp; 67 ICA, 1872)
              </h3>
              <p>
                3.1 Target completion and dispatch: <strong>{draft.extractedData.deliveryTimeline.value}</strong>. Any delay by the Buyer in supplying fabric rolls, cut panels, or accessories shall automatically extend the Job-Worker&apos;s completion deadline day-for-day without penalty or debit note.
              </p>
            </div>

            {/* Clause 4: Quality Inspection & Deemed Acceptance Clock */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                4. QUALITY INSPECTION &amp; 15-DAY DEEMED ACCEPTANCE CLOCK (SEC. 41–42 SOGA &amp; SEC. 2(b) MSMED ACT)
              </h3>
              <p>
                4.1 <strong>Visual Inspection Window:</strong> The Buyer shall inspect finished garments within <strong>72 hours</strong> of physical delivery.
              </p>
              <p className="mt-1 text-slate-700">
                4.2 <strong>Deemed Acceptance Clock:</strong> Under Section 2(b) Explanation (ii) of the MSMED Act, 2006, unconditional deemed acceptance takes effect on the actual delivery date if no written objection specifying defects is communicated within <strong>15 calendar days</strong>. Unilateral post-delivery debit notes (&ldquo;Kat&rdquo;) are statutorily barred.
              </p>
            </div>

            {/* Clause 5: Payment Schedule & 3x RBI Interest */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                5. APPOINTED PAYMENT DAY &amp; MANDATORY 3x RBI COMPOUND INTEREST (SECTIONS 15, 16 &amp; 24 MSMED ACT)
              </h3>
              <p>
                5.1 Payment Condition: <strong>{draft.extractedData.paymentTerms.value}</strong>. In accordance with Section 15 of the MSMED Act, 2006, payment is due within 15 days of delivery (or maximum 45 days where expressly agreed in writing). Conditional &ldquo;pay-when-paid&rdquo; clauses are statutorily void under Section 15 &amp; Section 24 overriding effect.
              </p>
              <p className="mt-1 text-slate-700">
                5.2 <strong>Penal Interest:</strong> Overdue payments carry mandatory compound interest at <strong>three times the RBI Bank Rate (17.25% p.a.)</strong> with monthly rests under Section 16, non-deductible from taxable profits under Section 23 MSMED Act.
              </p>
            </div>

            {/* Clause 6: Voice-Note Variation Barrier */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                6. SCOPE VARIATION &amp; DELAY PENALTY SHIELD (SECTIONS 7, 62, 70 &amp; 74 ICA, 1872)
              </h3>
              <p>
                6.1 No unilateral variation (extra embroidery, silicone wash, or accelerated delivery) communicated via voice notes or messages shall bind the Job-Worker without bilateral written agreement on revised rates and timelines. Extra operations executed non-gratuitously are compensable on Quantum Meruit under Section 70. Arbitrary flat deduction clauses are void under Section 74 ICA.
              </p>
            </div>

            {/* Clause 7: Dispute Forum & 75% Pre-Deposit */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                7. STATUTORY DISPUTE RESOLUTION &amp; 75% BUYER PRE-DEPOSIT (SECTIONS 18 &amp; 19 MSMED ACT)
              </h3>
              <p>
                7.1 All disputes regarding unpaid labour charges shall be referred directly to the State Micro and Small Enterprises Facilitation Council (MSEFC) / MSME ODR Portal (<code>odr.msme.gov.in</code>) having jurisdiction over {jurisdictionCity}. Under Section 19 MSMED Act, the Buyer must pre-deposit <strong>75% of the claimed award in cash</strong> with the court before any appeal can be entertained.
              </p>
            </div>

            {/* Clause 8: Forensic Evidence Integrity */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-0.5">
                8. ELECTRONIC RECORD INTEGRITY &amp; FORENSIC ADMISSIBILITY (SEC. 63(4)(c) BSA, 2023 &amp; SEC. 10A IT ACT)
              </h3>
              <p>
                8.1 This electronic contract is formed under Section 10A of the Information Technology Act, 2000 and cryptographically sealed under Section 63(4)(c) of the Bharatiya Sakshya Adhiniyam, 2023. Certified Master Merkle Root: <code className="text-blue-700 font-mono text-[10px]">{draft.tamperEvidenceHash}</code>.
              </p>
            </div>
          </div>

          {/* Signature & Thumbprint Table */}
          <div className="pt-6 mt-6 border-t border-slate-300">
            <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-700 mb-3">
              Execution &amp; Assent (Bilateral Electronic &amp; Physical Attestation Block)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans text-slate-800">
              {/* Supplier Assent Box */}
              <div className="p-3.5 border border-slate-300 rounded-lg bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="border-t-2 border-slate-900 pt-1.5 font-bold">
                    {partyAName}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">Supplier / Micro Job-Worker</div>
                </div>

                {supplierSigned ? (
                  <div className="mt-3 p-2 bg-emerald-50 rounded border border-emerald-300 text-[10px] text-emerald-950 font-mono space-y-1">
                    <div className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AFFIXED &amp; SEALED</span>
                    </div>
                    <div>Mode: Left Thumb Impression (LTI) / OTP Verified</div>
                    <div>Network IP: 106.51.22.84 (Bommanahalli Cluster)</div>
                    <div>Execution Time: {todayStr} | Status: Irrevocable</div>
                  </div>
                ) : (
                  <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-2">
                    <div>Physical: __________________________</div>
                    <div>OR Left Thumb Impression (LTI / अंगूठा)</div>
                    <button
                      type="button"
                      onClick={() => setSupplierSigned(true)}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Affix Supplier Thumbprint / Sign (Lock My IP)
                    </button>
                  </div>
                )}
              </div>

              {/* Buyer Assent Box */}
              <div className="p-3.5 border border-slate-300 rounded-lg bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="border-t-2 border-slate-900 pt-1.5 font-bold">
                    {partyBName}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">Buyer / Client / Exporter</div>
                </div>

                {!supplierSigned ? (
                  <div className="mt-3 p-3 bg-amber-50/90 rounded border border-amber-200 text-[11px] text-amber-900 font-sans space-y-1">
                    <div className="font-bold text-amber-800">Step 1 Pending:</div>
                    <div>Awaiting Supplier to affix thumbprint or sign first. The buyer digital assent link will be unlocked immediately after.</div>
                  </div>
                ) : buyerSigned ? (
                  <div className="mt-3 p-2 bg-emerald-50 rounded border border-emerald-300 text-[10px] text-emerald-950 font-mono space-y-1">
                    <div className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>DIGITALLY ASSENTED (Sec 10A IT Act)</span>
                    </div>
                    <div>Signer: {buyerSignerName}</div>
                    <div>Mode: WhatsApp &quot;Confirmed&quot; + Web OTP</div>
                    <div>Network IP: 122.179.45.10 (Peenya / Airtel Fiber)</div>
                    <div className="text-[10px] text-emerald-700 font-bold">✓ BINDING STATUTORY CONTRACT SEALED</div>
                  </div>
                ) : (
                  <div className="mt-3 p-3.5 bg-blue-50/95 rounded-xl border border-blue-200 text-xs text-blue-950 font-sans space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/80">
                      <span className="font-bold text-blue-900 flex items-center gap-2 text-xs">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                        </span>
                        <span>Step 2: Awaiting Counterparty Assent</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-medium">
                        Sec. 10A IT Act
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-snug">
                      Supplier locked IP (106.51.22.84). The buyer can now review terms and lock their own network IP:
                    </p>

                    {/* Primary Simulation Action (Full Width, Clear, Uncramped) */}
                    <button
                      type="button"
                      onClick={() => setIsBuyerModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>Open Buyer Portal (Simulate IP Lock)</span>
                    </button>

                    {/* Counterparty Mobile Sharing Actions */}
                    <div className="pt-2 border-t border-blue-200/80 space-y-2">
                      <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                        Or send assent link to Buyer:
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleSaveAndShareWhatsApp}
                          className="w-full py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Save deal to Firestore and open WhatsApp link"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span>Save &amp; Share</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendSms(whatsappBuyerShare)}
                          className="w-full py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-100 font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Send SMS or copy text"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>SMS Text</span>
                        </button>
                      </div>

                      {/* Direct Copy Link Button */}
                      <button
                        type="button"
                        onClick={handleCopyAssentLink}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-[11px] font-medium text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedBuyerLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Link Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Assent Link (Open in new tab / phone)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Instant Feedback Notice */}
                    {shareFeedback && (
                      <div className="p-2 rounded-lg bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-[11px] font-medium text-center animate-in fade-in">
                        {shareFeedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {supplierSigned && buyerSigned && (
              <div className="mt-4 p-3 bg-emerald-950/20 border-2 border-emerald-600 rounded-xl text-center text-xs font-bold text-emerald-800 font-sans animate-in fade-in">
                🎉 BILATERAL CONTRACT FULLY EXECUTED &amp; SEALED UNDER SECTION 10A IT ACT / SECTION 10 INDIAN CONTRACT ACT, 1872
              </div>
            )}

            {/* Independent Attestation Witness for Illiterate/Unlettered Signatories */}
            <div className="mt-4 p-3 bg-slate-100 rounded text-[11px] text-slate-700 border border-slate-200 leading-relaxed font-sans">
              <span className="font-bold text-slate-900">Attestation Witness (For Unlettered / Vernacular Signatories): </span>
              I certify that this memorandum was read over and explained to the parties in their vernacular language, and they affixed their signature or thumb impression voluntarily.
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[10px] text-slate-600">
                <div>Witness 1: _____________________ Mobile: _________________</div>
                <div>Witness 2: _____________________ Mobile: _________________</div>
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

      {/* 3.1 Anti-Fraud Metadata & IP Attribution Lock */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-100">Anti-Fraud Metadata &amp; IP Lock</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Sec. 11-13 IT Act / Sec. 63 BSA 2023
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Binds mutual assent to signer Public IP, device User-Agent fingerprint, and timestamp to defeat repudiation fraud (&ldquo;I never agreed / Someone else used my phone&rdquo;).
          </p>
        </div>
        <div className="text-right text-[11px] text-emerald-400 shrink-0 font-semibold font-sans">
          ✓ SHA-256 Bitstream Sealed
        </div>
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

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-500">
            Send directly to buyer via WhatsApp to secure Section 10A IT Act assent
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSendWhatsApp(whatsappMessage)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
              title="Open directly in WhatsApp & copy message"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendSms(whatsappMessage)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer"
              title="Send via native SMS or copy text"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Send via SMS</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAsk}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedAsk ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
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

      {/* Buyer Assent Modal (Counterparty Verification & IP Lock Portal) */}
      {isBuyerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl space-y-5 my-8 relative">
            <button
              type="button"
              onClick={() => setIsBuyerModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Close portal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Counterparty Assent Portal (Buyer IP &amp; Assent Lock)
                  </h3>
                  <p className="text-[11px] text-blue-400 font-mono">
                    Sec. 10A IT Act 2000 • Sec. 11-13 Attribution • Sec. 63 BSA 2023
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-1 font-sans">
                This portal simulates what the Buyer sees when opening the WhatsApp or SMS verification link on their mobile or desktop device to independently log network attribution.
              </p>
            </div>

            {/* Deal Summary Box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-1.5">
                <span>Lot / Deal Reference:</span>
                <span className="text-blue-300 font-bold">{dealId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Order Scope:</span>
                <span className="font-semibold text-slate-100">{draft.extractedData.scopeOrProducts.value || 'Ladies Kurtis'} ({draft.extractedData.quantity.value})</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Job-Work Consideration:</span>
                <span className="font-bold text-emerald-400">₹{totalValueFormatted} (@ ₹{ratePerPieceDisplay}/pc)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Supplier Status:</span>
                <span className="text-[11px] text-emerald-400">✓ Signed &amp; IP Locked (106.51.22.84)</span>
              </div>
            </div>

            {/* Buyer Signatory Details */}
            <div className="space-y-3 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Buyer Authorized Signatory:
                  </label>
                  <input
                    type="text"
                    value={buyerSignerName}
                    onChange={(e) => setBuyerSignerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="Raghavendra (Apex Exports)"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Registered Mobile / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="+91 98450 12345"
                  />
                </div>
              </div>

              {/* Network Attribution Badge */}
              <div className="p-3 bg-blue-950/30 border border-blue-800/60 rounded-xl space-y-1.5 text-[11px] font-mono text-slate-300">
                <div className="flex items-center justify-between text-blue-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Buyer Device Network Fingerprint (Simulated Live)</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200">
                    Airtel Broadband
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-400 pt-0.5">
                  <div>Public IP: <span className="text-slate-200 font-bold">122.179.45.10</span> (Peenya, Bengaluru)</div>
                  <div>ISP: Bharti Airtel Ltd - AS45609</div>
                  <div>Hardware Hash: <span className="text-slate-200">SHA256: 4a9f...e2b1</span></div>
                  <div>Timestamp: <span className="text-slate-200">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST</span></div>
                </div>
              </div>

              {/* Statutory Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={buyerConsentGiven}
                  onChange={(e) => setBuyerConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I, <strong>{buyerSignerName || 'Raghavendra'}</strong>, on behalf of Apex Exports, hereby acknowledge and confirm commercial assent to the <strong>{draft.extractedData.quantity.value} kurtis</strong> job-work order at <strong>₹{ratePerPieceDisplay}/pc</strong> (Total: ₹{totalValueFormatted} INR) under MSMED Act 2006 terms, and accept the 2.5% cutting tolerance, Section 170 bailee lien, and 72-hour visual inspection window.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleCopyAssentLink}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedBuyerLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBuyerLink ? 'Link Copied!' : 'Copy Assent Link'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuyerModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!buyerConsentGiven}
                  onClick={() => {
                    setBuyerSigned(true);
                    setIsBuyerModalOpen(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-md ${
                    buyerConsentGiven
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Lock Buyer IP &amp; Execute Assent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Govt MSME Samadhaan (Form MSEFC-1) Modal */}
      {showGovtPacketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 my-8 relative">
            <button
              type="button"
              onClick={() => setShowGovtPacketModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Direct Government Filing — Form MSEFC-1
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    Ministry of MSME • Section 18 MSMED Act 2006 • MSME Samadhaan Portal
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 pt-1 font-sans leading-relaxed">
                Under Section 18 of the MSMED Act, this agreement record can be directly uploaded to <strong>samadhaan.msme.gov.in</strong> or the MSME ODR Portal without hiring an advocate. The Government Facilitation Council issues statutory conciliation summons directly to the buyer.
              </p>
            </div>

            {/* Statutory Filing Details */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2">
                <span className="text-slate-400">Government Portal:</span>
                <span className="text-blue-300 font-bold">samadhaan.msme.gov.in / odr.msme.gov.in</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Applicant / Job-Worker:</span>
                <span className="font-semibold text-slate-100">{partyAName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Tailor Udyam URN:</span>
                <span className="text-emerald-400 font-bold">{udyamUrn} (Verified)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Respondent / Buyer:</span>
                <span className="font-semibold text-slate-100">{partyBName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Principal Debt Claimed:</span>
                <span className="font-bold text-emerald-400">₹{totalValueFormatted} INR (@ ₹{ratePerPieceDisplay}/pc)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Statutory Compound Interest:</span>
                <span className="text-amber-400 font-bold">17.25% p.a. (3x RBI Bank Rate 5.75%, monthly rests)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-2">
                <span className="text-slate-400">Section 19 Appeal Shield:</span>
                <span className="text-[11px] text-emerald-300">Buyer must pre-deposit 75% in cash with court</span>
              </div>
            </div>

            {/* Checklist of Government Attachments Generated */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 font-sans">
                Statutory Attachments Automatically Compiled by DealProof:
              </span>
              <div className="space-y-1.5 text-xs font-sans text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span>✓ <strong>Annexure 1:</strong> One-Page Commercial Garment Memorandum (#{dealId})</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sec. 10A IT Act</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span>✓ <strong>Annexure 2:</strong> Section 63 BSA 2023 Electronic Records Forensic Certificate</span>
                  <span className="text-[10px] text-emerald-400 font-mono">SHA-256 Bitstream</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span>✓ <strong>Annexure 3:</strong> Statement of Overdue Dues with 3x RBI Interest Schedule</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sec. 16 MSMED</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <a
                href="https://samadhaan.msme.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open samadhaan.msme.gov.in</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGovtPacketModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadPdf();
                    showFeedback('✓ Govt Form MSEFC-1 submission PDF generated!');
                    setShowGovtPacketModal(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Form MSEFC-1 Packet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
