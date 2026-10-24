'use client';

import React, { useState } from 'react';
import { 
  ExtractedAgreementData, 
  AgreementDraft, 
  ConversationInputSchema 
} from '@/types/agreement';
import { SamplePreset, SAMPLE_CONVERSATIONS } from '@/lib/data/sampleConversations';
import { DraftStore } from '@/lib/storage/draftStore';
import SamplePresets from '@/components/SamplePresets';
import ExtractedTermsView from '@/components/ExtractedTermsView';
import MissingTermsAlert from '@/components/MissingTermsAlert';
import AgreementEditor from '@/components/AgreementEditor';
import EvidenceTraceability from '@/components/EvidenceTraceability';
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
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { LEGAL_DISCLAIMER } from '@/lib/agreement/generateDraft';

export default function CreateAgreementPage() {
  // Form state
  const [title, setTitle] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [rawConversation, setRawConversation] = useState('');
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Analysis result state
  const [extractedData, setExtractedData] = useState<ExtractedAgreementData | null>(null);
  const [draft, setDraft] = useState<AgreementDraft | null>(null);
  const [activeTab, setActiveTab] = useState<'terms' | 'missing' | 'draft' | 'traceability'>('terms');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Preset Selection
  const handleSelectPreset = (preset: SamplePreset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.title);
    setBusinessContext(preset.businessContext);
    setRawConversation(preset.rawConversation);
    setValidationErrors([]);
    setApiError(null);
  };

  // Submit Analysis
  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setApiError(null);

    const validation = ConversationInputSchema.safeParse({
      title,
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
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
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
      setActiveTab('terms');

      // Auto-save to draft store
      DraftStore.save(result.draft);
      showTemporaryToast('Draft generated & saved to local storage!');
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
    if (confirm('Start a new agreement? Current analysis view will be cleared.')) {
      setExtractedData(null);
      setDraft(null);
      setTitle('');
      setBusinessContext('');
      setRawConversation('');
      setSelectedPresetId(undefined);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {saveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Create Agreement Draft
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                LS-06 Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Paste informal correspondence from WhatsApp, email, or meeting transcripts to extract structured commercial terms.
            </p>
          </div>

          {draft && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Selector */}
      <SamplePresets
        onSelect={handleSelectPreset}
        selectedId={selectedPresetId}
      />

      {/* Input Form Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleAnalyse} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Agreement / Transaction Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Supply of 100 Office Chairs"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Business Context */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Business Context / Industry (Optional)
              </label>
              <input
                type="text"
                value={businessContext}
                onChange={e => setBusinessContext(e.target.value)}
                placeholder="e.g., Office Furniture, Wholesale Textiles, IT Development"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Conversation Input Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                Informal Business Conversation Text <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {rawConversation.length} / 15,000 chars
              </span>
            </div>
            <textarea
              required
              rows={6}
              value={rawConversation}
              onChange={e => setRawConversation(e.target.value)}
              placeholder="Paste raw messages, chat transcripts, or informal proposals here...
Example: Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
            />
          </div>

          {/* Privacy & Authorization Notice */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentAcknowledged}
              onChange={e => setConsentAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-slate-900 cursor-pointer"
            />
            <label htmlFor="consent" className="text-xs text-slate-400 cursor-pointer leading-relaxed">
              <strong className="text-slate-300">Privacy & Authorization Notice: </strong>
              I confirm that I have authorization to submit this conversation excerpt for review. I understand this tool processes text to generate an AI-assisted operational draft and does not replace certified legal counsel or state stamp duty laws.
            </label>
          </div>

          {/* Validation & API Error Banners */}
          {validationErrors.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Please fix the following:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {apiError && (
            <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-4 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-rose-200">Error: </strong>
                {apiError}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500">
              Deterministic rule engine runs locally; hybrid AI auto-activates when configured.
            </div>

            <button
              type="submit"
              disabled={isLoading || !rawConversation.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Extracting Terms...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyse Conversation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results View */}
      {extractedData && draft && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'terms'
                  ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Extracted Terms</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {extractedData.completenessScore}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('missing')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'missing'
                  ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>2. Missing & Ambiguous Gaps</span>
              {extractedData.missingTerms.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {extractedData.missingTerms.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('draft')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'draft'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. Agreement Draft & In-Place Editor</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                v{draft.version}.0
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('traceability')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'traceability'
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>4. Evidence & Traceability Audit</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="mt-6">
            {activeTab === 'terms' && (
              <ExtractedTermsView data={extractedData} />
            )}

            {activeTab === 'missing' && (
              <MissingTermsAlert
                missingTerms={extractedData.missingTerms}
                ambiguousTerms={extractedData.ambiguousTerms}
              />
            )}

            {activeTab === 'draft' && (
              <AgreementEditor
                draft={draft}
                onUpdateDraft={handleUpdateDraft}
                onSaveNewVersion={handleSaveNewVersion}
              />
            )}

            {activeTab === 'traceability' && (
              <EvidenceTraceability draft={draft} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
