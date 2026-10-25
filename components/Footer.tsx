import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale } from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function Footer() {
  return (
    <footer className="no-print bg-white border-t border-zinc-200 text-zinc-600 text-xs py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Compliance Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 flex items-center gap-1">
              dealproof<span className="text-zinc-400">.</span>
            </span>
            <span>•</span>
            <span className="text-zinc-600 font-medium">Jan-Karar Order Shield (LS-06)</span>
            <span>•</span>
            <span>Srujana Tech Fest 2026</span>
          </div>
          
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-zinc-900 underline-offset-4 hover:underline">
              Wizard
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-zinc-900 underline-offset-4 hover:underline">
              Legal Methodology
            </Link>
            <span>•</span>
            <a 
              href="https://odr.msme.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-700 hover:text-emerald-800 font-medium"
            >
              MSME ODR Portal ↗
            </a>
          </div>
        </div>

        {/* Persistent Legal Disclaimer */}
        <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-400 leading-relaxed">
          <strong className="text-zinc-600">Statutory Notice: </strong>
          Electronic record formed under Section 10A of the Information Technology Act, 2000. Non-stamping is a curable procedural defect under the Supreme Court of India 7-judge Constitution Bench ruling in <em>In Re: Interplay (2023)</em>. Delayed payment claims enforceable before MSEFC / MSME ODR Portal under Sections 15–18 of the MSMED Act, 2006. Not formal legal advice.
        </div>
      </div>
    </footer>
  );
}
