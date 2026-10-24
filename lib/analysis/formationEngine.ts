/**
 * Contract Formation & Chronology Engine
 * 
 * Implements doctrinal Indian Contract Act, 1872 principles:
 * - Section 2(a) Proposal / Offer
 * - Section 7 Absolute and unqualified acceptance (Mirror-image rule)
 * - Section 62 Consensual post-formation alteration / novation
 * - Section 63 Promisee-granted extension of time
 * - Supreme Court ruling in Ambalal Sarabhai v. KS Infraspace (2020) on virtual verbal chats
 * - Supreme Court ruling in Haridwar Singh v. Bagun Sumbrui (1973) on conditional acceptance
 */

export type FormationState = 
  | 'INITIAL_NEGOTIATION'
  | 'OFFER_MADE'
  | 'COUNTER_OFFER_EXTINGUISHED'
  | 'QUALIFIED_RESPONSE_UNRESOLVED'
  | 'FORMATION_CONCLUDED'
  | 'POST_FORMATION_SECTION_62_ALTERATION'
  | 'TIME_EXTENDED_SECTION_63'
  | 'AMBIGUOUS_REQUIRES_HUMAN_REVIEW';

export interface FormationAnalysis {
  state: FormationState;
  stateLabel: string;
  isConcluded: boolean;
  requiresReview: boolean;
  doctrinalFinding: string;
  statutoryReference: string;
  ambiguityFlags: string[];
  chronologySummary: string[];
}

export function analyzeContractFormation(rawText: string): FormationAnalysis {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const ambiguityFlags: string[] = [];
  const chronologySummary: string[] = [];

  // Check for ambiguous tokens (Ambalal Sarabhai principle)
  if (lower.includes('👍') || lower.includes('👌') || lower.includes('seen') || lower.match(/\b(ok|okay|k)\b/i)) {
    ambiguityFlags.push('Ambiguous token or emoji detected ("ok" / "👍"). Under Indian law, casual acknowledgments do not automatically constitute absolute and unqualified acceptance.');
  }

  if (lower.includes('subject to') || lower.includes('management approval') || lower.includes('pending po') || lower.includes('will send po')) {
    ambiguityFlags.push('Condition precedent detected ("subject to approval" / "will send PO"). Stays at negotiation until condition is fulfilled.');
  }

  // Check for counter-offer cues before formation (e.g. "accepted, but", "provided that", "can you do ₹")
  const hasCounterOfferCues = /(?:provided\s*that|but\s*(?:delivery|price|quantity)|can\s*you\s*do|reduce\s*to|only\s*if|instead\s*of)/i.test(lower);
  
  // Check for post-formation alteration cues (e.g. "delay delivery to", "shift delivery from ... to ...", "revise date")
  const hasSection62Cues = /(?:shift\s*delivery|extend\s*(?:delivery|timeline|time)|deliver\s*by\s*later|revised\s*delivery|reschedule)/i.test(lower);

  // Check for communicated acceptance
  const hasUnqualifiedAcceptance = /(?:confirmed\.?\s*please\s*proceed|deal\s*confirmed|order\s*confirmed|we\s*accept\s*(?:your|the)\s*(?:offer|terms|price)|all\s*terms\s*accepted|proceed\s*with\s*(?:the\s*)?order)/i.test(lower);
  const hasSimpleAcceptance = /(?:please\s*confirm|kindly\s*confirm)/i.test(lower);

  // Trace chronology
  if (hasCounterOfferCues && !hasSection62Cues) {
    chronologySummary.push('1. Initial proposal made with specific commercial terms.');
    chronologySummary.push('2. Response modified an essential term (price/delivery/scope).');
    chronologySummary.push('3. Under Section 7 ICA (Haridwar Singh principle), this response acts as a counter-offer that extinguishes the prior offer.');

    return {
      state: 'COUNTER_OFFER_EXTINGUISHED',
      stateLabel: 'Possible Counter-Offer — Prior Offer Extinguished',
      isConcluded: false,
      requiresReview: true,
      doctrinalFinding: 'A response varying a material term (price, timeline, or scope) is a counter-proposal rather than acceptance under Section 7 of the Indian Contract Act, 1872. It resets the offer stack and requires fresh acceptance from the original offeror.',
      statutoryReference: 'Indian Contract Act, 1872 — Section 7 & Section 2(a)',
      ambiguityFlags,
      chronologySummary,
    };
  }

  if (hasSection62Cues) {
    chronologySummary.push('1. Material commercial terms concluded earlier in the exchange.');
    chronologySummary.push('2. Subsequent mutual request to modify delivery timeline or specifications.');
    chronologySummary.push('3. Qualifies as a potential Section 62 consensual alteration rather than a counter-offer.');

    return {
      state: 'POST_FORMATION_SECTION_62_ALTERATION',
      stateLabel: 'Possible Post-Contract Alteration (Section 62 ICA)',
      isConcluded: true,
      requiresReview: true,
      doctrinalFinding: 'Where the primary bargain was previously concluded, a later mutual adjustment of delivery or payment terms is analyzed under Section 62 of the Indian Contract Act, 1872 (alteration) rather than a counter-offer. The original contract stands as modified if both sides assented.',
      statutoryReference: 'Indian Contract Act, 1872 — Section 62 & Section 63',
      ambiguityFlags,
      chronologySummary,
    };
  }

  if (hasUnqualifiedAcceptance) {
    chronologySummary.push('1. Proposal communicated with definite quantity, price, and deliverables.');
    chronologySummary.push('2. Unconditional and unqualified assent communicated in reply.');

    return {
      state: 'FORMATION_CONCLUDED',
      stateLabel: 'Offer & Unqualified Acceptance Communicated',
      isConcluded: true,
      requiresReview: ambiguityFlags.length > 0,
      doctrinalFinding: 'The conversation records an offer accompanied by unconditional communicated acceptance matching Section 2(b) and Section 7 of the Indian Contract Act, 1872, reinforced by Section 10A of the IT Act, 2000.',
      statutoryReference: 'Indian Contract Act, 1872 — Section 10, Section 2(b), Section 7; IT Act 2000 Section 10A',
      ambiguityFlags,
      chronologySummary,
    };
  }

  if (hasSimpleAcceptance) {
    chronologySummary.push('1. Offer terms transmitted by provider ("Please confirm").');
    chronologySummary.push('2. Counterparty response or explicit confirmation is pending.');

    return {
      state: 'OFFER_MADE',
      stateLabel: 'Offer Stated — Counterparty Acceptance Pending',
      isConcluded: false,
      requiresReview: true,
      doctrinalFinding: 'The message articulates an offer ("Please confirm") but counterparty acceptance has not yet been recorded in the submitted excerpt. Formation remains pending under Section 2(b) ICA.',
      statutoryReference: 'Indian Contract Act, 1872 — Section 2(a) & Section 4',
      ambiguityFlags,
      chronologySummary,
    };
  }

  return {
    state: 'AMBIGUOUS_REQUIRES_HUMAN_REVIEW',
    stateLabel: 'Commercial Negotiations — Human Review Required',
    isConcluded: false,
    requiresReview: true,
    doctrinalFinding: 'Communications demonstrate commercial negotiations. Under Supreme Court precedent (Ambalal Sarabhai v. KS Infraspace, 2020), casual digital messages require contextual evidentiary proof to substantiate whether consensus ad idem was reached.',
    statutoryReference: 'Indian Contract Act, 1872 — Section 10; Ambalal Sarabhai (2020)',
    ambiguityFlags,
    chronologySummary,
  };
}
