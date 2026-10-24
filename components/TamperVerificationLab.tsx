'use client';

import React, { useState } from 'react';
import { AgreementDraft } from '@/types/agreement';
import { computeSha256 } from '@/lib/crypto/hash';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';

interface TamperVerificationLabProps {
  draft: AgreementDraft;
}

export default function TamperVerificationLab({ draft }: TamperVerificationLabProps) {
  const [testText, setTestText] = useState(draft.extractedData.rawConversation);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isMatch: boolean;
    storedHash: string;
    newHash: string;
    tamperedCharacters: number;
  } | null>(null);

  const storedHash = draft.extractedData.tamperEvidenceHash;

  const handleRunTamperTest = async () => {
    setIsVerifying(true);

    // Compute hash over the test text using the normalized signature payload
    const normalized = testText.trim().replace(/\r\n/g, '\n');
    const newHash = await computeSha256(
      [
        'dealproof-v1',
        normalized,
        draft.extractedData.partyA.name.trim().toLowerCase(),
        draft.extractedData.partyB.name.trim().toLowerCase(),
        draft.extractedData.scopeOrProducts.value.trim().toLowerCase(),
        draft.extractedData.price.value.trim().toLowerCase(),
        draft.extractedData.paymentTerms.value.trim().toLowerCase(),
        draft.extractedData.deliveryTimeline.value.trim().toLowerCase(),
      ].join(':::')
    );

    const isMatch = newHash === storedHash;
    const diffCount = Math.abs(testText.length - draft.extractedData.rawConversation.length);

    setComputedHash(newHash);
    setVerificationResult({
      isMatch,
      storedHash,
      newHash,
      tamperedCharacters: isMatch ? 0 : diffCount > 0 ? diffCount : 1,
    });
    setIsVerifying(false);
  };

  const handleInjectTamperSample = () => {
    // Modify a critical term in the text to demonstrate tamper detection
    let tampered = testText;
    if (tampered.includes('50,000')) {
      tampered = tampered.replace('50,000', '95,000');
    } else if (tampered.includes('10 days')) {
      tampered = tampered.replace('10 days', '2 days');
    } else {
      tampered = tampered + ' [ALTERED: Unauthorized 10% penalty clause inserted]';
    }
    setTestText(tampered);
    setVerificationResult(null);
  };

  const handleReset = () => {
    setTestText(draft.extractedData.rawConversation);
    setComputedHash(null);
    setVerificationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cryptographic Tamper-Detection Lab</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Live Judging Sandbox
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test the cryptographic immutability of the deal record. Edit a single character, price, or date to see the collision alert trigger in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleInjectTamperSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Malicious Edit</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Stored Digest Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Original Certified Digest:</span>
            <code className="text-emerald-400 font-mono font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900">
              {storedHash}
            </code>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Algorithm: SHA-256 (NIST FIPS 180-4)</span>
        </div>
      </div>

      {/* Interactive Sandbox Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Editable Sandbox Textarea */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Conversation Payload Sandbox
            </span>
            <span className="text-[11px] text-slate-400">
              Try modifying a number, date, or word below
            </span>
          </div>

          <textarea
            rows={7}
            value={testText}
            onChange={e => setTestText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Payload length: {testText.length} characters
            </span>

            <button
              type="button"
              onClick={handleRunTamperTest}
              disabled={isVerifying}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isVerifying ? 'Hashing...' : 'Verify Bitstream Integrity'}</span>
            </button>
          </div>
        </div>

        {/* Right: Verification Output Result */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block mb-3">
              Cryptographic Integrity Verdict
            </span>

            {verificationResult ? (
              verificationResult.isMatch ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>AUTHENTIC & UNALTERED</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    100% Cryptographic Match. The recomputed SHA-256 digest exactly mirrors the original certified seal. Zero bitstream manipulation detected.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 break-all bg-slate-950 p-2 rounded border border-emerald-900">
                    {verificationResult.newHash}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <span>TAMPERING DETECTED!</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    Cryptographic Collision Alert! The payload has been modified post-export. Due to the <strong>SHA-256 avalanche effect</strong>, the hash diverged completely.
                  </p>
                  <div className="space-y-1 text-[10px] font-mono">
                    <div className="text-slate-400">Stored Hash:</div>
                    <div className="text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800 break-all">
                      {verificationResult.storedHash}
                    </div>
                    <div className="text-rose-400 pt-1">Computed Hash:</div>
                    <div className="text-rose-300 bg-slate-950 p-1.5 rounded border border-rose-900 break-all">
                      {verificationResult.newHash}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">
                  Click <strong>&ldquo;Verify Bitstream Integrity&rdquo;</strong> to run a live cryptographic audit against the stored master digest.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
            <strong>Why this matters in court:</strong> Under Section 63 BSA, 2023, the opposing party cannot claim selective cropping or doctored screenshots when the SHA-256 bitstream digest matches.
          </div>
        </div>
      </div>
    </div>
  );
}
