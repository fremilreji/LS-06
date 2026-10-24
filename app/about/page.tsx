import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Scale, 
  Users, 
  Code2, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/50">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Srujana Tech Fest 2026 • Legal Services Theme</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Problem LS-06: From Handshake to Contract
        </h1>
        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          Official problem statement context, technical architecture, 4-member engineering division, and legal tech disclosures.
        </p>
      </div>

      {/* Official Challenge Context */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Scale className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">The Official Challenge</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          A large share of small business dealings happen informally: a verbal commitment, a WhatsApp conversation confirming price and delivery, a voice note agreeing to a revised deadline. When a dispute arises, the business has no clean agreement to point to. Chats are scattered and ambiguous, and courts expect proper documentation and, in many cases, stamp duty paid under state rules. Owners avoid formal contracts because they seem expensive, slow, and awkward to ask for from a long-standing customer.
        </p>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
          <strong className="text-slate-200">The DealProof AI Solution:</strong>
          <p>
            Build a solution that helps a small business turn informal dealings into a clear, defensible record without making the relationship feel legalistic. It extracts the key terms from conversations (parties, scope, price, timelines, payment terms), flags anything ambiguous or missing, generates a simple agreement in plain language for both sides to confirm, and preserves the evidence trail in a tamper-evident way.
          </p>
        </div>
      </section>

      {/* 4-Member Team Division */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Four-Member Engineering Division</h2>
            <p className="text-xs text-slate-400">
              Clear modular separation enabling parallel development without code overlaps.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Member 1 */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                Member 1
              </span>
              <span className="text-xs font-medium text-slate-400">Frontend & UI/UX</span>
            </div>
            <h3 className="text-sm font-bold text-white">Design System & User Journey</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Polished SaaS homepage with accessible color palette (navy, slate, blue)</li>
              <li>• Input form with validation, character counter, and sample presets</li>
              <li>• Responsive tabs for Extracted Terms, Gaps, Draft, and Audit</li>
              <li>• Visual error states and interactive feedback</li>
            </ul>
          </div>

          {/* Member 2 */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                Member 2
              </span>
              <span className="text-xs font-medium text-slate-400">Analysis & Ambiguity Engine</span>
            </div>
            <h3 className="text-sm font-bold text-white">Extraction & Missing-Term Triage</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Deterministic rule-based parser that handles Indian commercial terms</li>
              <li>• Role distinction: prevents assuming addressee is supplier</li>
              <li>• Missing term detection: GST, transport liability, inspection window</li>
              <li>• Automated suggested clarification questions with copy-for-chat</li>
            </ul>
          </div>

          {/* Member 3 */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                Member 3
              </span>
              <span className="text-xs font-medium text-slate-400">Draft Generation & PDF Export</span>
            </div>
            <h3 className="text-sm font-bold text-white">Bilateral Agreement Engine</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• 9-clause plain-language bilateral agreement template</li>
              <li>• Strict <code>[Needs confirmation]</code> flags without hallucinations</li>
              <li>• In-place clause editor and review status switcher</li>
              <li>• Client-side PDF export (jsPDF) with pagination & disclaimer</li>
            </ul>
          </div>

          {/* Member 4 */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700">
                Member 4
              </span>
              <span className="text-xs font-medium text-slate-400">Storage, Security & Quality</span>
            </div>
            <h3 className="text-sm font-bold text-white">Data Architecture & Verification</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• SHA-256 cryptographic tamper-evident hashing</li>
              <li>• Version snapshotting (v1, v2) with audit trail log</li>
              <li>• LocalStorage offline-first fallback & Supabase RLS schema</li>
              <li>• Vitest unit testing suite & benchmark validation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Decisions & Known Limitations (Hackathon Rule 7 & 9) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Implemented & Verified Capabilities</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li>✓ 100% deterministic rule extractor running fully offline with zero API key dependencies.</li>
            <li>✓ Benchmark test scenario (Ravi 100 chairs) passing with 4 comprehensive unit tests.</li>
            <li>✓ Dynamic missing terms detection with severity categorization (Critical, Important, Recommended).</li>
            <li>✓ Cryptographic SHA-256 hash generated over normalized conversation and extracted clauses.</li>
            <li>✓ Vector PDF export with page break handling, metadata, and disclaimer.</li>
            <li>✓ Local-first version history and editable draft workflow.</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 text-sm font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Honest Disclosures & Known Limitations</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li>• <strong>No Legal Advice:</strong> Outputs are operational drafts for mutual understanding. They do not constitute formal legal counsel.</li>
            <li>• <strong>No Digital Signatures:</strong> Does not generate fake digital signatures or claim enforceability without state stamp duty.</li>
            <li>• <strong>No Direct Chat Scraping:</strong> Input is strictly user-submitted text to protect communication privacy.</li>
            <li>• <strong>Language:</strong> Currently optimized for English informal business communication and Indian currency / MSME terminology.</li>
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="pt-4 text-center">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all"
        >
          <span>Try DealProof AI Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
