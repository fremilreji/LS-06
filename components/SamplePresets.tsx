'use client';

import React from 'react';
import { SAMPLE_CONVERSATIONS, SamplePreset } from '@/lib/data/sampleConversations';
import { Sparkles, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SamplePresetsProps {
  onSelect: (preset: SamplePreset) => void;
  selectedId?: string;
}

export default function SamplePresets({ onSelect, selectedId }: SamplePresetsProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live Benchmark Scenarios</h3>
            <p className="text-xs text-slate-400">
              Load realistic fictional business conversations to test extraction, ambiguities, and draft generation.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Fictional data only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {SAMPLE_CONVERSATIONS.map(preset => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between h-full ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 text-blue-300 border border-slate-700">
                    {preset.category}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-blue-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                  {preset.title}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-blue-400 font-medium">
                <span>Click to load scenario</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
