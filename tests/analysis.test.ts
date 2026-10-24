import { describe, it, expect } from 'vitest';
import { extractTermsRuleBased } from '../lib/analysis/extractTerms';
import { generateAgreementDraft } from '../lib/agreement/generateDraft';
import { computeSha256 } from '../lib/crypto/hash';
import { exportDraftToPdf } from '../lib/agreement/exportPdf';

describe('DealProof AI - Analysis & Extraction Engine', () => {
  const benchmarkChat = 'Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm.';

  it('correctly extracts benchmark terms from informal message without inventing facts', async () => {
    const result = await extractTermsRuleBased(benchmarkChat, 'Procurement of 100 Chairs', 'Office supply');

    // Party checks
    expect(result.partyB.name).toBe('Ravi');
    expect(result.partyB.role).toBe('Buyer');
    expect(result.partyA.role).toBe('Supplier');
    expect(result.partyA.isExplicit).toBe(false); // Sender did not give registered name

    // Commercial terms
    expect(result.quantity.value).toContain('100');
    expect(result.price.value).toBe('₹50,000');
    expect(result.currency).toBe('INR');
    expect(result.deliveryTimeline.value).toContain('10 days');
    expect(result.paymentTerms.value.toLowerCase()).toContain('after delivery');

    // Missing critical terms detection
    const missingCategories = result.missingTerms.map(m => m.category);
    expect(missingCategories).toContain('PARTIES');
    expect(missingCategories).toContain('PRICING_TAX'); // GST unspecified
    expect(missingCategories).toContain('DELIVERY'); // Transport responsibility
    expect(missingCategories).toContain('QUALITY_INSPECTION'); // Defect inspection

    // Ambiguity detection
    const ambiguousTerms = result.ambiguousTerms.map(a => a.term);
    expect(ambiguousTerms).toContain('Indefinite Post-Delivery Payment Window');
    expect(ambiguousTerms).toContain('Delivery Timeline Start Trigger');

    // Hash integrity
    expect(result.tamperEvidenceHash).toBeDefined();
    expect(result.tamperEvidenceHash.length).toBeGreaterThan(10);
  });

  it('generates a 9-clause plain-language draft with explicit [Needs confirmation] flags', async () => {
    const extracted = await extractTermsRuleBased(benchmarkChat, 'Chairs Draft');
    const draft = await generateAgreementDraft(extracted);

    expect(draft.clauses.length).toBeGreaterThanOrEqual(8);
    expect(draft.status).toBe('DRAFT_NEEDS_REVIEW');

    // Must have unresolved questions clause
    const unresolvedClause = draft.clauses.find(c => c.id === 'clause-unresolved');
    expect(unresolvedClause).toBeDefined();
    expect(unresolvedClause?.needsConfirmation).toBe(true);

    // Verify parties clause flags need for confirmation
    const partiesClause = draft.clauses.find(c => c.id === 'clause-parties');
    expect(partiesClause?.needsConfirmation).toBe(true);
  });

  it('computes deterministic SHA-256 digests and detects alterations', async () => {
    const hash1 = await computeSha256('Contract text version 1');
    const hash2 = await computeSha256('Contract text version 1');
    const hashAltered = await computeSha256('Contract text version 2');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashAltered);
  });

  it('generates a valid PDF document with realistic sample', async () => {
    const extracted = await extractTermsRuleBased(benchmarkChat, 'Chairs Purchase Agreement');
    const draft = await generateAgreementDraft(extracted);
    const pdfDoc = exportDraftToPdf(draft);

    expect(pdfDoc).toBeDefined();
    expect(pdfDoc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});
