'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Printer, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Scale, 
  FileText, 
  CheckCircle2, 
  Users, 
  Cpu, 
  Database,
  Download
} from 'lucide-react';

export default function ProjectReportPage() {
  return (
    <div className="min-h-screen bg-ambient-grid text-zinc-900 font-sans pb-24 relative">
      
      {/* Top Floating Control Bar */}
      <nav className="no-print sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 sm:py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to App</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/fremilreji/LS-06/blob/main/PROJECT_REPORT_LS06.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="hidden sm:inline">Download PDF File</span>
              <span className="sm:hidden">PDF</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Report Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">

        {/* Title Header Card */}
        <div className="craft-card p-6 sm:p-10 lg:p-12 space-y-4 bg-white border border-zinc-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 whitespace-nowrap">
              Srujana Tech Fest 2026
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
              Problem Statement LS-06
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-300 whitespace-nowrap">
              Team Redhounds
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
            DealProof AI (PactProof / Jan-Karar) — Detailed Project Report
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            From Handshake to Contract (Informal Agreements) • Official 48-Hour Hackathon Submission Report
          </p>

          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-500 font-mono">
            <div className="whitespace-nowrap">Live App: <a href="https://ls-06.vercel.app" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline font-semibold">ls-06.vercel.app</a></div>
            <div className="whitespace-nowrap">GitHub: <a href="https://github.com/fremilreji/LS-06" target="_blank" rel="noopener noreferrer" className="text-zinc-800 underline font-semibold">github.com/fremilreji/LS-06</a></div>
            <div className="whitespace-nowrap">Deadline: <strong className="text-zinc-900">10:00 AM, 26 Oct 2026</strong></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="craft-card p-6 sm:p-8 lg:p-10 space-y-3.5 bg-white border border-zinc-200">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2.5">
            <FileText className="w-5 h-5 text-orange-600 shrink-0" />
            <span>1. Project Overview &amp; Executive Summary</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
            <strong>DealProof AI</strong> is a mobile-first legal technology platform designed specifically for India&apos;s informal commercial manufacturing clusters (such as Bengaluru&apos;s Peenya/Chickpet garment corridors and the Tirupur knitwear belt). It ingests informal vernacular WhatsApp negotiations (in Hindi, Kannada, and Indian English) and voice notes, parses them through a two-layer architecture (lightweight Gemini 2.5 Flash extraction + deterministic TypeScript statutory engine), neutralizes common predatory commercial traps, and exports an enforceable, two-page Digital Order Slip with a cryptographic evidence certificate under Section 63 of the <em>Bharatiya Sakshya Adhiniyam, 2023</em> (BSA).
          </p>
        </section>

        {/* Section 2: Problem Understanding */}
        <section className="craft-card p-6 sm:p-8 lg:p-10 space-y-4 bg-white border border-zinc-200">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2.5">
            <Scale className="w-5 h-5 text-orange-600 shrink-0" />
            <span>2. Problem Understanding &amp; MSME Pain Points</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5">
              <div className="font-bold text-rose-950">1. Unlawful 60-Day Credit (Section 15 MSMED Act)</div>
              <p className="text-rose-900 leading-relaxed text-xs">
                Large buyers demand 60–90 days credit or &ldquo;pay when client pays&rdquo; clauses. Section 15 caps credit at an absolute ceiling of 45 days, defaulting to 15 days.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5">
              <div className="font-bold text-rose-950">2. Arbitrary Debit Notes (Section 42 Sale of Goods Act)</div>
              <p className="text-rose-900 leading-relaxed text-xs">
                Buyers inspect goods weeks after delivery, find loose threads, and unilaterally cut 20–30% of invoices without providing notice or right to cure.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="font-bold text-amber-950">3. Unpaid Extra Operations (Section 62 Contract Act)</div>
              <p className="text-amber-900 leading-relaxed text-xs">
                Buyers request extra embroidery or bio-wash via WhatsApp voice notes without agreeing to price revisions.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="font-bold text-amber-950">4. Uncertain Rates (Section 29 Contract Act)</div>
              <p className="text-amber-900 leading-relaxed text-xs">
                Agreements on floating rates (&ldquo;market rate dekhenge&rdquo;) are legally void for uncertainty, leaving tailors with zero court remedy.
              </p>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-600">
            <strong>Macro Context:</strong> Over <strong>₹40,000 Crore</strong> in delayed payments is currently locked on the Ministry of MSME&apos;s <em>Samadhaan</em> portal. Preventative digital documentation is essential.
          </div>
        </section>

        {/* Section 3: Proposed Solution */}
        <section className="craft-card p-6 sm:p-8 lg:p-10 space-y-3.5 bg-white border border-zinc-200">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>3. Proposed Solution &amp; User Journey</span>
          </h2>
          <div className="space-y-2.5 text-xs sm:text-sm text-zinc-700 leading-relaxed">
            <p>1. <strong>Step 1 (Ingest):</strong> Paste messy WhatsApp chat or speak voice notes in Hindi/Kannada via browser Web Speech API. Enter Udyam registration number.</p>
            <p>2. <strong>Step 2 (Triage):</strong> System extracts parties, quantities, and calculates math (Qty × Rate = Total). Section 29 hard halt stops floating rates. Interactive cards allow 1-click application of statutory clauses.</p>
            <p>3. <strong>Step 3 (Sign &amp; Share):</strong> Generates a clean 2-page Digital Order Slip with dual canvas e-signatures, Section 63 BSA evidence certificate, and 1-click WhatsApp (<code>wa.me</code>) share link.</p>
          </div>
        </section>

        {/* Section 4: Innovation & Architecture */}
        <section className="craft-card p-6 sm:p-8 lg:p-10 space-y-4 bg-white border border-zinc-200">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2.5">
            <Cpu className="w-5 h-5 text-orange-600 shrink-0" />
            <span>4. Innovation: The Two-Layer Architecture</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
            Generic legal AI tools prompt an LLM to generate entire contracts from scratch, resulting in token bloat, legal hallucinations, and arithmetic errors. DealProof separates extraction from jurisprudence:
          </p>
          <div className="p-4 sm:p-5 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs sm:text-[13px] overflow-x-auto space-y-1.5">
            <div>[ WhatsApp Chat / Voice Note ]</div>
            <div className="text-zinc-500">  │</div>
            <div>  ▼ Layer 1: Gemini 2.5 Flash / Local Regex (Extracts: Buyer, Supplier, Qty, Rate, Dates)</div>
            <div className="text-zinc-500">  │</div>
            <div>  ▼ Layer 2: Deterministic TypeScript Engine (Enforces MSMED Sec 15, SOGA Sec 42, ICA Sec 62)</div>
            <div className="text-zinc-500">  │</div>
            <div>  ▼ Output: 2-Page Court-Admissible Order Slip + SHA-256 Section 63 BSA Certificate</div>
          </div>
        </section>

        {/* Section 15: Team & Roles */}
        <section className="craft-card p-6 sm:p-8 lg:p-10 space-y-4 bg-white border border-zinc-200">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2.5">
            <Users className="w-5 h-5 text-orange-600 shrink-0" />
            <span>15. Team Redhounds &amp; Pod Responsibilities</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 text-xs sm:text-sm">
            <div className="p-5 sm:p-6 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="font-bold text-zinc-900 text-sm sm:text-base">Pod 1: Frontend, UX/UI &amp; Accessibility</div>
                <div className="text-orange-700 font-semibold text-xs sm:text-sm">C Nakshatra &amp; Shivani B</div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-xs">
                  <li>Designed mobile-first interface for micro-unit job-workers</li>
                  <li>Built Next.js React components &amp; Tailwind CSS styling</li>
                  <li>Engineered 5-Pillar gap resolution UI &amp; touch signature canvas</li>
                  <li>Developed strict @media print formatting for A4 PDF</li>
                </ul>
              </div>
            </div>
            <div className="p-5 sm:p-6 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="font-bold text-zinc-900 text-sm sm:text-base">Pod 2: Backend, Cloud Architecture &amp; Legal Engine</div>
                <div className="text-orange-700 font-semibold text-xs sm:text-sm">Fremil Reji &amp; K C Vaishnavi</div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-600 text-xs">
                  <li>Architected FastAPI / Next.js backend &amp; Firebase integration</li>
                  <li>Built deterministic JSON state machine for Indian Statutory Law</li>
                  <li>Engineered Anti-Forgery Dual Signature with IP fingerprinting</li>
                  <li>Implemented SHA-256 cryptographic hashing for BSA Sec 63 certificate</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-xs text-zinc-500 font-mono pt-4">
          Report prepared by Team Redhounds for Srujana Tech Fest 2026 • Problem Statement LS-06
        </div>

      </main>

    </div>
  );
}
