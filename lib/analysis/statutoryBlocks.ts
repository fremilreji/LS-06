/**
 * Deterministic Statutory Exclusion Blocker
 * 
 * Based on Indian Contract and IT Act jurisprudence (October 2026):
 * 1. Information Technology Act, 2000 - Section 1(4) & First Schedule 
 *    (as amended by MeitY Notification S.O. 4720(E) dated 26 September 2022).
 * 2. Registration Act, 1908 - Section 17(1) & Section 49 (Compulsorily Registrable Documents).
 * 3. Transfer of Property Act, 1882 - Section 53A, Section 54, Section 123.
 * 
 * Commercial chat applications CANNOT be used to execute or create instruments
 * in these excluded categories. When detected, the application MUST issue a hard stop.
 */

export interface StatutoryBlockResult {
  isBlocked: boolean;
  category?: 'FIRST_SCHEDULE_NEGOTIABLE' | 'FIRST_SCHEDULE_POA' | 'FIRST_SCHEDULE_TRUST' | 'FIRST_SCHEDULE_WILL' | 'REGISTRATION_IMMOVABLE_PROPERTY' | 'UNLAWFUL_OBJECT';
  statutoryBasis?: string;
  reason?: string;
  recommendedAction?: string;
  matchedKeywords?: string[];
}

export function checkStatutoryExclusions(rawText: string, title?: string): StatutoryBlockResult {
  const combined = `${title || ''} ${rawText}`.toLowerCase();

  // 1. Negotiable Instruments (other than cheques) - First Schedule, Item 1
  const negotiableMatches = combined.match(/\b(promissory\s*note|pro-note|pronote|bill\s*of\s*exchange|hundi|hundies)\b/i);
  if (negotiableMatches) {
    return {
      isBlocked: true,
      category: 'FIRST_SCHEDULE_NEGOTIABLE',
      statutoryBasis: 'Information Technology Act, 2000 — First Schedule, Item 1 (as substituted in 2022)',
      reason: 'Negotiable instruments (other than cheques) cannot be executed via electronic records or informal messaging under Section 1(4) of the IT Act. Formalities under the Negotiable Instruments Act, 1881 are strictly mandatory.',
      recommendedAction: 'Execute a formal stamped physical promissory note or bill of exchange through an advocate. Do not attempt execution via WhatsApp or digital chat.',
      matchedKeywords: [negotiableMatches[0]],
    };
  }

  // 2. Power of Attorney - First Schedule, Item 2
  const poaMatches = combined.match(/\b(power\s*of\s*attorney|general\s*power\s*of\s*attorney|special\s*power\s*of\s*attorney|\bgpa\b|\bspa\b|authorise\s*to\s*sell\s*property|appoint\s*as\s*attorney)\b/i);
  if (poaMatches) {
    return {
      isBlocked: true,
      category: 'FIRST_SCHEDULE_POA',
      statutoryBasis: 'Information Technology Act, 2000 — First Schedule, Item 2',
      reason: 'Powers of Attorney under Section 1A of the Powers-of-Attorney Act, 1882 are statutorily excluded from electronic execution under the IT Act (outside narrow regulated-entity carve-outs) and often require state-specific notarization and registration.',
      recommendedAction: 'Draft and execute the Power of Attorney on appropriate stamp paper, attested before a Notary Public or Sub-Registrar.',
      matchedKeywords: [poaMatches[0]],
    };
  }

  // 3. Trust Instruments - First Schedule, Item 3
  const trustMatches = combined.match(/\b(trust\s*deed|declaration\s*of\s*trust|create\s*a\s*trust|settlor|trustee\s*appointment)\b/i);
  if (trustMatches) {
    return {
      isBlocked: true,
      category: 'FIRST_SCHEDULE_TRUST',
      statutoryBasis: 'Information Technology Act, 2000 — First Schedule, Item 3',
      reason: 'Trust creation under Section 3 of the Indian Trusts Act, 1882 is excluded from electronic records under the IT Act, and immovable property trusts require registered physical instruments.',
      recommendedAction: 'Engage legal counsel to draft and register a formal Trust Deed before the jurisdictional Sub-Registrar.',
      matchedKeywords: [trustMatches[0]],
    };
  }

  // 4. Wills & Testamentary Dispositions - First Schedule, Item 4
  const willMatches = combined.match(/\b(will|testament|codicil|testamentary|bequeath|inheritance\s*deed)\b/i);
  if (willMatches && !combined.includes('will supply') && !combined.includes('will deliver') && !combined.includes('will pay') && !combined.includes('will do')) {
    return {
      isBlocked: true,
      category: 'FIRST_SCHEDULE_WILL',
      statutoryBasis: 'Information Technology Act, 2000 — First Schedule, Item 4',
      reason: 'Wills and codicils under Section 2(h) of the Indian Succession Act, 1925 are statutorily excluded from the IT Act and require mandatory physical attestation by at least two independent witnesses.',
      recommendedAction: 'Execute a formal physical Will with two attesting witnesses. Legal consultation is advised.',
      matchedKeywords: [willMatches[0]],
    };
  }

  // 5. Immovable Property Transfers & Long Leases - Registration Act Section 17 & TPA 1882
  const propertyMatches = combined.match(/\b(sale\s*deed|conveyance\s*of\s*(?:flat|land|plot|house|building)|transfer\s*of\s*property|flat\s*registry|plot\s*registry|mortgage\s*deed|gift\s*deed\s*of\s*property|lease\s*for\s*(?:2|3|4|5|10|99)\s*years|lease\s*exceeding\s*one\s*year|part\s*performance\s*under\s*53a)\b/i);
  if (propertyMatches) {
    return {
      isBlocked: true,
      category: 'REGISTRATION_IMMOVABLE_PROPERTY',
      statutoryBasis: 'Registration Act, 1908 — Section 17(1) & Transfer of Property Act, 1882',
      reason: 'Instruments creating, declaring, assigning, or extinguishing rights in immovable property, and leases exceeding one year, are subject to compulsory registration under Section 17 of the Registration Act, 1908. Under Section 49, an unregistered document cannot affect the property or be received as evidence of a transaction affecting it.',
      recommendedAction: 'Formal conveyance/deed required. This transaction must be drafted by an advocate and registered before the Sub-Registrar after paying requisite state stamp duty and registration fees.',
      matchedKeywords: [propertyMatches[0]],
    };
  }

  return { isBlocked: false };
}
