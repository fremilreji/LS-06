import { MissingTermIssue, AmbiguousTermIssue, PartyInfo, ExtractedTermItem } from '@/types/agreement';

/**
 * Detects missing commercial terms, legal ambiguities, and transaction gaps
 * with suggested questions and criticality assessment.
 */
export function detectMissingAndAmbiguousTerms(data: {
  partyA: PartyInfo;
  partyB: PartyInfo;
  scopeOrProducts: ExtractedTermItem;
  quantity: ExtractedTermItem;
  price: ExtractedTermItem;
  taxInclusiveStatus: 'INCLUSIVE' | 'EXCLUSIVE' | 'UNSPECIFIED';
  paymentTerms: ExtractedTermItem;
  deliveryTimeline: ExtractedTermItem;
  transportResponsibility: ExtractedTermItem;
  qualityAcceptance: ExtractedTermItem;
  cancellationRefund: ExtractedTermItem;
  rawText: string;
}): { missingTerms: MissingTermIssue[]; ambiguousTerms: AmbiguousTermIssue[]; completenessScore: number } {
  const missing: MissingTermIssue[] = [];
  const ambiguous: AmbiguousTermIssue[] = [];

  // 1. Party Identities
  if (!data.partyA.isExplicit || data.partyA.name.toLowerCase().includes('party') || data.partyA.confidence === 'LOW') {
    missing.push({
      id: 'miss-party-a',
      category: 'PARTIES',
      issue: 'Exact legal name and registered entity of the First Party (Supplier / Provider) is unspecified.',
      whyItMatters: 'Agreements cannot be enforced or invoiced without knowing whether the party is an individual, proprietorship, LLP, or private limited company.',
      suggestedQuestion: 'What is your registered business name, authorized signatory name, and address?',
      criticality: 'CRITICAL',
    });
  }

  if (!data.partyB.isExplicit || data.partyB.confidence === 'LOW' || data.partyB.name.toLowerCase().includes('party')) {
    missing.push({
      id: 'miss-party-b',
      category: 'PARTIES',
      issue: 'Exact legal name and business entity of the Second Party (Buyer / Client) is unspecified.',
      whyItMatters: 'Informal names (e.g., first name only) make identification difficult if disputes arise regarding who is financially liable.',
      suggestedQuestion: 'What is the full legal entity name, GSTIN, and address of the counterparty?',
      criticality: 'CRITICAL',
    });
  } else if (data.partyB.clarificationNeeded) {
    ambiguous.push({
      id: 'amb-party-role',
      term: 'Counterparty Role Confirmation',
      conflictingStatements: [data.partyB.excerpt || 'Addressed by first name'],
      explanation: data.partyB.clarificationNeeded,
      suggestedResolution: 'Confirm whether the person addressed is contracting as an individual buyer or representing an organization.',
    });
  }

  // 2. Pricing and Tax (GST)
  if (!data.price.value || data.price.value.toLowerCase().includes('unknown') || data.price.value.toLowerCase().includes('needs confirmation')) {
    missing.push({
      id: 'miss-price',
      category: 'PRICING_TAX',
      issue: 'Total agreed price or rate schedule is missing.',
      whyItMatters: 'Financial consideration is a mandatory element of any commercial contract.',
      suggestedQuestion: 'What is the exact agreed total amount or unit rate?',
      criticality: 'CRITICAL',
    });
  } else {
    // Check tax specification
    if (data.taxInclusiveStatus === 'UNSPECIFIED') {
      missing.push({
        id: 'miss-tax-gst',
        category: 'PRICING_TAX',
        issue: 'Tax applicability (GST 5%/12%/18%) is not specified as inclusive or extra.',
        whyItMatters: 'In MSME transactions, a 18% GST difference often leads to bitter disputes at the time of final invoice settlement.',
        suggestedQuestion: 'Does the stated price include GST and applicable levies, or will GST be charged extra?',
        criticality: 'IMPORTANT',
      });
    }
  }

  // 3. Payment Terms and Timelines
  const pVal = data.paymentTerms.value.toLowerCase();
  if (!pVal || pVal.includes('unknown') || pVal.includes('needs confirmation')) {
    missing.push({
      id: 'miss-payment-timing',
      category: 'PAYMENT',
      issue: 'Payment milestone or credit terms are not defined.',
      whyItMatters: 'MSMED Act Section 15 requires agreed payment within 45 days. Lack of payment schedule causes working capital lockup.',
      suggestedQuestion: 'When is payment due (e.g., 50% advance, balance within 7 days of delivery)?',
      criticality: 'CRITICAL',
    });
  } else if (pVal.includes('after delivery') && !pVal.match(/\d+\s*(day|days|week|hours)/)) {
    ambiguous.push({
      id: 'amb-payment-window',
      term: 'Indefinite Post-Delivery Payment Window',
      conflictingStatements: [data.paymentTerms.excerpt || 'You can pay after delivery'],
      explanation: 'Stating "pay after delivery" without a specific window (e.g. 7 days, 15 days) creates ambiguity over when a payment becomes legally overdue.',
      suggestedResolution: 'Specify the exact number of calendar days after delivery by which full settlement is due.',
    });
  }

  // 4. Delivery Date & Logistics
  const dVal = data.deliveryTimeline.value.toLowerCase();
  if (!dVal || dVal.includes('unknown') || dVal.includes('needs confirmation')) {
    missing.push({
      id: 'miss-delivery-date',
      category: 'DELIVERY',
      issue: 'Delivery timeline or completion date is absent.',
      whyItMatters: 'Without a clear delivery date or countdown start trigger, delays cannot be held against either party.',
      suggestedQuestion: 'What is the committed delivery date or number of days from order confirmation?',
      criticality: 'CRITICAL',
    });
  } else if (dVal.includes('within') && !dVal.includes('from') && !data.rawText.toLowerCase().includes('starting from')) {
    ambiguous.push({
      id: 'amb-delivery-start',
      term: 'Delivery Timeline Start Trigger',
      conflictingStatements: [data.deliveryTimeline.excerpt || 'Deliver them within 10 days'],
      explanation: 'The timeline specifies a duration (e.g., "within 10 days") but does not establish whether the clock starts from message date, PO issuance, or advance receipt.',
      suggestedResolution: 'Clarify: Does the countdown begin from order confirmation date or receipt of token advance?',
    });
  }

  // 5. Freight & Transport Responsibility
  if (!data.transportResponsibility.value || data.transportResponsibility.value.toLowerCase().includes('unknown') || data.transportResponsibility.value.toLowerCase().includes('unspecified')) {
    missing.push({
      id: 'miss-transport',
      category: 'DELIVERY',
      issue: 'Freight, shipping cost, and transit risk responsibility is unspecified.',
      whyItMatters: 'If goods are damaged in transit or shipping costs are high, who pays and who bears the loss must be settled beforehand.',
      suggestedQuestion: 'Who arranges and pays for shipping/transport, and who bears transit insurance risk?',
      criticality: 'IMPORTANT',
    });
  }

  // 6. Quality Acceptance & Inspection Window
  if (!data.qualityAcceptance.value || data.qualityAcceptance.value.toLowerCase().includes('unknown') || data.qualityAcceptance.value.toLowerCase().includes('unspecified')) {
    missing.push({
      id: 'miss-quality-inspection',
      category: 'QUALITY_INSPECTION',
      issue: 'Inspection window and defect reporting mechanism are unmentioned.',
      whyItMatters: 'Buyers must inspect goods/services upon receipt. Without an inspection cutoff (e.g. 48 hours), claims can be made weeks later.',
      suggestedQuestion: 'How many days does the buyer have to inspect goods and report defects or discrepancies?',
      criticality: 'IMPORTANT',
    });
  }

  // 7. Cancellation or Delay Remedies
  if (!data.cancellationRefund.value || data.cancellationRefund.value.toLowerCase().includes('unknown') || data.cancellationRefund.value.toLowerCase().includes('unspecified')) {
    missing.push({
      id: 'miss-cancellation-delay',
      category: 'CANCELLATION',
      issue: 'Remedies for cancellation, delayed delivery, or non-performance are missing.',
      whyItMatters: 'Small businesses often face last-minute cancellations without compensation after procuring raw materials or starting work.',
      suggestedQuestion: 'What happens if either party cancels or delivery is delayed due to unforeseen reasons?',
      criticality: 'RECOMMENDED',
    });
  }

  // Calculate Completeness Score (0-100)
  // Baseline 100, deduct based on missing issues
  let score = 100;
  for (const m of missing) {
    if (m.criticality === 'CRITICAL') score -= 18;
    else if (m.criticality === 'IMPORTANT') score -= 10;
    else score -= 5;
  }
  for (const _a of ambiguous) {
    score -= 6;
  }
  const finalScore = Math.max(15, Math.min(100, score));

  return {
    missingTerms: missing,
    ambiguousTerms: ambiguous,
    completenessScore: finalScore,
  };
}
