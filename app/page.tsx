import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  FileDown, 
  Scale, 
  Search, 
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800 py-16 sm:py-24">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Hackathon Problem Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/50 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Srujana Tech Fest 2026 • Problem LS-06</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Turn informal business conversations into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                clear agreement drafts.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Small businesses make deals on WhatsApp, email, and phone calls. DealProof AI extracts structured commercial terms, flags dangerous ambiguities and missing conditions, and generates a plain-language reviewable agreement draft with tamper-evident audit trails.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01]"
              >
                <span>Create Agreement Draft</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Read Problem LS-06 Guide</span>
              </Link>
            </div>

            {/* Disclaimer Capsule */}
            <div className="pt-4 max-w-2xl mx-auto">
              <p className="text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
                <strong className="text-slate-300">Operational Notice:</strong> {LEGAL_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Breakdown */}
      <section className="py-16 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Handshake Deals Fail Small Businesses
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Indian MSMEs conduct billions in informal transactions without formal contracts because legal drafting feels slow, expensive, and socially awkward with clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Scattered & Ambiguous Chats</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Messages like <em>&ldquo;You can pay after delivery&rdquo;</em> or <em>&ldquo;Deliver in 10 days&rdquo;</em> leave payment windows, countdown triggers, and transport responsibilities completely undefined.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Missing Critical Terms</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Informal discussions routinely overlook GST inclusion, defect inspection periods, and remedies if shipments arrive late or damaged, causing bitter disputes later.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Lack of Defensible Evidence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a payment is delayed, small businesses have no structured, tamper-evident record that both parties can refer to for MSMED facilitation or clean operational settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
              Step-by-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              From Informal Handshake to Defensible Contract
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Four verifiable stages designed to establish shared clarity without sounding hostile or intimidating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded w-fit border border-blue-800">
                Stage 01
              </div>
              <h3 className="text-base font-bold text-white">Paste Conversation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste message excerpts from WhatsApp, email, or meeting notes. Zero scraping; user retains full data control.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded w-fit border border-blue-800">
                Stage 02
              </div>
              <h3 className="text-base font-bold text-white">Extract & Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic rules and hybrid AI extract parties, quantity, price, delivery, and payment terms, mapped to exact source quotes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded w-fit border border-blue-800">
                Stage 03
              </div>
              <h3 className="text-base font-bold text-white">Triage Gaps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identify missing tax clauses, transport liabilities, and ambiguous windows. Copy suggested WhatsApp questions with 1 click.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded w-fit border border-blue-800">
                Stage 04
              </div>
              <h3 className="text-base font-bold text-white">Review & Export PDF</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate a plain-language draft with unconfirmed clauses marked. Edit in-place and export a professional PDF with SHA-256 integrity hash.
              </p>
            </div>
          </div>

          {/* Quick Benchmark Prompt Callout */}
          <div className="mt-12 bg-blue-950/30 border border-blue-800/60 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono uppercase text-blue-300 font-semibold tracking-wider">
                  Official Srujana Hackathon Test Case
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                &ldquo;Hi Ravi, I can supply 100 office chairs for ₹50,000...&rdquo;
              </h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Test our extraction live against the exact problem statement benchmark. See how it identifies roles without false assumptions, flags missing GST and transport liabilities, and prepares a draft ready for mutual review.
              </p>
            </div>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-all shadow-sm"
            >
              <span>Load Benchmark & Test</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Architectural Guarantees */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Built on High-Integrity Principles
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Engineered specifically for the Legal Services Hackathon standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Zero Hallucination Policy</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                If a term is unmentioned, it is strictly flagged as <code>[Needs confirmation]</code>. We never invent corporate identities, penalties, or fake clauses.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Cryptographic Audit Digest</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every version computes an immutable SHA-256 digest over the raw conversation and draft clauses, preventing post-facto alterations.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Offline / Local-First Fallback</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operates seamlessly without mandatory third-party AI keys or cloud databases. 100% deterministic rule-based analysis ready at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
