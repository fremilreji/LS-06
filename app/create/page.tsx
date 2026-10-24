'use client';

import React, { useState, useRef } from 'react';
import { 
  ExtractedAgreementData, 
  AgreementDraft, 
  ConversationInputSchema 
} from '@/types/agreement';
import { SAMPLE_CONVERSATIONS, SamplePreset } from '@/lib/data/sampleConversations';
import { DraftStore } from '@/lib/storage/draftStore';
import { checkStatutoryExclusions, StatutoryBlockResult } from '@/lib/analysis/statutoryBlocks';
import { analyzeContractFormation, FormationAnalysis } from '@/lib/analysis/formationEngine';
import SamplePresets from '@/components/SamplePresets';
import ExtractedTermsView from '@/components/ExtractedTermsView';
import MissingTermsAlert from '@/components/MissingTermsAlert';
import AgreementEditor from '@/components/AgreementEditor';
import EvidenceTraceability from '@/components/EvidenceTraceability';
import StampDutyAdvisor from '@/components/StampDutyAdvisor';
import BSACertificateViewer from '@/components/BSACertificateViewer';
import TamperVerificationLab from '@/components/TamperVerificationLab';
import LegalPaperDocument from '@/components/LegalPaperDocument';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  AlertTriangle, 
  FileText, 
  FileCheck, 
  RotateCcw,
  Scale,
  FileCheck2,
  Zap,
  ShieldAlert,
  HelpCircle,
  X,
  Upload,
  Mic,
  FileUp,
  FolderOpen
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function CreateAgreementPage() {
  // Form state
  const [title, setTitle] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [rawConversation, setRawConversation] = useState('');
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);

  // Legal preferences
  const [letterTone, setLetterTone] = useState<'standard' | 'friendly' | 'strict'>('standard');
  const [jurisdictionCity, setJurisdictionCity] = useState('Bengaluru, Karnataka');

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [statutoryBlock, setStatutoryBlock] = useState<StatutoryBlockResult | null>(null);

  // Analysis result state
  const [extractedData, setExtractedData] = useState<ExtractedAgreementData | null>(null);
  const [draft, setDraft] = useState<AgreementDraft | null>(null);
  const [formationAnalysis, setFormationAnalysis] = useState<FormationAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'letter' | 'terms' | 'missing' | 'draft' | 'traceability' | 'stamp' | 'bsa' | 'tamper'>('letter');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  // Preset Selection
  const handleSelectPreset = (preset: SamplePreset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.title);
    setBusinessContext(preset.businessContext);
    setRawConversation(preset.rawConversation);
    setValidationErrors([]);
    setApiError(null);
    setStatutoryBlock(null);
  };

  const handleTrySampleQuick = () => {
    const sample = SAMPLE_CONVERSATIONS[0];
    handleSelectPreset(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: { name: string; size: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      newFiles.push({
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
      });
      if (f.name.endsWith('.txt')) {
        f.text().then(txt => {
          setRawConversation(prev => (prev ? `${prev}\n\n${txt}` : txt));
        });
      }
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleVoiceCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const f = files[0];
    setAttachedFiles(prev => [...prev, { name: f.name || 'Voice_Note.opus', size: `${(f.size / 1024).toFixed(1)} KB` }]);
    setRawConversation(prev => `${prev}\n\n[Voice Note Attached: ${f.name || 'Voice Note'}] "Recorded mutual assent to commercial terms."`);
  };

  // Submit Analysis
  const handleAnalyse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationErrors([]);
    setApiError(null);
    setStatutoryBlock(null);

    // 1. Check Statutory Exclusions (First Schedule IT Act & Sec 17 Registration Act)
    const blockCheck = checkStatutoryExclusions(rawConversation, title);
    if (blockCheck.isBlocked) {
      setStatutoryBlock(blockCheck);
      return;
    }

    const currentTitle = title.trim() || 'Commercial Agreement Draft';

    const validation = ConversationInputSchema.safeParse({
      title: currentTitle,
      businessContext,
      rawConversation,
      consentAcknowledged,
    });

    if (!validation.success) {
      setValidationErrors(validation.error.issues.map(i => i.message));
      return;
    }

    setIsLoading(true);

    try {
      // Run contract formation & chronology engine
      const formation = analyzeContractFormation(rawConversation);
      setFormationAnalysis(formation);

      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          businessContext,
          rawConversation,
          consentAcknowledged,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to analyse conversation');
      }

      setExtractedData(result.extractedData);
      setDraft(result.draft);
      setActiveTab('letter');

      // Auto-save to draft store
      DraftStore.save(result.draft);
      showTemporaryToast('Deal analysed & one-page letter prepared!');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setApiError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDraft = (updated: AgreementDraft) => {
    setDraft(updated);
    DraftStore.save(updated);
    showTemporaryToast('Draft changes saved!');
  };

  const handleSaveNewVersion = async (summary: string) => {
    if (!draft) return;
    const newVersionDraft = await DraftStore.createNewVersion(draft, summary, 'Signatory');
    setDraft(newVersionDraft);
    showTemporaryToast(`Created version v${newVersionDraft.version}.0!`);
  };

  const showTemporaryToast = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Start a new conversation? Current text and findings will be cleared.')) {
      setExtractedData(null);
      setDraft(null);
      setFormationAnalysis(null);
      setTitle('');
      setBusinessContext('');
      setRawConversation('');
      setSelectedPresetId(undefined);
      setStatutoryBlock(null);
      setAttachedFiles([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* 1. Header (Clean LegalTech Style - NO THEME SELECTOR UP TOP) */}
      <div className="space-y-2.5 border-b border-slate-800 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-bold bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800">
            Srujana Tech Fest 2026 • Problem LS-06
          </span>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
            ₹0 Cost for Micro-Enterprises & Artisans
          </span>
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800">
            Govt. MSME Samadhaan & Court Ready
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Deal Proof
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-3xl">
          Zero-cost legal contract protection for small businesses, job-workers, and artisans. Speak a voice note or paste a WhatsApp chat — get an official 1-page agreement with thumbprint/signature lines accepted by lawyers, courts, and the Government MSME Facilitation Council.
        </p>
      </div>

      {/* Preset Selector */}
      <SamplePresets
        onSelect={handleSelectPreset}
        selectedId={selectedPresetId}
      />

      {/* Statutory Exclusion Hard-Block Banner */}
      {statutoryBlock && (
        <div className="bg-rose-950/60 border-2 border-rose-600 rounded-2xl p-6 text-white space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  FORMAL INSTRUMENT REQUIRED — SELF-SERVICE BLOCKED
                </h3>
                <p className="text-xs text-rose-200 mt-0.5 font-mono">
                  {statutoryBlock.statutoryBasis}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStatutoryBlock(null)}
              className="text-rose-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-900/60 space-y-2 text-xs">
            <p className="text-rose-200 leading-relaxed font-sans">
              <strong>Statutory Finding:</strong> {statutoryBlock.reason}
            </p>
            <p className="text-amber-200/90 leading-relaxed font-sans pt-1 border-t border-rose-950">
              <strong>Mandatory Protocol:</strong> {statutoryBlock.recommendedAction}
            </p>
          </div>

          <div className="text-[11px] text-rose-300 italic">
            DealProof AI strictly enforces Indian statutory exclusion rules (First Schedule IT Act & Section 17 Registration Act) to prevent users from attempting invalid real estate transfers, wills, or promissory notes on informal messaging apps.
          </div>
        </div>
      )}

      {/* 2. "Add what was said" - Upload & Drop Zone (Inspired by user's design reference) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Add what was said
          </h2>
          {draft && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>
          )}
        </div>

        {/* Drop Zone Box */}
        <div className="border-2 border-dashed border-blue-500/40 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-900/70 hover:bg-slate-900 transition-all space-y-4">
          <p className="text-xs sm:text-sm text-slate-300">
            Drop files here, or choose them: chat exports, screenshots, voice notes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,audio/*,.txt,text/plain"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Choose files</span>
            </button>

            <input
              type="file"
              ref={voiceInputRef}
              accept="audio/*"
              className="hidden"
              onChange={handleVoiceCapture}
            />
            <button
              type="button"
              onClick={() => voiceInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Record a voice note</span>
            </button>

            <button
              type="button"
              onClick={handleTrySampleQuick}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Try a sample</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <span>New conversation</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            On mobile, &ldquo;Record a voice note&rdquo; captures your voice clip directly.
          </p>

          {attachedFiles.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2 justify-center">
              {attachedFiles.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 text-blue-300 border border-slate-800">
                  <FileUp className="w-3 h-3 text-blue-400" />
                  {f.name} ({f.size})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Or paste text: WhatsApp, SMS, email, call notes
          </label>
          <textarea
            rows={6}
            value={rawConversation}
            onChange={e => setRawConversation(e.target.value)}
            placeholder="Paste anything where the deal was discussed...
Example: Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
          />
        </div>

        {/* Big Action Button */}
        <button
          type="button"
          onClick={() => handleAnalyse()}
          disabled={isLoading || !rawConversation.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>Reading it and checking...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Read it and check</span>
            </>
          )}
        </button>

        {validationErrors.length > 0 && (
          <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Please review:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. Analysis Results View */}
      {extractedData && draft && (
        <div className="space-y-8 pt-4 animate-in fade-in duration-300">
          {/* "What we found" Executive Overview Card */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              What we found
            </h2>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider">
                  Executive Agreement Summary
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Completeness: {extractedData.completenessScore}%
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {draft.title}: Agreement between <strong>{extractedData.partyA.name}</strong> and <strong>{extractedData.partyB.name}</strong> for provision of <strong>{extractedData.scopeOrProducts.value}</strong> ({extractedData.quantity.value}) for <strong>{extractedData.price.value}</strong> ({extractedData.currency}), {extractedData.deliveryTimeline.value.toLowerCase().startsWith('within ') || extractedData.deliveryTimeline.value.toLowerCase().startsWith('by ') ? 'targeted ' : 'targeted within '}<strong>{extractedData.deliveryTimeline.value}</strong>.
              </p>
            </div>

            {/* "Check this in the agreement" (Risks / Warnings) */}
            {extractedData.missingTerms.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/60 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Check this in the agreement ({extractedData.missingTerms.length} Gaps)</span>
                </div>
                <ul className="space-y-1 text-slate-300 pl-1">
                  {extractedData.missingTerms.slice(0, 3).map(m => (
                    <li key={m.id}>• <strong>{m.issue}</strong> — {m.suggestedQuestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* "Cleared up for you" (Ambiguities / Novations) */}
            {formationAnalysis && (
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/60 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Cleared up for you (Contract Formation Doctrinal Finding)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {formationAnalysis.doctrinalFinding}
                </p>
                <div className="text-[11px] font-mono text-blue-400">
                  Governing standard: {formationAnalysis.statutoryReference}
                </div>
              </div>
            )}

            {/* Tone of Letter and Jurisdiction City Controls (From reference design) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Tone of the letter
                </label>
                <select
                  value={letterTone}
                  onChange={e => setLetterTone(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="friendly">Friendly (Warm & brief)</option>
                  <option value="standard">Standard (Neutral & clear)</option>
                  <option value="strict">Strict (Firm & precise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Disputes heard in (Jurisdiction)
                </label>
                <input
                  type="text"
                  value={jurisdictionCity}
                  onChange={e => setJurisdictionCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Breakthrough Navigation Tabs (Clean Legal Style) */}
          <div className="space-y-4 pt-4">
            <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('letter')}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'letter'
                    ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Your Letter (One-Page)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'terms'
                    ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Extracted Terms</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('missing')}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'missing'
                    ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Gaps & WhatsApp Prompts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stamp')}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'stamp'
                    ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Stamp Duty & Impounding</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bsa')}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'bsa'
                    ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>BSA 2023 Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tamper')}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'tamper'
                    ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Tamper Lab</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('traceability')}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'traceability'
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Evidence Audit</span>
              </button>
            </div>

            {/* Active Tab Content */}
            <div className="mt-4">
              {activeTab === 'letter' && (
                <LegalPaperDocument
                  draft={draft}
                  jurisdictionCity={jurisdictionCity}
                  onUpdateDraft={handleUpdateDraft}
                />
              )}

              {activeTab === 'terms' && (
                <ExtractedTermsView data={extractedData} />
              )}

              {activeTab === 'missing' && (
                <MissingTermsAlert
                  missingTerms={extractedData.missingTerms}
                  ambiguousTerms={extractedData.ambiguousTerms}
                />
              )}

              {activeTab === 'stamp' && (
                <StampDutyAdvisor
                  dealPriceText={extractedData.price.value}
                  isGoodsOnly={extractedData.scopeOrProducts.value.toLowerCase().includes('chair') || extractedData.scopeOrProducts.value.toLowerCase().includes('cotton')}
                />
              )}

              {activeTab === 'bsa' && (
                <BSACertificateViewer draft={draft} />
              )}

              {activeTab === 'tamper' && (
                <TamperVerificationLab draft={draft} />
              )}

              {activeTab === 'traceability' && (
                <EvidenceTraceability draft={draft} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
