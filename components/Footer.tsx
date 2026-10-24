import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Scale, CheckCircle2, GitBranch, Heart } from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Disclaimer Strip */}
      <div className="bg-amber-950/40 border-b border-amber-900/40 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-normal">
            <strong className="font-semibold text-amber-100">Official Legal Tech Notice: </strong>
            {LEGAL_DISCLAIMER} No automated draft substitutes for state stamp duty requirements or advice from a certified legal advocate.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About DealProof AI */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                DP
              </div>
              <span className="font-bold text-white text-base">DealProof AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Converting informal chats and verbal agreements into structured, reviewable contract drafts with missing-term detection and cryptographic tamper-evident records.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              Built for <strong className="text-slate-300">Srujana Tech Fest 2026</strong> (Problem LS-06).
            </div>
          </div>

          {/* Col 2: Problem Statement LS-06 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Problem LS-06</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• From Handshake to Contract</li>
              <li>• Informal MSME Agreements</li>
              <li>• Ambiguity & Missing Term Triage</li>
              <li>• SHA-256 Audit Trail Traceability</li>
              <li>• Plain-Language Bilateral Drafts</li>
            </ul>
          </div>

          {/* Col 3: Engineering Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Architecture & Tech</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Next.js 16 (App Router) + TypeScript</li>
              <li>• Tailwind CSS & Lucide Icons</li>
              <li>• Zod Strict Schema Validation</li>
              <li>• Deterministic Rule Engine + Hybrid Gemini AI</li>
              <li>• Client-Side Vector PDF Export (jsPDF)</li>
            </ul>
          </div>

          {/* Col 4: Hackathon Team Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">4-Member Engineering Team</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• <span className="text-slate-300 font-medium">Member 1:</span> Frontend & UI/UX</li>
              <li>• <span className="text-slate-300 font-medium">Member 2:</span> Analysis & Ambiguity Engine</li>
              <li>• <span className="text-slate-300 font-medium">Member 3:</span> Agreement Gen & PDF Export</li>
              <li>• <span className="text-slate-300 font-medium">Member 4:</span> Storage, Security & Audit</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 DealProof AI Team. Srujana Tech Fest 2026 (24–26 October 2026).
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="hover:text-slate-300 underline-offset-4 hover:underline">
              Methodology & Limitations
            </Link>
            <span>•</span>
            <Link href="/create" className="hover:text-slate-300 underline-offset-4 hover:underline">
              Try Benchmark Demo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
