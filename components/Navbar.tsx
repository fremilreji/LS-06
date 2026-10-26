'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  PlusCircle, 
  BookmarkCheck
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Wizard', icon: PlusCircle },
    { href: '/about', label: 'Legal Guide', icon: FileText },
    { href: '/drafts', label: 'Saved Drafts', icon: BookmarkCheck },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 text-zinc-900 shadow-2xs w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Brand Logo Link */}
          <div className="flex items-center shrink-0">
            <Link 
              href="/" 
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.location.href = '/';
                }
              }}
              className="flex items-center space-x-2 group cursor-pointer"
              title="Dealproof Home"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shadow-xs font-black text-sm group-hover:scale-105 transition-transform shrink-0">
                DP
              </div>
              <span className="font-bold text-base tracking-tight text-zinc-950">
                dealproof<span className="text-emerald-600">.</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links & Action (Responsive Mobile-Optimized) */}
          <nav className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href === '/' && pathname === '/') {
                      e.preventDefault();
                      window.location.href = '/';
                    }
                  }}
                  title={link.label}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Start a new deal from scratch"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">+ New Order</span>
              <span className="xs:hidden">New</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
}
