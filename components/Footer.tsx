import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale } from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function Footer() {
  return (
    <footer className="no-print bg-white border-t border-zinc-200 text-zinc-600 text-xs py-6 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Compliance Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-zinc-900 flex items-center gap-1">
              dealproof<span className="text-zinc-400">.</span>
            </span>
            <span>•</span>
            <span className="text-zinc-600 font-medium">Jan-Karar (LS-06)</span>
            <span>•</span>
            <span>Srujana Tech Fest 2026</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            <Link href="/" className="hover:text-zinc-900 underline-offset-4 hover:underline">
              Wizard
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-zinc-900 underline-offset-4 hover:underline">
              Legal Methodology
            </Link>
            <span>•</span>
            <Link href="/report" className="hover:text-zinc-900 underline-offset-4 hover:underline">
              Project Report
            </Link>
            <span>•</span>
            <a 
              href="https://odr.msme.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-700 hover:text-emerald-800 font-medium"
            >
              MSME SAMADHAAN
            </a>
          </div>
        </div>

        {/* Legal Advisory Footer */}
        <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-zinc-600 leading-relaxed">
          <p>
            {LEGAL_DISCLAIMER}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1 text-zinc-500">
              <Scale className="w-3 h-3 text-zinc-400" />
              IT Act, 2000
            </span>
            <span className="inline-flex items-center gap-1 text-zinc-500">
              <ShieldCheck className="w-3 h-3 text-zinc-400" />
              BSA, 2023 Sec 63
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
