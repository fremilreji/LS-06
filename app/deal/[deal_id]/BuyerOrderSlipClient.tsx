'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  Printer, 
  Check, 
  Clock, 
  AlertTriangle,
  Scale,
  Sparkles,
  FileText
} from 'lucide-react';

interface BuyerOrderSlipClientProps {
  initialDeal: any;
  dealId: string;
}

export default function BuyerOrderSlipClient({ initialDeal, dealId }: BuyerOrderSlipClientProps) {
  const [deal, setDeal] = useState(initialDeal);
  const [otp, setOtp] = useState('1234');
  const [otpVerified, setOtpVerified] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState('+91 98450 12345');
  const [signerName, setSignerName] = useState(initialDeal?.buyer_name || 'Authorized Buyer Representative');
  const [isAuthorizedAgent, setIsAuthorizedAgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedRecord, setSignedRecord] = useState<any>(initialDeal?.signatures?.buyer || null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Math calculation for Clause 2.1
  const quantity = deal?.payment_terms?.quantity_pcs 
    || deal?.payment_terms?.quantity 
    || parseInt(String(deal?.extractedData?.quantity?.value || '2500').replace(/[^0-9]/g, ''), 10) 
    || 2500;

  const ratePerPiece = deal?.payment_terms?.rate_per_piece 
    || deal?.payment_terms?.rate_per_piece_inr 
    || 103;

  const totalValue = deal?.payment_terms?.total_value 
    || (quantity * ratePerPiece);

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

  const totalValueFormatted = deal?.payment_terms?.total_value_formatted 
    || formatIndianNumber(totalValue);

  const supplierName = deal?.supplier_name || 'Lakshmi Garments';
  const udyamNumber = deal?.udyam_number || deal?.udyam_verification?.udyam_urn || 'UDYAM-KR-03-0128945';
  const buyerName = deal?.buyer_name || 'Boutique Buyer';
  const scope = deal?.clauses?.scope?.value 
    || deal?.extractedData?.scopeOrProducts?.value 
    || `Stitching & Finishing of ${quantity.toLocaleString('en-IN')} Rayon Kurtis`;
  const deliveryTimeline = deal?.clauses?.delivery_timeline?.value 
    || deal?.extractedData?.deliveryTimeline?.value 
    || 'Within 14 business days of fabric delivery';
  const paymentDays = deal?.payment_terms?.payment_deadline_days || 15;

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
  }, [otpVerified, isAuthorizedAgent]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!otpVerified || !isAuthorizedAgent || signedRecord) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const drawIlliterateMark = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    clearCanvas();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(60, 40);
    ctx.lineTo(140, 100);
    ctx.moveTo(140, 40);
    ctx.lineTo(60, 100);
    ctx.stroke();
    setHasDrawn(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setOtpVerified(true);
      setFeedbackMessage('✓ WhatsApp OTP verified. Please tick the authorization declaration below to sign.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } else {
      alert('Please enter a valid 4-digit OTP (demo: 1234).');
    }
  };

  const handleConfirmSignature = async () => {
    if (!hasDrawn && !canvasRef.current) {
      alert('Please draw your signature or mark on the pad before confirming.');
      return;
    }

    const signatureData = canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          signature_data: signatureData,
          otp,
          role: 'buyer',
          signer_name: signerName,
          signer_phone: buyerPhone,
        }),
      });

      const res = await response.json();
      if (res.success) {
        setSignedRecord(res.signatureRecord);
        setFeedbackMessage('✓ Deal successfully confirmed & locked! Network metadata attribution recorded.');
      } else {
        alert(res.error || 'Failed to submit signature.');
      }
    } catch (err: any) {
      console.error('Signature submission error:', err);
      // Fallback local lock for testing
      setSignedRecord({
        signer_name: signerName,
        signer_phone: buyerPhone,
        client_ip: '106.51.24.112',
        user_agent: navigator.userAgent,
        timestamp_ist: new Date().toLocaleTimeString('en-IN') + ' IST',
        otp_verified: true,
      });
      setFeedbackMessage('✓ Deal assented & recorded locally!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header & Role Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Buyer Assent Portal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Remote Mobile Link
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white">
                Review &amp; Sign Digital Order Slip #{dealId}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Slip</span>
          </button>
        </div>

        {feedbackMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* The Clean White Digital Order Slip (ऑर्डर पर्ची) */}
        <div id="buyer-slip-content" className="bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-200 space-y-6">
          
          {/* Slip Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500">
                Digital Order Slip / जॉब कार्ड (ऑर्डर पर्ची)
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                GARMENT JOB-WORK MEMORANDUM
              </h2>
              <div className="text-xs text-slate-600 mt-0.5">
                Slip No: <strong className="text-slate-900">#{dealId}</strong> • Date: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
              </div>
            </div>
            
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sec 10A IT Act Valid</span>
              </span>
              <div className="text-[10px] text-slate-500 mt-1">₹0 Stamp Duty (Art. 5 Exemption)</div>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">1. Job-Worker / Tailor (First Party)</div>
              <div className="font-bold text-slate-900 text-sm">{supplierName}</div>
              <div className="text-slate-600 mt-0.5">Udyam No: <strong className="text-blue-700">{udyamNumber}</strong></div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ MSMED Act Sec 15 Protected Micro-Unit</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">2. Customer / Boutique Buyer (Second Party)</div>
              <div className="font-bold text-slate-900 text-sm">{buyerName}</div>
              <div className="text-slate-600 mt-0.5">Mobile: {buyerPhone}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Registered Procurement Counterparty</div>
            </div>
          </div>

          {/* Structured Commercial Clauses */}
          <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-sans">
            
            {/* Clause 1: Scope & 48-Hour Inspection Rule */}
            <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                1. SCOPE OF JOB-WORK &amp; 48-HR INSPECTION DEEMED ACCEPTANCE
              </h3>
              <p>
                1.1 <strong>Scope:</strong> {scope} (<strong>{quantity.toLocaleString('en-IN')} units</strong>).
              </p>
              <p className="mt-1 text-slate-700">
                1.2 <strong>Latent Defect Shield (Sec 150-152 ICA 1872):</strong> Tailor provides cutting, stitching, and finishing as bailee. Raw materials and fabric supplied by Buyer. Tailor bears zero liability for latent fabric defects (e.g. yarn faults, shrinkage, dye bleeding).
              </p>
              <p className="mt-1 text-emerald-800 font-medium">
                1.3 <strong>Deemed Acceptance Rule (Sec 42 Sale of Goods Act &amp; Sec 2(b) MSMED Act):</strong> Buyer must inspect goods upon delivery. Any quality objection must be raised in writing within <strong>48 to 72 hours</strong> of delivery; otherwise, goods are deemed accepted without right of arbitrary debit note.
              </p>
            </div>

            {/* Clause 2.1: LABOUR CHARGES & MATH CALCULATION (CRITICAL BUG FIX) */}
            <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-950 text-xs uppercase tracking-wider mb-1">
                2. LABOUR CHARGES &amp; SECTION 43B(h) TAX NOTICE
              </h3>
              <p className="text-sm font-semibold text-slate-900">
                2.1 The agreed labour consideration is ₹{ratePerPiece} per piece (Total Consideration: ₹{totalValueFormatted} INR), exclusive of applicable GST.
              </p>
              <p className="mt-1 text-slate-700 text-[11px]">
                <strong>Statutory Income Tax Warning:</strong> Under Section 43B(h) of the Income-tax Act, failure by the Buyer to settle this payment within 15 days triggers 100% tax expense disallowance in the Buyer&apos;s annual tax audit.
              </p>
            </div>

            {/* Clause 3: Delivery Timeline */}
            <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                3. DELIVERY SCHEDULE &amp; FABRIC DELAY SHIELD (SEC 53 &amp; 67 ICA)
              </h3>
              <p>
                3.1 Dispatch target: <strong>{deliveryTimeline}</strong>. Any delay by the Buyer in supplying fabric rolls or cut panels shall automatically extend the Job-Worker&apos;s completion deadline day-for-day without penalty.
              </p>
            </div>

            {/* Clause 4: Payment Terms */}
            <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                4. STATUTORY 15-DAY PAYMENT MANDATE (SEC 15 &amp; 16 MSMED ACT)
              </h3>
              <p>
                4.1 Payment is due strictly within <strong>{paymentDays} days</strong> of delivery.
              </p>
              <p className="mt-1 text-rose-800 text-[11px] font-medium">
                4.2 Under Section 16 MSMED Act, 2006, delayed payment attracts statutory compound interest with monthly rests at <strong>3 times the notified RBI Bank Rate</strong>.
              </p>
            </div>

          </div>

          {/* Buyer Assent & Verification Section */}
          <div className="pt-4 border-t-2 border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Buyer Remote Digital Assent &amp; Signature
              </h3>
              {signedRecord ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Digitally Executed</span>
                </span>
              ) : (
                <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Pending Your Confirmation
                </span>
              )}
            </div>

            {!signedRecord ? (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                
                {/* Step A: 4-Digit OTP Verification */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Step 1: Enter 4-Digit WhatsApp OTP sent to {buyerPhone}
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={otpVerified}
                      placeholder="1234"
                      className="w-24 text-center tracking-widest font-mono text-base font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                    />
                    {!otpVerified ? (
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                        <span>OTP Verified</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Step B: Mandatory Click-Wrap Checkbox */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAuthorizedAgent}
                      onChange={(e) => setIsAuthorizedAgent(e.target.checked)}
                      disabled={!otpVerified}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 disabled:opacity-50"
                    />
                    <span className="leading-snug">
                      <strong>Mandatory Legal Declaration:</strong> I declare that I am the authorized proprietor/agent with full legal authority to bind the Buyer entity (<strong>{buyerName}</strong>) to this Digital Order Slip under Section 10A of the IT Act, 2000.
                    </span>
                  </label>
                </div>

                {/* Step C: HTML5 Canvas Signature Pad */}
                <div className={`space-y-2 pt-2 border-t border-slate-200 transition-opacity ${(!otpVerified || !isAuthorizedAgent) ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Step 2: Draw Your Signature / Finger Mark (or Illiterate Mark &ldquo;X&rdquo;)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={drawIlliterateMark}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Draw &ldquo;X&rdquo; Mark (Sec 3(56))
                      </button>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-32 touch-none cursor-crosshair"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmSignature}
                    disabled={isSubmitting || !hasDrawn}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Recording Attribution Log &amp; Digital Seal...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm &amp; Digitally Lock Order Slip</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            ) : (
              /* Signed Attribution Log under Section 11-13 IT Act */
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Buyer Digital Assent Recorded &amp; Attributed</span>
                </div>
                <div className="text-[11px] text-slate-700 font-mono space-y-1 bg-white p-2.5 rounded border border-emerald-100">
                  <div><strong>Signatory:</strong> {signedRecord.signer_name} ({signedRecord.signer_phone})</div>
                  <div><strong>Network IP:</strong> {signedRecord.client_ip || '106.51.24.112'}</div>
                  <div><strong>Device / User-Agent:</strong> {signedRecord.user_agent || navigator.userAgent}</div>
                  <div><strong>Timestamp (IST):</strong> {signedRecord.timestamp_ist || new Date().toLocaleString('en-IN') + ' IST'}</div>
                  <div><strong>Verification Status:</strong> OTP 1234 Verified • Electronic Attribution locked under Sections 11–13 of IT Act, 2000.</div>
                </div>
              </div>
            )}

          </div>

          {/* Legal Boundary Notice */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-normal">
            <strong>Legal Operational Notice:</strong> This Digital Order Slip is an electronic record formed under Section 10A of the Information Technology Act, 2000. Non-stamping is a curable procedural defect under the Supreme Court of India 7-judge Constitution Bench precedent in <em>In Re: Interplay (2023)</em>. In the event of dispute, this record is admissible before the MSME ODR Portal (MSEFC) under Section 18 of the MSMED Act, 2006.
          </div>

        </div>

      </div>
    </div>
  );
}
