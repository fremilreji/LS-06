import { ExtractedAgreementData, AgreementDraft, DraftClause, AuditLogEntry } from '@/types/agreement';
import { computeSha256 } from '../crypto/hash';

export const LEGAL_DISCLAIMER =
  'This document is an AI-assisted draft for review and discussion. It is not a guarantee of legal validity or a substitute for advice from a qualified legal professional.';

/**
 * Transforms extracted structured data into plain-language reviewable agreement clauses.
 * Clearly flags all unconfirmed terms with [Needs confirmation].
 */
export async function generateAgreementDraft(
  extractedData: ExtractedAgreementData,
  existingDraftId?: string,
  currentVersion: number = 1
): Promise<AgreementDraft> {
  const clauses: DraftClause[] = [];

  // Clause 1: Parties
  const pAName = extractedData.partyA.isExplicit ? extractedData.partyA.name : `[First Party / ${extractedData.partyA.role} - Needs Confirmation]`;
  const pBName = extractedData.partyB.isExplicit ? extractedData.partyB.name : `[Second Party / ${extractedData.partyB.role} - Needs Confirmation]`;
  
  clauses.push({
    id: 'clause-parties',
    clauseNumber: 1,
    title: 'Parties to the Informal Understanding',
    body: `This draft records the operational understanding between:\n` +
      `• Party 1: ${pAName} (Acting in capacity of ${extractedData.partyA.role})\n` +
      `• Party 2: ${pBName} (Acting in capacity of ${extractedData.partyB.role})\n\n` +
      `Note: Both parties must verify full legal entities, registered addresses, and GSTINs prior to contract execution.`,
    needsConfirmation: !extractedData.partyA.isExplicit || !extractedData.partyB.isExplicit,
    supportingExcerpt: extractedData.partyB.excerpt || extractedData.partyA.excerpt,
  });

  // Clause 2: Purpose and Scope
  const scopeVal = extractedData.scopeOrProducts.isExplicit ? extractedData.scopeOrProducts.value : '[Scope/Deliverables - Needs confirmation]';
  const qtyVal = extractedData.quantity.isExplicit ? `in the quantity of ${extractedData.quantity.value}` : '[Quantity - Needs confirmation]';

  clauses.push({
    id: 'clause-scope',
    clauseNumber: 2,
    title: 'Scope of Supply or Services',
    body: `The transaction concerns the provision of ${scopeVal} ${qtyVal}.\n` +
      `Context: ${extractedData.businessContext || 'Commercial small business transaction'}.\n` +
      `Any additional specifications, materials, or features outside this explicit scope must be agreed upon in writing.`,
    needsConfirmation: !extractedData.scopeOrProducts.isExplicit || !extractedData.quantity.isExplicit,
    supportingExcerpt: extractedData.scopeOrProducts.excerpt,
  });

  // Clause 3: Consideration and Pricing
  const priceVal = extractedData.price.isExplicit ? extractedData.price.value : '[Total Price - Needs confirmation]';
  const taxNote = extractedData.taxInclusiveStatus === 'INCLUSIVE'
    ? 'The stated price is inclusive of applicable taxes/GST.'
    : extractedData.taxInclusiveStatus === 'EXCLUSIVE'
    ? 'The stated price is exclusive of taxes; applicable GST shall be charged in addition.'
    : '[Tax / GST Status: Unspecified in conversation — must be confirmed before invoicing].';

  clauses.push({
    id: 'clause-pricing',
    clauseNumber: 3,
    title: 'Financial Consideration & Taxes',
    body: `The total agreed consideration for the described scope is ${priceVal} (${extractedData.currency}).\n${taxNote}`,
    needsConfirmation: !extractedData.price.isExplicit || extractedData.taxInclusiveStatus === 'UNSPECIFIED',
    supportingExcerpt: extractedData.price.excerpt,
  });

  // Clause 4: Payment Terms
  const payVal = extractedData.paymentTerms.isExplicit ? extractedData.paymentTerms.value : '[Payment Terms - Needs confirmation]';
  const payAmbiguity = extractedData.paymentTerms.ambiguityNotes ? `\nClarification required: ${extractedData.paymentTerms.ambiguityNotes}` : '';

  clauses.push({
    id: 'clause-payment',
    clauseNumber: 4,
    title: 'Payment Schedule & Conditions',
    body: `Agreed payment mechanism: ${payVal}.${payAmbiguity}\n` +
      `Under MSME commercial norms, payments should be processed in an orderly manner to ensure smooth fulfillment.`,
    needsConfirmation: !extractedData.paymentTerms.isExplicit || !!extractedData.paymentTerms.ambiguityNotes,
    supportingExcerpt: extractedData.paymentTerms.excerpt,
  });

  // Clause 5: Delivery Timeline & Transport
  const delVal = extractedData.deliveryTimeline.isExplicit ? extractedData.deliveryTimeline.value : '[Delivery Date - Needs confirmation]';
  const transVal = extractedData.transportResponsibility.isExplicit ? extractedData.transportResponsibility.value : '[Freight & Transport Responsibility - Unspecified; parties must agree who arranges and pays]';

  clauses.push({
    id: 'clause-delivery',
    clauseNumber: 5,
    title: 'Delivery Timeline and Logistics',
    body: `Target timeline: ${delVal}.\n` +
      `Logistics / Shipping: ${transVal}.\n` +
      `Note: If duration is specified without a calendar date, the start date is presumed to begin upon mutual written confirmation unless agreed otherwise.`,
    needsConfirmation: !extractedData.deliveryTimeline.isExplicit || !extractedData.transportResponsibility.isExplicit,
    supportingExcerpt: extractedData.deliveryTimeline.excerpt,
  });

  // Clause 6: Quality, Inspection & Acceptance
  const qualVal = extractedData.qualityAcceptance.isExplicit ? extractedData.qualityAcceptance.value : '[Inspection & Acceptance: Not stated. Recommended practice: 3 calendar days to inspect upon delivery].';

  clauses.push({
    id: 'clause-quality',
    clauseNumber: 6,
    title: 'Inspection and Quality Acceptance',
    body: `${qualVal}\n` +
      `Prompt inspection upon receipt enables immediate resolution of discrepancies before goods are consumed or services integrated.`,
    needsConfirmation: !extractedData.qualityAcceptance.isExplicit,
    supportingExcerpt: extractedData.qualityAcceptance.excerpt,
  });

  // Clause 7: Delay, Cancellation, or Defect Remedies
  const cancVal = extractedData.cancellationRefund.isExplicit ? extractedData.cancellationRefund.value : '[Cancellation & Delay terms: Unstated in original messages. Both parties should agree on notice periods and costs incurred].';

  clauses.push({
    id: 'clause-remedies',
    clauseNumber: 7,
    title: 'Remedies for Delay or Cancellation',
    body: `${cancVal}\n` +
      `Neither party shall be subject to arbitrary unagreed penalties. Any unforeseen delays shall be communicated promptly in writing.`,
    needsConfirmation: !extractedData.cancellationRefund.isExplicit,
    supportingExcerpt: extractedData.cancellationRefund.excerpt,
  });

  // Clause 8: Summary of Unresolved Questions & Missing Items
  const missingItemsSummary = extractedData.missingTerms.length > 0
    ? extractedData.missingTerms.map((m, idx) => `${idx + 1}. [${m.criticality}] ${m.issue} -> Suggested: "${m.suggestedQuestion}"`).join('\n')
    : 'None detected. All primary commercial parameters have been addressed.';

  clauses.push({
    id: 'clause-unresolved',
    clauseNumber: 8,
    title: 'Unresolved Questions & Assumptions',
    body: `The following items were NOT confirmed in the initial messages and require mutual sign-off:\n\n${missingItemsSummary}`,
    needsConfirmation: extractedData.missingTerms.length > 0,
  });

  // Clause 9: Confirmation Statement (Review Only)
  clauses.push({
    id: 'clause-confirmation',
    clauseNumber: 9,
    title: 'Mutual Draft Review Confirmation',
    body: `Both parties have reviewed the extracted terms above and confirm that this draft accurately reflects their shared commercial understanding, subject to resolving the flagged questions.\n\n` +
      `Status: Draft for Review\n` +
      `Party 1 Signature / Confirmation: ______________________ Date: ________\n` +
      `Party 2 Signature / Confirmation: ______________________ Date: ________`,
    needsConfirmation: true,
  });

  // Compute tamper evidence over clauses
  const clausesText = clauses.map(c => `${c.clauseNumber}. ${c.title}\n${c.body}`).join('\n\n');
  const draftHash = await computeSha256(extractedData.tamperEvidenceHash + ':::' + clausesText);

  const initialAudit: AuditLogEntry[] = [
    {
      timestamp: new Date().toISOString(),
      action: 'DRAFT_GENERATED',
      actor: 'DealProof AI Engine',
      details: `Generated draft v${currentVersion} with ${clauses.length} clauses based on conversation hash ${extractedData.tamperEvidenceHash.slice(0, 10)}...`,
    },
  ];

  return {
    id: existingDraftId || `dp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    version: currentVersion,
    title: extractedData.title,
    status: 'DRAFT_NEEDS_REVIEW',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extractedData,
    clauses,
    tamperEvidenceHash: draftHash,
    auditTrail: initialAudit,
    reviewerNotes: '',
    bothPartiesConfirmed: false,
  };
}
