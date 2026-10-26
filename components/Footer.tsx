import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale } from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function Footer() {
  return (
    <footer className="no-print bg-white border-t border-zinc-200 text-zinc-600 text-xs py-6 sm:py-8 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Compliance Notice */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-zinc-900 flex items-center gap-1">
              dealproof<span className="text-emerald-600">.</span>
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-700 font-semibold">Jan-Karar</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500 hidden md:inline">From Handshake to Contract</span>
            <span className="text-zinc-300 hidden md:inline">•</span>
            <span className="text-zinc-500">Digital Order Memorandum Platform</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
            <Link href="/" className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap">
              Wizard
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/about" className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap">
              Legal Methodology
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/report" className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap">
              Project Report
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/drafts" className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap">
              Saved Drafts
            </Link>
            <span className="text-zinc-300">•</span>
            <a 
              href="https://odr.msme.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-700 hover:text-emerald-800 font-semibold whitespace-nowrap transition-colors"
            >
              MSME SAMADHAAN ↗
            </a>
          </div>
        </div>

        {/* Legal Advisory Footer */}
        <div className="pt-3 border-t border-zinc-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-zinc-500 leading-relaxed">
          <p className="max-w-3xl text-zinc-500">
            {LEGAL_DISCLAIMER}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-mono border border-zinc-200">
              <Scale className="w-3 h-3 text-zinc-500 shrink-0" />
              IT Act, 2000
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-mono border border-zinc-200">
              <ShieldCheck className="w-3 h-3 text-zinc-500 shrink-0" />
              BSA, 2023 Sec 63
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
