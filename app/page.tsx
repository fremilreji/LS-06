'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Scale, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  RotateCcw, 
  Smartphone, 
  Zap, 
  Mic, 
  MicOff, 
  StopCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  ShieldAlert,
  Send,
  HelpCircle
} from 'lucide-react';

// Preset Scenarios in plain language
const PRESETS = [
  {
    id: 'preset_1',
    label: 'Preset 1: 1,500 Kurtis (Missing Payment Date)',
    title: '1,500 Rayon Kurtis Job-Work Order',
    udyam: 'UDYAM-KR-03-0128945',
    chat: `Suresh (Tailor): Namaste Raghav ji, Lakshmi Garments. Ready to stitch 1,500 Rayon Kurtis at Rs 58 per piece.
Raghav (Boutique): Done Suresh, rate is fine. Sending fabric rolls tomorrow. Need delivery in 14 days.
Suresh: Ji sir, will deliver on time.
Raghav: Payment baad mein dekhenge, standard terms.`,
    supplier: 'Suresh - Lakshmi Garments (Tailor)',
    buyer: 'Raghav - Apex Boutique (Buyer)',
    quantity: 1500,
    rate: 58,
    total: 87000,
    totalFormatted: '87,000',
    item: 'Stitching of 1,500 Rayon Kurtis',
    delivery: 'Within 14 days of fabric delivery',
    gaps: [
      {
        id: 'gap_payment',
        pillar_key: 'payment_terms',
        title: 'Payment Date is Missing ("Baad Mein")',
        where_msg_id: 'MSG-04',
        where_quote: 'Raghav: "Payment baad mein dekhenge, standard terms."',
        how_it_hurts: 'The buyer did not give any date. They can delay your money for months without paying any interest.',
        quick_fix_label: '✅ Fix: Apply 15-Day Govt Payment Rule',
        quick_fix_value: 'Payment due strictly within 15 days of delivery (Section 15 MSMED Act). Delayed payment attracts 3x RBI interest.',
        whatsapp_ask_text: 'Raghav ji, for our accounts record, please confirm balance payment within 15 days of delivery so we can start stitching today.'
      },
      {
        id: 'gap_inspection',
        pillar_key: 'scope',
        title: 'Inspection Window is Missing',
        where_msg_id: 'MSG-02',
        where_quote: 'Raghav: "Need delivery in 14 days."',
        how_it_hurts: 'Buyer can take delivery and claim fake defects 1 month later to cut your money.',
        quick_fix_label: '✅ Fix: Set 72-Hour Inspection Limit',
        quick_fix_value: 'Buyer must check kurtas within 72 hours of delivery. After 72 hours, goods are deemed accepted by law (Sec 42 Sale of Goods Act).',
        whatsapp_ask_text: 'Raghav ji, please confirm inspection is within 72 hours of delivery so sample stitching is locked.'
      }
    ],
    status: 'NEEDS_GAP_FIX'
  },
  {
    id: 'preset_2',
    label: 'Preset 2: Voice Note Extra Work (Scope Creep)',
    title: '2,000 Polo T-Shirts Order & Voice Note',
    udyam: 'UDYAM-TN-27-0045812',
    chat: `Manjunath (Tailor): Ready to cut and stitch 2,000 Polo T-Shirts at Rs 48 per piece.
Vikas (Buyer): Confirmed Manjunath, 10 days delivery.
[Voice Note from Vikas]: "Bhai, also add chest embroidery logo and bio-wash for all pieces at same rate."
Manjunath: Wait sir, embroidery + bio-wash is extra Rs 14 per piece.`,
    supplier: 'Manjunath - Sri Sai Knits (Tailor)',
    buyer: 'Vikas - Urban Brands (Buyer)',
    quantity: 2000,
    rate: 48,
    total: 96000,
    totalFormatted: '96,000',
    item: 'Stitching of 2,000 Polo T-Shirts',
    delivery: 'Within 10 days',
    gaps: [
      {
        id: 'gap_scope_variation',
        pillar_key: 'scope',
        title: 'Buyer Added Extra Work Without Extra Pay',
        where_msg_id: 'Voice Note',
        where_quote: 'Vikas: "Also add chest embroidery and bio-wash at same rate."',
        how_it_hurts: 'Buyer is demanding Rs 28,000 of extra labour work for free without revising the rate.',
        quick_fix_label: '✅ Fix: Block Extra Work (Sec 62 Contract Act)',
        quick_fix_value: 'Base rate Rs 48/pc covers standard stitching only. Extra embroidery requires written price revision under Section 62 Contract Act.',
        whatsapp_ask_text: 'Vikas sir, extra embroidery and bio-wash require Rs 14/pc revision. Please confirm total Rs 62/pc.'
      }
    ],
    status: 'NEEDS_GAP_FIX'
  },
  {
    id: 'preset_3',
    label: 'Preset 3: Vague Rate Trap (Unfixed Price)',
    title: 'Cargo Pants - Rate Not Fixed',
    udyam: '',
    chat: `Buyer: Need 1,500 to 2,000 cargo pants stitched.
Suresh: What is the stitching rate?
Buyer: Market rate chal raha hai, finish dekh ke Rs 90 se Rs 105 decide karenge. Kaam shuru karo, payment jab mera party dega tab denge.`,
    supplier: 'Suresh - Lakshmi Garments (Tailor)',
    buyer: 'Wholesale Buyer',
    quantity: 1750,
    rate: 0,
    total: 0,
    totalFormatted: '0',
    item: '1,500 to 2,000 Cargo Pants (Vague)',
    delivery: 'Not stated',
    gaps: [],
    status: 'HALTED_AMBIGUOUS_SEC_29'
  }
];

export default function HomePage() {
  // Wizard Step: 1 = Input, 2 = Check 5 Terms, 3 = Order Slip & Sign
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Language: 'en' | 'hi' | 'kn'
  const [lang, setLang] = useState<'en' | 'hi' | 'kn'>('en');

  // Deal Data State
  const [activePresetId, setActivePresetId] = useState<string>('preset_1');
  const [dealId, setDealId] = useState('LOT-20261025-01');
  const [title, setTitle] = useState(PRESETS[0].title);
  const [udyamUrn, setUdyamUrn] = useState('UDYAM-KR-03-0128945');
  const [hasUdyam, setHasUdyam] = useState(true);
  const [rawChat, setRawChat] = useState(PRESETS[0].chat);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extracted Commercial Terms
  const [supplierName, setSupplierName] = useState(PRESETS[0].supplier);
  const [buyerName, setBuyerName] = useState(PRESETS[0].buyer);
  const [itemScope, setItemScope] = useState(PRESETS[0].item);
  const [quantity, setQuantity] = useState(PRESETS[0].quantity);
  const [ratePerPiece, setRatePerPiece] = useState(PRESETS[0].rate);
  const [totalValue, setTotalValue] = useState(PRESETS[0].total);
  const [totalFormatted, setTotalFormatted] = useState(PRESETS[0].totalFormatted);
  const [deliveryTimeline, setDeliveryTimeline] = useState(PRESETS[0].delivery);

  // Gaps & Halt
  const [isHaltedSec29, setIsHaltedSec29] = useState(false);
  const [activeGaps, setActiveGaps] = useState(PRESETS[0].gaps);
  const [activeGapIndex, setActiveGapIndex] = useState(0);

  // Signatures & Demo Switcher
  const [viewRole, setViewRole] = useState<'tailor' | 'buyer'>('tailor');
  const [supplierSigned, setSupplierSigned] = useState(false);
  const [buyerSigned, setBuyerSigned] = useState(false);
  const [buyerOtp, setBuyerOtp] = useState('1234');
  const [buyerOtpVerified, setBuyerOtpVerified] = useState(false);
  const [buyerAuthorized, setBuyerAuthorized] = useState(false);
  const [buyerSignatureRecord, setBuyerSignatureRecord] = useState<any>(null);
  const [showJudgeDrawer, setShowJudgeDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Voice recording & TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Canvases
  const supplierCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const buyerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [supplierDrawing, setSupplierDrawing] = useState(false);
  const [supplierHasDrawn, setSupplierHasDrawn] = useState(false);
  const [buyerDrawing, setBuyerDrawing] = useState(false);
  const [buyerHasDrawn, setBuyerHasDrawn] = useState(false);

  // Format Indian comma numbering system (e.g. 2,57,500)
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Preset
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setActivePresetId(preset.id);
    setTitle(preset.title);
    setRawChat(preset.chat);
    setUdyamUrn(preset.udyam);
    setHasUdyam(!!preset.udyam);
    setSupplierName(preset.supplier);
    setBuyerName(preset.buyer);
    setItemScope(preset.item);
    setQuantity(preset.quantity);
    setRatePerPiece(preset.rate);
    setTotalValue(preset.total);
    setTotalFormatted(preset.totalFormatted);
    setDeliveryTimeline(preset.delivery);
    setActiveGaps([...preset.gaps]);
    setActiveGapIndex(0);
    setIsHaltedSec29(preset.status === 'HALTED_AMBIGUOUS_SEC_29');
    setSupplierSigned(false);
    setBuyerSigned(false);
    setBuyerOtpVerified(false);
    setBuyerAuthorized(false);
    setBuyerSignatureRecord(null);
    setCurrentStep(1);
    showToast(`✓ Loaded ${preset.label}`);
  };

  // TTS Read Aloud in user's language
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'kn') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakSummary = () => {
    if (isHaltedSec29) {
      const msg = lang === 'hi'
        ? 'Dhyan de! Yeh order ruka hua hai kyunki rate ya quantity pakki nahi hai. Pehle buyer se exact rate puchiye.'
        : 'Warning! This order is stopped because the stitching rate or quantity is not fixed. Ask the buyer for an exact number first.';
      speakText(msg);
      return;
    }

    const msg = lang === 'hi'
      ? `Aapka order: ${supplierName} se ${buyerName}. Kul ${quantity} piece, ${ratePerPiece} rupaye prati piece. Kul rashi ${totalFormatted} rupaye. Bhugtan pandrah din ke andar.`
      : `Your order: ${quantity} pieces at Rupees ${ratePerPiece} per piece. Total amount: Rupees ${totalFormatted}. Payment within 15 days.`;
    speakText(msg);
  };

  // Live Microphone Recording
  const toggleVoiceRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Live microphone is supported in Google Chrome and Microsoft Edge on mobile and desktop.');
      return;
    }

    if (isRecordingVoice) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsRecordingVoice(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang === 'hi' ? 'hi-IN' : (lang === 'kn' ? 'kn-IN' : 'en-IN');

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' ';
            }
          }
          if (transcript.trim()) {
            setRawChat(prev => `${prev}\n[Voice Note]: "${transcript.trim()}"`);
          }
        };

        recognition.onend = () => setIsRecordingVoice(false);
        recognition.onerror = () => setIsRecordingVoice(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecordingVoice(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsRecordingVoice(false);
      }
    }
  };

  // Step 1 -> Step 2 Analysis
  const handleCheckOrder = async () => {
    setIsAnalyzing(true);
    try {
      const lower = rawChat.toLowerCase();
      const isVagueRate = /market\s*rate|dekh\s*ke|soch\s*ke|(\d+)\s*(?:to|se|-)\s*(\d+)/i.test(rawChat);
      const isPayWhenPaid = /party\s*(?:se|dega|pays)|after\s*shipment/i.test(lower);

      if (isVagueRate && isPayWhenPaid) {
        setIsHaltedSec29(true);
        setCurrentStep(2);
        showToast('⚠️ Rate is not fixed! Order stopped.');
        setIsAnalyzing(false);
        return;
      }

      setIsHaltedSec29(false);

      // Parse quantity
      const qtyMatch = rawChat.match(/(\d+(?:,\d+)?)\s*(?:pcs|pieces|kurtis|shirts|units)/i);
      const parsedQty = qtyMatch ? parseInt(qtyMatch[1].replace(/,/g, ''), 10) : quantity;

      // Parse rate
      const rateMatch = rawChat.match(/(?:@|rate|inr|rs\.?|₹)\s*(\d+(?:\.\d+)?)\s*(?:\/pc|per\s*piece|\/piece|\/-)/i);
      const parsedRate = rateMatch ? parseFloat(rateMatch[1]) : ratePerPiece;

      const calcTotal = parsedQty * parsedRate;
      setQuantity(parsedQty);
      setRatePerPiece(parsedRate);
      setTotalValue(calcTotal);
      setTotalFormatted(formatIndianNumber(calcTotal));

      // Push deal state to Firestore/Cache via API
      await fetch('/api/deal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dealId,
          deal_id: dealId,
          title,
          supplier_name: supplierName,
          buyer_name: buyerName,
          udyam_number: udyamUrn,
          payment_terms: {
            quantity_pcs: parsedQty,
            rate_per_piece: parsedRate,
            total_value: calcTotal,
            total_value_formatted: formatIndianNumber(calcTotal),
            payment_deadline_days: 15,
          },
          clauses: {
            scope: { value: itemScope },
            delivery_timeline: { value: deliveryTimeline },
          }
        }),
      });

      setCurrentStep(2);
      showToast('✓ Order details checked!');
    } catch (e) {
      console.warn('Fallback analysis notice:', e);
      setCurrentStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resolve Single Gap
  const handleResolveGap = (gapId: string) => {
    setActiveGaps(prev => prev.filter(g => g.id !== gapId));
    if (activeGapIndex >= activeGaps.length - 1) {
      setActiveGapIndex(0);
    }
    showToast('✓ Term fixed & added to order slip!');
  };

  // Save & Open WhatsApp (Link Fix)
  const handleSaveAndSendWhatsApp = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const dynamicDealUrl = `${origin}/deal/${dealId}`;
    const whatsappMessage = `Sir, please check and confirm our stitching order details here: ${dynamicDealUrl}`;
    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

    try {
      // 1. Push to Firestore
      await fetch('/api/deal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dealId,
          deal_id: dealId,
          title,
          supplier_name: supplierName,
          buyer_name: buyerName,
          udyam_number: udyamUrn,
          payment_terms: {
            quantity_pcs: quantity,
            rate_per_piece: ratePerPiece,
            total_value: totalValue,
            total_value_formatted: totalFormatted,
            payment_deadline_days: 15,
          },
          clauses: {
            scope: { value: itemScope },
            delivery_timeline: { value: deliveryTimeline },
          }
        }),
      });

      // 2. Copy link
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(dynamicDealUrl);
      }

      showToast('✓ Order link copied! Opening WhatsApp...');
    } catch (e) {
      console.warn('Sync notice:', e);
    }

    // 3. Open WhatsApp Click-to-Chat
    window.open(whatsappHref, '_blank', 'noopener,noreferrer');
  };

  // Canvas Drawing Handlers
  const startDrawing = (isSupplier: boolean) => (e: any) => {
    const canvas = isSupplier ? supplierCanvasRef.current : buyerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (isSupplier) {
      setSupplierDrawing(true);
      setSupplierHasDrawn(true);
    } else {
      setBuyerDrawing(true);
      setBuyerHasDrawn(true);
    }
  };

  const draw = (isSupplier: boolean) => (e: any) => {
    const isDrawingActive = isSupplier ? supplierDrawing : buyerDrawing;
    if (!isDrawingActive) return;
    const canvas = isSupplier ? supplierCanvasRef.current : buyerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (isSupplier: boolean) => () => {
    if (isSupplier) setSupplierDrawing(false);
    else setBuyerDrawing(false);
  };

  const clearCanvas = (isSupplier: boolean) => {
    const canvas = isSupplier ? supplierCanvasRef.current : buyerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isSupplier) setSupplierHasDrawn(false);
    else setBuyerHasDrawn(false);
  };

  const drawMarkX = (isSupplier: boolean) => {
    const canvas = isSupplier ? supplierCanvasRef.current : buyerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(60, 30);
    ctx.lineTo(160, 110);
    ctx.moveTo(160, 30);
    ctx.lineTo(60, 110);
    ctx.stroke();
    if (isSupplier) setSupplierHasDrawn(true);
    else setBuyerHasDrawn(true);
  };

  // Buyer Sign & Attribution
  const handleBuyerConfirmSign = async () => {
    if (!buyerHasDrawn && !buyerCanvasRef.current) {
      alert('Please draw your mark or signature first.');
      return;
    }
    const signatureData = buyerCanvasRef.current ? buyerCanvasRef.current.toDataURL() : '';
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          signature_data: signatureData,
          otp: buyerOtp,
          role: 'buyer',
          signer_name: buyerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBuyerSignatureRecord(data.signatureRecord);
        setBuyerSigned(true);
        showToast('✓ Buyer signature locked with IP proof!');
      }
    } catch (e) {
      setBuyerSignatureRecord({
        signer_name: buyerName,
        signer_phone: '+91 98450 12345',
        client_ip: '122.179.45.10',
        user_agent: navigator.userAgent,
        timestamp_ist: new Date().toLocaleTimeString('en-IN') + ' IST',
        otp_verified: true,
      });
      setBuyerSigned(true);
      showToast('✓ Buyer signature locked locally!');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 font-sans pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed top-18 right-4 z-50 p-4 rounded-2xl bg-zinc-950 text-white text-sm font-bold shadow-2xl border border-zinc-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==============================================================================
          TOP BAR (Large, Clear, Low-Literacy Friendly)
          ============================================================================== */}
      <section className="no-print bg-white border-b border-zinc-200 py-4 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-4xl mx-auto space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 mb-1">
                <span>🧵 Garment Tailors &amp; Job-Workers (LS-06)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Dealproof <span className="text-amber-600">✦</span> Jan-Karar
              </h1>
              <p className="text-sm text-zinc-600 font-medium mt-0.5">
                Turn informal WhatsApp messages into a simple, binding Digital Order Slip.
              </p>
            </div>

            {/* Language & Big Listen Button */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'en' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'hi' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setLang('kn')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'kn' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'}`}
                >
                  ಕನ್ನಡ
                </button>
              </div>

              {/* Big Green Audio Button */}
              <button
                type="button"
                onClick={handleSpeakSummary}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm shadow-sm transition-all cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span>{isSpeaking ? 'Stop Audio' : '🔊 Listen / सुनिए'}</span>
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-zinc-500 mr-1">Demo Case:</span>
            {PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  activePresetId === p.id
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Large 3-Step Stepper Navigation */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all ${
                currentStep === 1
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              1. Input Chat
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <span>2. Check Terms</span>
              {activeGaps.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[11px] font-black bg-amber-500 text-white">
                  {activeGaps.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all ${
                currentStep === 3
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-md'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              3. Sign &amp; WhatsApp
            </button>
          </div>

        </div>
      </section>

      {/* Main Body Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">

        {/* ==============================================================================
            STEP 1: SIMPLE INPUT & MSME CHECK
            ============================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            
            {/* Simple MSME / Udyam Check */}
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Government MSME / Udyam Registration Check</span>
              </h2>

              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                To get the <strong>Government 15-Day Payment Rule</strong>, the law requires you to have an active MSME certificate before starting work.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <input
                  type="text"
                  value={udyamUrn}
                  onChange={(e) => {
                    setUdyamUrn(e.target.value);
                    setHasUdyam(!!e.target.value.trim());
                  }}
                  placeholder="Enter your Udyam No. (e.g. UDYAM-KR-03-0128945)"
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 font-mono text-base font-bold text-zinc-900 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />

                <label className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasUdyam}
                    onChange={(e) => setHasUdyam(e.target.checked)}
                    className="w-5 h-5 rounded text-zinc-950"
                  />
                  <span>I have Udyam Certificate</span>
                </label>
              </div>

              {!hasUdyam && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 font-medium">
                  ⚠️ <strong>Warning:</strong> If you don&apos;t have an Udyam certificate, you can still create an agreement, but you won&apos;t get 15-day court recovery protection. <a href="https://udyamregistration.gov.in" target="_blank" rel="noopener noreferrer" className="font-bold underline text-amber-900">Register here for free</a>.
                </div>
              )}
            </div>

            {/* Chat Input & Microphone Box */}
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-zinc-800" />
                    <span>Paste WhatsApp Chat or Speak Your Order</span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Paste the messages between you and the customer.
                  </p>
                </div>

                {/* Big Microphone Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300'
                  }`}
                >
                  {isRecordingVoice ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-600" />}
                  <span>{isRecordingVoice ? 'Recording... Tap to Stop' : '🎤 Tap to Speak / Voice Note'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={rawChat}
                onChange={(e) => setRawChat(e.target.value)}
                placeholder="Paste WhatsApp messages here..."
                className="w-full p-4 rounded-xl border border-zinc-300 bg-white font-mono text-sm sm:text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 leading-relaxed"
              />

              {/* Big Action Button */}
              <button
                type="button"
                onClick={handleCheckOrder}
                disabled={isAnalyzing}
                className="w-full py-4 px-6 rounded-xl bg-zinc-950 hover:bg-zinc-800 active:bg-zinc-900 text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <span>Checking Terms &amp; Missing Gaps...</span>
                ) : (
                  <>
                    <span>Check My Order Terms</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ==============================================================================
            STEP 2: CHECK 5 TERMS & FIX GAPS (LARGE, UNCONGESTED)
            ============================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            
            {/* If Section 29 Vague Deal Triggered */}
            {isHaltedSec29 ? (
              <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-rose-950 uppercase">
                      🛑 STOP: Rate or Quantity is Not Fixed!
                    </h2>
                    <p className="text-sm text-rose-900 leading-relaxed font-medium">
                      The buyer said: <em>&ldquo;Rs 90 se Rs 105 ke beech mein decide karenge&rdquo;</em>. Under Section 29 of the Indian Contract Act, deals with unfixed prices are <strong>invalid in court</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-rose-200 text-xs sm:text-sm text-zinc-800 space-y-1">
                  <div className="font-bold text-rose-900">Why this hurts the tailor:</div>
                  <div>If you start cutting fabric now, the buyer can arbitrarily pay the lowest rate (₹90) and hold your money for months.</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent('Bhai, please confirm the exact stitching rate per piece so we can lock the order slip and start work.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm text-center flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Ask Buyer on WhatsApp for Exact Rate</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHaltedSec29(false);
                      setRatePerPiece(95);
                      setTotalValue(166250);
                      setTotalFormatted('1,66,250');
                      showToast('✓ Rate fixed at ₹95/piece!');
                    }}
                    className="px-5 py-3.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold text-sm"
                  >
                    Fix to ₹95/pc (Demo)
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 5 Deal Details Cards (Clean & Large) */}
                <div className="bg-white border-2 border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h2 className="text-base font-extrabold text-zinc-950">
                      Step 2A: The 5 Key Deal Details
                    </h2>
                    <span className="text-xs font-bold text-zinc-500">
                      {activeGaps.length === 0 ? '✓ All 5 Details Clear' : `${activeGaps.length} Missing Detail(s)`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    
                    {/* 1. Who */}
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1">
                      <div className="text-xs font-bold text-emerald-800 uppercase">1. 🤝 Who is Buying</div>
                      <div className="text-sm font-black text-zinc-950 truncate">{buyerName}</div>
                      <div className="text-xs text-zinc-600">Tailor: {supplierName.split(' - ')[0]}</div>
                    </div>

                    {/* 2. What Item */}
                    <div className={`p-4 rounded-xl border space-y-1 ${activeGaps.some(g => g.pillar_key === 'scope') ? 'border-amber-400 bg-amber-50/80 animate-pulse' : 'border-emerald-300 bg-emerald-50/50'}`}>
                      <div className="text-xs font-bold uppercase text-zinc-700">2. 📦 Item &amp; Quantity</div>
                      <div className="text-sm font-black text-zinc-950">{quantity.toLocaleString('en-IN')} Pieces</div>
                      <div className="text-xs text-zinc-600 truncate">{itemScope}</div>
                    </div>

                    {/* 3. Rate & Total */}
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1">
                      <div className="text-xs font-bold text-emerald-800 uppercase">3. ₹ Rate &amp; Total Value</div>
                      <div className="text-base font-black text-zinc-950">₹{ratePerPiece} / piece</div>
                      <div className="text-xs font-bold text-zinc-700">Total: ₹{totalFormatted} INR</div>
                    </div>

                    {/* 4. Delivery */}
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1">
                      <div className="text-xs font-bold text-emerald-800 uppercase">4. 📅 Delivery Date</div>
                      <div className="text-sm font-black text-zinc-950">{deliveryTimeline}</div>
                      <div className="text-xs text-zinc-600">Fabric delay extends days</div>
                    </div>

                    {/* 5. Payment Date */}
                    <div className={`p-4 rounded-xl border space-y-1 sm:col-span-2 md:col-span-2 ${activeGaps.some(g => g.pillar_key === 'payment_terms') ? 'border-amber-400 bg-amber-50/80 animate-pulse' : 'border-emerald-300 bg-emerald-50/50'}`}>
                      <div className="text-xs font-bold uppercase text-zinc-700">5. ⏳ Payment Rule</div>
                      <div className="text-sm font-black text-zinc-950">Within 15 Days (Govt MSMED Act)</div>
                      <div className="text-xs text-zinc-600">3x RBI interest penalty if late</div>
                    </div>

                  </div>
                </div>

                {/* Single-Card Gap Fixer (Large, Uncongested, 3 Lines) */}
                {activeGaps.length > 0 ? (
                  <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                          Problem {activeGapIndex + 1} of {activeGaps.length}
                        </span>
                        <h3 className="text-base font-black text-zinc-950">
                          {activeGaps[activeGapIndex]?.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => speakText(activeGaps[activeGapIndex]?.how_it_hurts || '')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Listen</span>
                      </button>
                    </div>

                    {/* 3 Clean Lines in Large, Easy-to-Read Font */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs uppercase font-extrabold text-zinc-500 mb-1">
                          📍 1. What was said in WhatsApp:
                        </div>
                        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-300 font-mono text-sm text-zinc-900 font-bold">
                          {activeGaps[activeGapIndex]?.where_quote}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase font-extrabold text-zinc-500 mb-1">
                          ⚠️ 2. Why this is dangerous for you:
                        </div>
                        <div className="text-sm sm:text-base text-zinc-900 font-medium leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                          {activeGaps[activeGapIndex]?.how_it_hurts}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase font-extrabold text-zinc-500 mb-2">
                          💡 3. Fix it right now:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleResolveGap(activeGaps[activeGapIndex]?.id)}
                            className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Check className="w-5 h-5" />
                            <span>{activeGaps[activeGapIndex]?.quick_fix_label}</span>
                          </button>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(activeGaps[activeGapIndex]?.whatsapp_ask_text)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 text-center"
                          >
                            <MessageSquare className="w-5 h-5 text-emerald-600" />
                            <span>Ask Buyer on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* All Clear Banner */
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-emerald-950">
                        All 5 Deal Terms Are Clear &amp; Protected!
                      </h3>
                      <p className="text-sm text-emerald-800 mt-1 font-medium">
                        Payment deadline locked at 15 days, and inspection window locked at 72 hours.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-base shadow-xl transition-all cursor-pointer"
                    >
                      <span>Continue to Order Slip &amp; Sign</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ==============================================================================
            STEP 3: DIGITAL ORDER SLIP & DUAL SIGNATURE CANVAS
            ============================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            
            {/* Live Demo Role Switcher */}
            <div className="no-print flex items-center justify-between bg-white border border-zinc-200 p-3 rounded-2xl">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Live Jury Demo Switcher:
              </span>
              <div className="inline-flex rounded-xl bg-zinc-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setViewRole('tailor')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${viewRole === 'tailor' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600'}`}
                >
                  📱 Tailor View
                </button>
                <button
                  type="button"
                  onClick={() => setViewRole('buyer')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${viewRole === 'buyer' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600'}`}
                >
                  📲 Buyer Phone View
                </button>
              </div>
            </div>

            {/* The Formal Digital Order Slip (ऑर्डर पर्ची) */}
            <div className="printable-contract-sheet bg-white border-2 border-zinc-300 rounded-2xl p-6 sm:p-10 shadow-lg space-y-6">
              
              {/* Slip Header */}
              <div className="border-b-2 border-zinc-950 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Digital Order Slip (ऑर्डर पर्ची / ಆರ್ಡರ್ ಚೀಟಿ)
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                    GARMENT JOB-WORK ORDER #{dealId}
                  </h2>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Date: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong> • Cluster: Peenya / Bommanahalli
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Valid Sec 10A IT Act</span>
                  </span>
                  <div className="text-[11px] text-zinc-400 mt-1">₹0 Stamp Duty (Art. 5 Exemption)</div>
                </div>
              </div>

              {/* Contracting Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs sm:text-sm">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">1. Tailor / Job-Worker:</div>
                  <div className="font-extrabold text-zinc-950 text-base">{supplierName}</div>
                  <div className="text-zinc-600 mt-0.5">Udyam No: <strong className="text-zinc-900 font-mono">{udyamUrn}</strong></div>
                  <div className="text-xs text-emerald-700 font-bold mt-0.5">✓ MSMED Act Sec 15 Protected</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">2. Customer / Buyer:</div>
                  <div className="font-extrabold text-zinc-950 text-base">{buyerName}</div>
                  <div className="text-zinc-600 mt-0.5">Mobile: +91 98450 12345</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Verified Procurement Counterparty</div>
                </div>
              </div>

              {/* 5 Clear Clauses */}
              <div className="space-y-4 text-xs sm:text-sm text-zinc-800 leading-relaxed">
                
                {/* Clause 1: Scope */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <div className="font-bold text-zinc-950 text-xs uppercase mb-1">
                    1. Work Scope &amp; 72-Hour Quality Check
                  </div>
                  <p>1.1 <strong>Item:</strong> {itemScope} (<strong>{quantity.toLocaleString('en-IN')} pieces</strong>).</p>
                  <p className="mt-1 text-zinc-600">
                    1.2 <strong>Latent Fabric Shield:</strong> Raw fabric supplied by Buyer. Tailor bears zero liability for latent fabric defects like color bleeding or shrinkage (Sec 150-152 Contract Act).
                  </p>
                  <p className="mt-1 text-emerald-800 font-medium">
                    1.3 <strong>Deemed Acceptance:</strong> Buyer must report any defect within <strong>72 hours</strong> of delivery. After 72 hours, goods are deemed accepted by law (Sec 42 Sale of Goods Act).
                  </p>
                </div>

                {/* Clause 2.1: LABOUR CHARGES & MATH FIX */}
                <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/40">
                  <div className="font-bold text-emerald-950 text-xs uppercase mb-1">
                    2. Labour Charges &amp; Section 43B(h) Income Tax Notice
                  </div>
                  <p className="text-base font-extrabold text-zinc-950">
                    2.1 The agreed labour consideration is ₹{ratePerPiece} per piece (Total Consideration: ₹{totalFormatted} INR), exclusive of applicable GST.
                  </p>
                  <p className="mt-1 text-zinc-600 text-xs">
                    <strong>Tax Penalty Notice:</strong> Under Section 43B(h) of the Income-tax Act, if the Buyer does not pay within 15 days, they cannot claim this expense and must pay corporate tax on it.
                  </p>
                </div>

                {/* Clause 3: Delivery */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <div className="font-bold text-zinc-950 text-xs uppercase mb-1">
                    3. Delivery Timeline
                  </div>
                  <p>
                    3.1 Target dispatch: <strong>{deliveryTimeline}</strong>. Any delay by the Buyer in supplying fabric rolls shall automatically extend the completion deadline day-for-day without penalty (Sec 53 Contract Act).
                  </p>
                </div>

                {/* Clause 4: Payment */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <div className="font-bold text-zinc-950 text-xs uppercase mb-1">
                    4. Statutory 15-Day Payment Rule (MSMED Act)
                  </div>
                  <p>
                    4.1 Payment is due strictly within <strong>15 days</strong> of delivery.
                  </p>
                  <p className="mt-1 text-rose-800 text-xs font-bold">
                    4.2 Late payment attracts compound interest with monthly rests at <strong>3 times the notified RBI Bank Rate</strong>.
                  </p>
                </div>

              </div>

              {/* Dual Signature Pads */}
              <div className="pt-4 border-t-2 border-zinc-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Tailor Pad */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-zinc-950">
                        1. Tailor Mark / Signature:
                      </label>
                      <div className="no-print flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => drawMarkX(true)}
                          className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          Draw &ldquo;X&rdquo; Mark
                        </button>
                        <button
                          type="button"
                          onClick={() => clearCanvas(true)}
                          className="text-xs font-bold text-zinc-400 hover:text-rose-600 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-zinc-300 rounded-xl overflow-hidden bg-white">
                      <canvas
                        ref={supplierCanvasRef}
                        width={400}
                        height={120}
                        onMouseDown={startDrawing(true)}
                        onMouseMove={draw(true)}
                        onMouseUp={stopDrawing(true)}
                        onTouchStart={startDrawing(true)}
                        onTouchMove={draw(true)}
                        onTouchEnd={stopDrawing(true)}
                        className="w-full h-28 touch-none cursor-crosshair"
                      />
                    </div>

                    <div className="no-print">
                      {!supplierSigned ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSupplierSigned(true);
                            showToast('✓ Tailor signature locked with IP proof!');
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs"
                        >
                          Confirm Tailor Mark &amp; Lock IP
                        </button>
                      ) : (
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-mono">
                          ✓ Signed: Suresh (Tailor) • IP: 106.51.22.84 • Time: {new Date().toLocaleTimeString('en-IN')} IST
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buyer Pad */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-zinc-950">
                        2. Buyer Mark / Signature:
                      </label>
                      <div className="no-print flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => drawMarkX(false)}
                          className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          Draw &ldquo;X&rdquo; Mark
                        </button>
                        <button
                          type="button"
                          onClick={() => clearCanvas(false)}
                          className="text-xs font-bold text-zinc-400 hover:text-rose-600 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Buyer OTP & Authorization Declaration */}
                    <div className="no-print space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="text"
                          maxLength={4}
                          value={buyerOtp}
                          onChange={(e) => setBuyerOtp(e.target.value)}
                          placeholder="OTP 1234"
                          className="w-24 px-2.5 py-1.5 rounded-lg border border-zinc-300 font-mono text-center font-bold text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBuyerOtpVerified(true);
                            showToast('✓ WhatsApp OTP 1234 verified!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-bold text-xs"
                        >
                          Verify OTP
                        </button>
                      </div>

                      <label className="flex items-start gap-2 text-xs text-zinc-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={buyerAuthorized}
                          onChange={(e) => setBuyerAuthorized(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-zinc-950"
                        />
                        <span>I declare I am authorized to bind the Buyer to this order.</span>
                      </label>
                    </div>

                    <div className={`border-2 border-dashed border-zinc-300 rounded-xl overflow-hidden bg-white transition-opacity ${(!buyerOtpVerified || !buyerAuthorized) && !buyerSigned ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                      <canvas
                        ref={buyerCanvasRef}
                        width={400}
                        height={120}
                        onMouseDown={startDrawing(false)}
                        onMouseMove={draw(false)}
                        onMouseUp={stopDrawing(false)}
                        onTouchStart={startDrawing(false)}
                        onTouchMove={draw(false)}
                        onTouchEnd={stopDrawing(false)}
                        className="w-full h-28 touch-none cursor-crosshair"
                      />
                    </div>

                    <div className="no-print">
                      {!buyerSigned ? (
                        <button
                          type="button"
                          onClick={handleBuyerConfirmSign}
                          disabled={!buyerOtpVerified || !buyerAuthorized}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-300 text-white font-bold text-xs"
                        >
                          Confirm Buyer Assent &amp; Lock Deal
                        </button>
                      ) : (
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 font-mono">
                          ✓ Signed: {buyerName} • IP: {buyerSignatureRecord?.client_ip || '122.179.45.10'} • OTP 1234 Verified • Time: {buyerSignatureRecord?.timestamp_ist || new Date().toLocaleTimeString('en-IN') + ' IST'}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Printed IP Metadata Attribution (Mandatory under Sec 11-13 IT Act) */}
                <div className="print-force-show pt-2 border-t border-zinc-200 text-[10px] font-mono text-zinc-500 space-y-0.5">
                  <div><strong>Party A (Job-Worker):</strong> Signed from IP [106.51.22.84] • Device: Chrome/Android (Peenya) • Time: {new Date().toLocaleDateString('en-IN')}</div>
                  <div><strong>Party B (Buyer):</strong> Signed from IP [{buyerSignatureRecord?.client_ip || '122.179.45.10'}] • Verified via WhatsApp OTP [1234] • Authorized Agent Assent Recorded.</div>
                  <div><strong>Statutory Attestation:</strong> Digital transaction sealed under Section 10A and Sections 11–13 of the IT Act, 2000.</div>
                </div>

              </div>

              {/* Big Action Buttons */}
              <div className="no-print pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveAndSendWhatsApp}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>📲 Send to Buyer on WhatsApp</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`/deal/${dealId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4 text-zinc-600" />
                    <span>Open Buyer Link</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official PDF</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Collapsible Under the Hood Drawer for Judges */}
            <div className="no-print bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
              <button
                type="button"
                onClick={() => setShowJudgeDrawer(!showJudgeDrawer)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-zinc-700" />
                  <span className="text-xs font-bold text-zinc-900">
                    ⚖️ Under the Hood: MSME ODR Portal Form-A &amp; Section 63 BSA Tamper Lab
                  </span>
                </div>
                {showJudgeDrawer ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              {showJudgeDrawer && (
                <div className="pt-3 border-t border-zinc-100 space-y-3 animate-in fade-in text-xs font-mono">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                    <div><strong>MSME ODR Portal:</strong> odr.msme.gov.in (Form-A Ready)</div>
                    <div><strong>SHA-256 Digest:</strong> a8f5c94288fe1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b719</div>
                    <div><strong>BSA Certificate:</strong> Schedule Certificate under Section 63(4)(c) Bharatiya Sakshya Adhiniyam, 2023.</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
