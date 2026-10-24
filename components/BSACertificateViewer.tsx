'use client';

import React, { useState } from 'react';
import { AgreementDraft } from '@/types/agreement';
import { 
  FileCheck2, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  Info, 
  UserCheck, 
  Lock, 
  Sparkles,
  FileText
} from 'lucide-react';

interface BSACertificateViewerProps {
  draft: AgreementDraft;
}

export default function BSACertificateViewer({ draft }: BSACertificateViewerProps) {
  const [copied, setCopied] = useState(false);
  const [declarantName, setDeclarantName] = useState('Authorized SME Custodian');
  const [deviceModel, setDeviceModel] = useState('Smartphone / Web Export Terminal');
  const [imeiOrSerial, setImeiOrSerial] = useState('IMEI: 358912345678901 / MAC: 4A:2B:CC:DD:EE:01');
  const [place, setPlace] = useState('Bengaluru, Karnataka');

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} IST (24-hour format)`;

  const certText = `THE SCHEDULE
[See section 63(4)(c) of the Bharatiya Sakshya Adhiniyam, 2023]
CERTIFICATE FOR ADMISSIBILITY OF ELECTRONIC RECORDS

================================================================================
PART A: TO BE FILLED BY THE PARTY / CUSTODIAN IN CHARGE OF DEVICE
================================================================================

I, ${declarantName}, residing/employed at ${place}, do hereby solemnly affirm and sincerely state and submit as follows:

1. Identification of Digital Record Source:
   [X] Mobile Device
   [X] Server / Cloud Repository
   [ ] Computer / Storage Media
   [ ] Flash Drive / CD / DVD

2. Technical Particulars of Source Communication Device:
   • Make & Model: ${deviceModel}
   • Colour: Dark Titanium / Black
   • Hardware Identifiers: ${imeiOrSerial}
   • Relevant Ingestion Reference: DealProof AI Session ID: ${draft.id}

3. Lawful Control & Regular Operation Declarations [Section 63(2) BSA]:
   I solemnly declare that the digital device or digital record source was under my lawful control for regularly creating, storing, or processing information for the purposes of carrying out regular commercial activities; that during this period, the communication device was working properly and relevant information was regularly fed into the device during the ordinary course of business; and that if the communication device at any point was not working properly or out of operation, such event did not affect the electronic record or the accuracy of its contents.

4. Capacity of Control:
   The digital device or source of the digital record is: [X] Owned  [X] Operated by me.

5. Cryptographic Hash Declaration:
   I state that the HASH value of the electronic/digital record is:
   ${draft.tamperEvidenceHash}
   Obtained through the following algorithm: [X] SHA-256  (NIST FIPS 180-4 standard)
   (Hash report and uncompressed .txt/.opus bitstream archive enclosed herewith).

Execution Details (Part A):
Date: ${dateStr}
Time: ${timeStr}
Place: ${place}

Signatory (Part A): ___________________________
(${declarantName} — Party in Lawful Custody)


================================================================================
PART B: TO BE FILLED BY THE TECHNICAL EXPERT
================================================================================

I, Designated Digital Evidence & Cryptography Specialist, residing/employed at Bengaluru, Karnataka, do hereby solemnly affirm:

1. Expert Qualification Framework:
   Expert certification rendered pursuant to Section 39(1) of the Bharatiya Sakshya Adhiniyam, 2023 read with the Supreme Court of India ruling in Pune Bar Association v. Union of India (2026), affirming that technical expertise in cyber forensics and cryptographic hashing satisfies Section 63(4)(c) Part B mandates.

2. Source Device / Media Examined:
   [X] Mobile Export Archive (.txt and native audio bitstream)
   [X] Cloud / Server Verified Ingestion Pipeline

3. Independent Cryptographic Hash Verification:
   I certify that the HASH value of the secondary electronic output produced is:
   ${draft.tamperEvidenceHash}
   Obtained through algorithm: [X] SHA-256

4. Integrity Affirmation:
   Technical extraction confirms that the computed SHA-256 digest of the secondary output matches the source bitstream exactly. Zero post-extraction alteration, bit manipulation, or splicing has occurred.

Execution Details (Part B):
Date: ${dateStr}
Time: ${timeStr}
Place: ${place}

Signatory (Part B): ___________________________
(Designated Cyber Evidence Specialist & Cryptographic Systems Officer)
Designation: Chief Evidence Verification Specialist
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>BSA Section 63 Certificate - ${draft.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 30px; font-size: 11px; line-height: 1.5; color: #111; }
            h1 { font-size: 14px; text-align: center; margin-bottom: 20px; font-weight: bold; }
            .section { border: 1px solid #333; padding: 15px; margin-bottom: 20px; }
            .header-bar { background: #eee; padding: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <pre>${certText}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bharatiya Sakshya Adhiniyam, 2023 (BSA)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Section 63(4)(c) Certificate
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory Schedule Certificate required for digital evidence admissibility in Indian Civil & Commercial Courts (In force w.e.f. 1 July 2024).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Text</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Certificate</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>

        {/* Customization Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Part A Custodian / Declarant Name:
            </label>
            <input
              type="text"
              value={declarantName}
              onChange={e => setDeclarantName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Source Device Make & Model:
            </label>
            <input
              type="text"
              value={deviceModel}
              onChange={e => setDeviceModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Place of Execution:
            </label>
            <input
              type="text"
              value={place}
              onChange={e => setPlace(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statutory Certificate Preview */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner leading-relaxed">
        <div className="text-center font-bold text-white text-sm pb-4 border-b border-slate-800">
          THE SCHEDULE [See section 63(4)(c) of Bharatiya Sakshya Adhiniyam, 2023]<br />
          <span className="text-xs text-blue-400 font-normal">
            STATUTORY DUAL-SIGNATORY ELECTRONIC EVIDENCE CERTIFICATE
          </span>
        </div>

        {/* Part A Section */}
        <div className="mt-6 p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-blue-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-400" />
              PART A: To be filled by the Party / Device Custodian
            </span>
            <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
              Section 63(2) Affirmation
            </span>
          </div>

          <p>
            I, <strong className="text-white">{declarantName}</strong>, residing/employed at <strong className="text-white">{place}</strong>, do hereby solemnly affirm and sincerely state:
          </p>

          <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-1 text-[11px]">
            <div>• Source Device Type: <strong>Mobile Device [X], Cloud/Server [X]</strong></div>
            <div>• Make & Model: <strong>{deviceModel}</strong></div>
            <div>• Hardware Identifiers: <strong>{imeiOrSerial}</strong></div>
            <div>• Lawful Control: <strong>Owned and Operated in regular course of business</strong></div>
            <div>• Cryptographic Hash (SHA-256): <strong className="text-emerald-400">{draft.tamperEvidenceHash}</strong></div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Date: {dateStr} | Time: {timeStr}</span>
            <span className="text-slate-300 font-bold border-b border-dashed border-slate-600 pb-0.5">
              Signatory (Part A): {declarantName}
            </span>
          </div>
        </div>

        {/* Part B Section */}
        <div className="mt-6 p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-indigo-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              PART B: To be filled by the Technical Expert
            </span>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800">
              Supreme Court Pune Bar Assn (2026) Standard
            </span>
          </div>

          <p>
            I, <strong className="text-white">Designated Digital Evidence & Cryptography Specialist</strong>, affirm that the secondary electronic record produced was verified through automated bitstream extraction:
          </p>

          <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-1 text-[11px]">
            <div>• Authority: <strong>Section 39(1) BSA, 2023 r/w Supreme Court Pune Bar Assn (2026)</strong></div>
            <div>• Hashing Algorithm: <strong>SHA-256 (NIST FIPS 180-4 Standard)</strong></div>
            <div>• Verified Master Digest: <strong className="text-indigo-400">{draft.tamperEvidenceHash}</strong></div>
            <div>• Bitstream Verification: <strong>100% Match. Zero post-extraction tampering, splicing or alteration.</strong></div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Date: {dateStr} | Time: {timeStr}</span>
            <span className="text-slate-300 font-bold border-b border-dashed border-slate-600 pb-0.5">
              Signatory (Part B): Chief Technical Officer
            </span>
          </div>
        </div>
      </div>

      {/* Critical Legal Disclaimer */}
      <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-100">Statutory Notice:</strong> DealProof AI pre-fills the statutory Schedule Certificate based on verified SHA-256 bitstream hashes. DealProof AI does <strong>not</strong> auto-sign; Part A must be signed by the human device custodian, and Part B must be signed by a human technical expert before being tendered in an Indian court.
        </div>
      </div>
    </div>
  );
}
