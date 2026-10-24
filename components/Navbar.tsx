'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  FileText, 
  PlusCircle, 
  BookmarkCheck, 
  Sparkles, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/authContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isFirebaseActive, signOut } = useAuth();

  const navLinks = [
    { href: '/', label: 'Overview', icon: ShieldCheck },
    { href: '/create', label: 'Create Draft', icon: PlusCircle },
    { href: '/drafts', label: 'Saved Drafts', icon: BookmarkCheck },
    { href: '/about', label: 'Problem LS-06', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Tag */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  DealProof <span className="text-blue-400 font-semibold text-sm">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  From Handshake to Contract
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-700">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/60 text-blue-200 border border-blue-700/50">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Srujana 2026 • LS-06
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons: Auth + New Agreement */}
          <div className="flex items-center space-x-2.5">
            {isFirebaseActive && user && (
              <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-slate-300 max-w-[80px] truncate">
                  {user.isAnonymous ? 'Guest' : user.email || 'User'}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign Out"
                  className="text-slate-500 hover:text-rose-400 ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Agreement</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900/90 px-4 py-2 overflow-x-auto space-x-2">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
