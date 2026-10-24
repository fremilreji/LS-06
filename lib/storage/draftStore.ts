import { AgreementDraft, AuditLogEntry } from '@/types/agreement';
import { computeSha256 } from '../crypto/hash';

const STORAGE_KEY = 'dealproof_ai_drafts_v1';

/**
 * Client storage manager for Agreement Drafts and Version History.
 * Operates with browser localStorage by default, maintaining full versioning,
 * audit log trails, and tamper-evident signatures.
 */
export const DraftStore = {
  getAll(): AgreementDraft[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as AgreementDraft[];
    } catch (err) {
      console.error('Failed to read drafts from storage:', err);
      return [];
    }
  },

  getById(id: string): AgreementDraft | null {
    const drafts = this.getAll();
    return drafts.find(d => d.id === id) || null;
  },

  save(draft: AgreementDraft): void {
    if (typeof window === 'undefined') return;
    const drafts = this.getAll();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);

    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.unshift(draft);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  },

  async createNewVersion(
    draft: AgreementDraft,
    changeDescription: string,
    author: string = 'User'
  ): Promise<AgreementDraft> {
    const nextVersion = draft.version + 1;
    const now = new Date().toISOString();

    const auditEntry: AuditLogEntry = {
      timestamp: now,
      action: `VERSION_${nextVersion}_CREATED`,
      actor: author,
      details: changeDescription,
    };

    // Recompute tamper-evident hash
    const clausesText = draft.clauses.map(c => `${c.clauseNumber}. ${c.title}\n${c.body}`).join('\n\n');
    const newHash = await computeSha256(`${draft.extractedData.tamperEvidenceHash}:::v${nextVersion}:::${clausesText}`);

    const updatedDraft: AgreementDraft = {
      ...draft,
      version: nextVersion,
      updatedAt: now,
      tamperEvidenceHash: newHash,
      auditTrail: [auditEntry, ...draft.auditTrail],
    };

    this.save(updatedDraft);
    return updatedDraft;
  },

  delete(id: string): void {
    if (typeof window === 'undefined') return;
    const drafts = this.getAll().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  },
};
