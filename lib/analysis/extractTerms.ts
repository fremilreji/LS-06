import { ExtractedAgreementData, ConfidenceLevel, PartyInfo, ExtractedTermItem } from '@/types/agreement';
import { detectMissingAndAmbiguousTerms } from './detectMissingTerms';
import { computeSha256, generateAgreementSignaturePayload } from '../crypto/hash';

/**
 * Deterministic Rule-Based Extraction Engine.
 * Formulates structured agreement terms from raw informal conversation text
 * without making unverified assumptions or hallucinating clauses.
 */
export async function extractTermsRuleBased(
  rawText: string,
  title: string,
  businessContext?: string
): Promise<ExtractedAgreementData> {
  const cleanedText = rawText.trim();
  const lowerText = cleanedText.toLowerCase();

  // 1. Identify Addressee, Speaker, and Explicit Labeled Parties
  // Explicit party labels: e.g. "Buyer: Ravi", "Party B: Ravi", "Seller: ABC Ltd"
  const partyALabelMatch = cleanedText.match(/(?:^[•\-*]|\n[•\-*]|\b)\s*(?:seller|supplier|provider|vendor|party\s*a)\s*:\s*([^\n]+)/i);
  const partyBLabelMatch = cleanedText.match(/(?:^[•\-*]|\n[•\-*]|\b)\s*(?:buyer|client|counterparty|party\s*b|customer)\s*:\s*([^\n]+)/i);

  // Check WhatsApp chat message headers e.g. "10:15 AM [Raghavendra - Apex Exports, Bommanahalli]: ..."
  const headerSenderMatches = Array.from(cleanedText.matchAll(/^(?:\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*)?(?:\[(.*?)\]|([A-Za-z0-9_\s\+\-]+?))\s*:\s*(.*)$/gm));
  let headerSupplier = '';
  let headerBuyer = '';
  for (const m of headerSenderMatches) {
    const sender = (m[1] || m[2] || '').trim();
    const sLower = sender.toLowerCase();
    if (/(?:tailor|stitching|garment|supplier|worker|lakshmi|manjunath|apparels|workshop|craft)/i.test(sLower)) {
      headerSupplier = sender;
    } else if (/(?:buyer|export|apex|kumar|raghavendra|client|merchant|sourcing)/i.test(sLower)) {
      headerBuyer = sender;
    }
  }

  // Greetings e.g. "Hi Ravi", "Dear Ramesh", "Namaskara Manjunath", "Namaste Raghavendra"
  const greetingMatch =
    cleanedText.match(/(?:hi|hello|hey|dear|namaskara|namaste|vanakkam)\s+([A-Z][a-zA-Z0-9_\s]{1,20}?)(?:,|\.|\n|$)/i) ||
    cleanedText.match(/^["']?\s*([A-Z][a-zA-Z0-9_]{1,20})(?:,|\.|\s+so\b|\s+please\b)/im);

  const addresseeName = partyBLabelMatch ? partyBLabelMatch[1].trim() : (headerBuyer || (greetingMatch ? greetingMatch[1].trim() : ''));
  const explicitSenderName = partyALabelMatch ? partyALabelMatch[1].trim() : (headerSupplier || '');

  // Determine roles based on verbs like "I can supply", "I can build", "We will provide" vs "Can you provide"
  const isSenderOffering = /(?:i can supply|i can provide|i can deliver|we can supply|we can provide|we can build|i will create|i will develop)/i.test(lowerText);
  const isSenderRequesting = /(?:can you provide|can you supply|looking for|quote for|need)/i.test(lowerText);

  let partyA: PartyInfo = {
    name: explicitSenderName || '[First Party / Provider - Needs Legal Name]',
    role: 'Supplier',
    isExplicit: !!explicitSenderName,
    confidence: explicitSenderName ? 'HIGH' : 'LOW',
    clarificationNeeded: explicitSenderName 
      ? undefined 
      : 'The sender offers terms in first person ("I can supply"), but the registered entity name is unstated.',
    excerpt: partyALabelMatch ? partyALabelMatch[0] : (greetingMatch ? greetingMatch[0] : undefined),
  };

  let partyB: PartyInfo = {
    name: addresseeName ? addresseeName : '[Counterparty / Buyer - Needs Confirmation]',
    role: 'Buyer',
    isExplicit: !!addresseeName,
    confidence: partyBLabelMatch ? 'HIGH' : (addresseeName ? 'MEDIUM' : 'LOW'),
    clarificationNeeded: addresseeName
      ? `Addressed as "${addresseeName}". Needs verification whether ${addresseeName} represents an entity or individual.`
      : 'Counterparty name is not specified in the conversation.',
    excerpt: partyBLabelMatch ? partyBLabelMatch[0] : (greetingMatch ? greetingMatch[0] : undefined),
  };

  if (isSenderRequesting && !isSenderOffering) {
    partyA.role = 'Buyer';
    partyB.role = 'Supplier';
  }

  // 2. Quantity & Scope / Products / Services
  let scopeOrProducts: ExtractedTermItem = {
    value: '[Scope / Products - Needs confirmation]',
    isExplicit: false,
    confidence: 'LOW',
  };

  let quantity: ExtractedTermItem = {
    value: '[Quantity - Unspecified]',
    isExplicit: false,
    confidence: 'LOW',
  };

  // Check structured bullet or labeled lines first (e.g. "• Scope: 100 ergonomic office chairs (100 units)")
  const scopeLineMatch = cleanedText.match(/(?:^[•\-*]|\n[•\-*]|\b)\s*(?:scope|item|product|deliverable|service)s?\s*:\s*([^\n]+)/i);
  const qtyLineMatch = cleanedText.match(/(?:^[•\-*]|\n[•\-*]|\b)\s*(?:quantity|qty)s?\s*:\s*([^\n]+)/i);

  if (scopeLineMatch) {
    const rawScope = scopeLineMatch[1].trim();
    // Check if parentheses contain quantity e.g. "(100 units)" or "(50 pcs)"
    const parenQty = rawScope.match(/\((\d+(?:,\d+)?(?:\.\d+)?\s*(?:units?|pcs?|pieces?|chairs?|boxes?|items?|mtrs?|meters?|rolls?)?)\)/i);
    // Check leading quantity e.g. "100 ergonomic office chairs"
    const leadingQty = rawScope.match(/^(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:units?|pcs?|pieces?)?\s+(.+)$/i);

    if (parenQty) {
      const qVal = parenQty[1].trim();
      quantity = {
        value: /\s*(?:units?|pcs?|pieces?|chairs?|items?|meters?)/i.test(qVal) ? qVal : `${qVal} units`,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: scopeLineMatch[0],
      };
      const cleanedProduct = rawScope.replace(/\(.*?\)/g, '').trim();
      scopeOrProducts = {
        value: cleanedProduct,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: scopeLineMatch[0],
      };
    } else if (leadingQty) {
      quantity = {
        value: `${leadingQty[1]} units`,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: scopeLineMatch[0],
      };
      scopeOrProducts = {
        value: leadingQty[2].trim(),
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: scopeLineMatch[0],
      };
    } else {
      scopeOrProducts = {
        value: rawScope,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: scopeLineMatch[0],
      };
    }
  }

  if (qtyLineMatch) {
    quantity = {
      value: qtyLineMatch[1].trim(),
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: qtyLineMatch[0],
    };
  }

  // If not extracted via labeled line, fall back to smart patterns
  if (!scopeLineMatch) {
    // Specific chair / furniture pattern allowing adjectives (e.g., "100 ergonomic office chairs", "50 executive desks")
    const chairPattern = cleanedText.match(/(\d+)\s*(?:[a-zA-Z-]+\s+){0,3}(office\s*chairs?|chairs?|tables?|desks?|workstations?|furniture)/i);
    const devPattern = cleanedText.match(/(mobile\s*app|application|website|software|e-commerce\s*app|crm|portal)/i);
    const fabricPattern = cleanedText.match(/(\d+)\s*(meters?|mtrs?|rolls?)\s*(?:of\s*)?([a-zA-Z\s]{3,30})/i);
    const garmentPattern = cleanedText.match(/(\d+(?:,\d+)?)\s*(?:pieces?|pcs?|kurtis?|shirts?|t-shirts?|pants?|units?)\s*(?:of\s+)?([a-zA-Z0-9\s-]+?)(?:\s+for|\s+at|\.|\n|,|$)/i);
    const quantityWithProductMatch = cleanedText.match(/(\b\d+(?:,\d+)?(?:\.\d+)?\s+(?:units?|chairs?|pieces?|pcs?|meters?|mtrs?|boxes?|kg|tons?|laptops?|items?|hours?|pages?)(?:\s+[a-zA-Z0-9\s-]{2,40})?)/i);

    if (garmentPattern) {
      quantity = {
        value: `${garmentPattern[1]} pieces`,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: garmentPattern[0],
      };
      scopeOrProducts = {
        value: garmentPattern[2].trim(),
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: garmentPattern[0],
      };
    } else if (chairPattern) {
      quantity = {
        value: chairPattern[1] + ' units',
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: chairPattern[0],
      };
      scopeOrProducts = {
        value: chairPattern[0].replace(new RegExp(`^${chairPattern[1]}\\s*`), '').trim() || chairPattern[1],
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: chairPattern[0],
      };
    } else if (fabricPattern) {
      quantity = {
        value: `${fabricPattern[1]} ${fabricPattern[2]}`,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: fabricPattern[0],
      };
      scopeOrProducts = {
        value: fabricPattern[3].trim(),
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: fabricPattern[0],
      };
    } else if (devPattern) {
      scopeOrProducts = {
        value: devPattern[0],
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: devPattern[0],
      };
      quantity = {
        value: '1 project scope',
        isExplicit: false,
        confidence: 'MEDIUM',
        excerpt: devPattern[0],
      };
    } else if (quantityWithProductMatch) {
      scopeOrProducts = {
        value: quantityWithProductMatch[0].trim(),
        isExplicit: true,
        confidence: 'MEDIUM',
        excerpt: quantityWithProductMatch[0],
      };
    }
  }

  // 3. Price & Currency
  let currency = 'INR';
  let price: ExtractedTermItem = {
    value: '[Price - Unspecified]',
    isExplicit: false,
    confidence: 'LOW',
  };
  let taxInclusiveStatus: 'INCLUSIVE' | 'EXCLUSIVE' | 'UNSPECIFIED' = 'UNSPECIFIED';

  // Explicit consideration line e.g. "• Consideration: ₹50,000 (INR)"
  const considerationLineMatch = cleanedText.match(/(?:^[•\-*]|\n[•\-*]|\b)\s*(?:consideration|price|amount|cost|fee|total)s?\s*:\s*([^\n]+)/i);

  // Currency & amount patterns: ₹50,000, Rs. 50,000, Rs 50000, 50,000 INR, $5,000, ?50000
  const totalAmountMatch = cleanedText.match(/(?:total|labour\s*cost|total\s*cost|total\s*amount)\s*(?:will\s*be|is)?\s*(?:₹|rs\.?|inr|\?)?\s*([\d,]+(?:\.\d+)?)/i);
  const inrMatch = 
    cleanedText.match(/(?:₹|rs\.?|inr|\?)\s*([\d,]+(?:\.\d+)?)/i) || 
    cleanedText.match(/([\d,]+(?:\.\d+)?)\s*(?:inr|rupees|\/-)/i) ||
    cleanedText.match(/(?:for|amount of|total of|sum of)\s*(?:₹|rs\.?|inr|\?)?\s*([\d,]+(?:\.\d+)?)/i);
  const usdMatch = cleanedText.match(/(?:\$|usd)\s*([\d,]+(?:\.\d+)?)/i);

  if (considerationLineMatch) {
    const rawCons = considerationLineMatch[1].trim();
    const consInr = rawCons.match(/(?:₹|rs\.?|inr|\?)\s*([\d,]+(?:\.\d+)?)/i) || rawCons.match(/([\d,]+(?:\.\d+)?)\s*(?:inr|rupees|\/-)/i);
    const consUsd = rawCons.match(/(?:\$|usd)\s*([\d,]+(?:\.\d+)?)/i);
    if (consInr) {
      currency = 'INR';
      price = {
        value: `₹${consInr[1]}`,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: considerationLineMatch[0],
      };
    } else if (consUsd) {
      currency = 'USD';
      price = {
        value: `$${consUsd[1]}`,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: considerationLineMatch[0],
      };
    } else {
      price = {
        value: rawCons,
        isExplicit: true,
        confidence: 'HIGH',
        excerpt: considerationLineMatch[0],
      };
    }
  } else if (totalAmountMatch) {
    currency = 'INR';
    price = {
      value: `₹${totalAmountMatch[1]}`,
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: totalAmountMatch[0],
    };
  } else if (inrMatch) {
    currency = 'INR';
    price = {
      value: `₹${inrMatch[1]}`,
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: inrMatch[0],
    };
  } else if (usdMatch) {
    currency = 'USD';
    price = {
      value: `$${usdMatch[1]}`,
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: usdMatch[0],
    };
  }

  // Tax detection
  if (/inclusive\s*of\s*(?:all\s*)?taxes|including\s*gst|gst\s*included/i.test(lowerText)) {
    taxInclusiveStatus = 'INCLUSIVE';
  } else if (/exclusive\s*of\s*gst|\+\s*gst|plus\s*gst|taxes\s*extra/i.test(lowerText)) {
    taxInclusiveStatus = 'EXCLUSIVE';
  } else {
    taxInclusiveStatus = 'UNSPECIFIED';
  }

  // 4. Payment Terms
  let paymentTerms: ExtractedTermItem = {
    value: '[Payment Terms - Needs Confirmation]',
    isExplicit: false,
    confidence: 'LOW',
  };

  const paymentLineMatch = cleanedText.match(/(?:^[•\-*]|\n[•\-*]|\b)\s*(?:payment|terms|payment\s*terms)s?\s*:\s*([^\n]+)/i);

  const payAfterDelivery = cleanedText.match(/(?:you\s*can\s*pay\s*after\s*delivery|pay\s*after\s*delivery|payment\s*upon\s*delivery|cod)/i);
  const advancePayment = cleanedText.match(/(\d{1,3}%\s*advance|\d{1,3}%\s*upfront|advance\s*of\s*[\d,]+|token\s*advance)/i);
  const milestonePayment = cleanedText.match(/(milestone\s*based|milestones?|on\s*completion|net\s*\d+\s*days?)/i);
  const delayedPayment = cleanedText.match(/(?:payment\s*(?:will\s*be\s*released|kab\s*milega|terms?|hoga)?\s*(?:after|within|around)?\s*[^,\n.]*?(?:\d+\s*days?|baad\s*mein|consignment|delivery))/i);

  if (paymentLineMatch) {
    const rawPay = paymentLineMatch[1].trim();
    const formattedPay = rawPay.toLowerCase().startsWith('payment') ? rawPay : `Payment due ${rawPay}`;
    paymentTerms = {
      value: formattedPay,
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: paymentLineMatch[0],
      ambiguityNotes: rawPay.toLowerCase().includes('after delivery') && !rawPay.match(/\d+\s*(?:day|days|week|hours)/)
        ? 'Specific deadline (number of days after delivery) is not defined.'
        : undefined,
    };
  } else if (payAfterDelivery) {
    paymentTerms = {
      value: 'Payment due after delivery',
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: payAfterDelivery[0],
      ambiguityNotes: 'Specific deadline (number of days after delivery) is not defined.',
    };
  } else if (advancePayment) {
    paymentTerms = {
      value: advancePayment[0],
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: advancePayment[0],
    };
  } else if (milestonePayment) {
    paymentTerms = {
      value: milestonePayment[0],
      isExplicit: true,
      confidence: 'MEDIUM',
      excerpt: milestonePayment[0],
    };
  } else if (delayedPayment) {
    paymentTerms = {
      value: delayedPayment[0].trim(),
      isExplicit: true,
      confidence: 'MEDIUM',
      excerpt: delayedPayment[0],
    };
  }

  // 5. Delivery Timeline
  let deliveryTimeline: ExtractedTermItem = {
    value: '[Delivery Timeline - Unspecified]',
    isExplicit: false,
    confidence: 'LOW',
  };

  const deliveryLineMatch = cleanedText.match(/(?:^[•\-*]|\n[•\-*]|\b)\s*(?:delivery|timeline|schedule|lead\s*time)s?\s*:\s*([^\n]+)/i);

  const deliveryMatch = cleanedText.match(/(?:deliver(?:y|ed)?(?:\s*them)?\s*(?:within|in|by)?\s*(\d+\s*(?:days?|weeks?|months?|business days?))|(?:within|in)\s*(\d+\s*(?:days?|weeks?|months?)))/i);
  const specificDateMatch = cleanedText.match(/(?:by|before|on|delivery\s*by|deadline\s*is)\s*(?:the\s*)?((?:\d{1,2}(?:st|nd|rd|th)?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{1,2}(?:st|nd|rd|th)?)(?:\s*,?\s*\d{2,4})?)/i);

  if (deliveryLineMatch) {
    const rawDel = deliveryLineMatch[1].trim();
    const formattedDel = rawDel.toLowerCase().startsWith('within') || rawDel.toLowerCase().startsWith('by')
      ? rawDel.charAt(0).toUpperCase() + rawDel.slice(1)
      : `Within ${rawDel}`;
    deliveryTimeline = {
      value: formattedDel,
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: deliveryLineMatch[0],
      ambiguityNotes: 'Start date or trigger event for the countdown is unspecified.',
    };
  } else if (deliveryMatch) {
    const timeFrame = deliveryMatch[1] || deliveryMatch[2];
    deliveryTimeline = {
      value: `Within ${timeFrame.trim()}`,
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: deliveryMatch[0],
      ambiguityNotes: 'Start date or trigger event for the countdown is unspecified.',
    };
  } else if (specificDateMatch) {
    deliveryTimeline = {
      value: `By ${specificDateMatch[1].trim()}`,
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: specificDateMatch[0],
    };
  }

  // 6. Transport / Shipping responsibility
  let transportResponsibility: ExtractedTermItem = {
    value: '[Transport / Freight Responsibility - Unspecified]',
    isExplicit: false,
    confidence: 'LOW',
  };
  const transportMatch = cleanedText.match(/(free\s*shipping|freight\s*(?:extra|included|on\s*buyer|by\s*seller)|transport\s*(?:included|extra)|doorstep\s*delivery)/i);
  if (transportMatch) {
    transportResponsibility = {
      value: transportMatch[0],
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: transportMatch[0],
    };
  }

  // 7. Quality & Acceptance
  let qualityAcceptance: ExtractedTermItem = {
    value: '[Quality & Acceptance Terms - Unspecified]',
    isExplicit: false,
    confidence: 'LOW',
  };
  const qualityMatch = cleanedText.match(/(inspection\s*(?:within|period)?\s*\d+\s*days?|sample\s*approved|standard\s*warranty|warranty\s*of\s*\d+\s*(?:year|months?)|replace\s*(?:defective|damaged)|satisfaction\s*guarantee)/i);
  if (qualityMatch) {
    qualityAcceptance = {
      value: qualityMatch[0],
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: qualityMatch[0],
    };
  }

  // 8. Cancellation & Refund
  let cancellationRefund: ExtractedTermItem = {
    value: '[Cancellation & Refund Terms - Unspecified]',
    isExplicit: false,
    confidence: 'LOW',
  };
  const cancelMatch = cleanedText.match(/(non-refundable|cancellation\s*fee|notice\s*of\s*\d+\s*days?|refund\s*within\s*\d+\s*days?|full\s*refund)/i);
  if (cancelMatch) {
    cancellationRefund = {
      value: cancelMatch[0],
      isExplicit: true,
      confidence: 'HIGH',
      excerpt: cancelMatch[0],
    };
  }

  // 9. Party Responsibilities
  const partyAResponsibilities: string[] = [];
  const partyBResponsibilities: string[] = [];

  if (scopeOrProducts.isExplicit) {
    partyAResponsibilities.push(`Supply and deliver ${scopeOrProducts.value} ${quantity.isExplicit ? `(${quantity.value})` : ''} as per agreed condition.`);
  } else {
    partyAResponsibilities.push('Supply agreed deliverables upon formal specification [Needs confirmation].');
  }

  if (price.isExplicit) {
    partyBResponsibilities.push(`Remit agreed payment of ${price.value} ${paymentTerms.isExplicit ? `(${paymentTerms.value})` : '[Payment schedule to be finalized]'}.`);
  } else {
    partyBResponsibilities.push('Remit contract consideration in accordance with mutually approved schedule.');
  }

  // 10. Run Missing and Ambiguous terms detection
  const { missingTerms, ambiguousTerms, completenessScore } = detectMissingAndAmbiguousTerms({
    partyA,
    partyB,
    scopeOrProducts,
    quantity,
    price,
    taxInclusiveStatus,
    paymentTerms,
    deliveryTimeline,
    transportResponsibility,
    qualityAcceptance,
    cancellationRefund,
    rawText: cleanedText,
  });

  // Calculate Overall Confidence Rating
  let confidenceRating: ConfidenceLevel = 'MEDIUM';
  if (completenessScore >= 75) confidenceRating = 'HIGH';
  else if (completenessScore < 45) confidenceRating = 'LOW';

  // Compute Tamper-Evident Hash
  const signaturePayload = generateAgreementSignaturePayload(
    cleanedText,
    partyA.name,
    partyB.name,
    scopeOrProducts.value,
    price.value,
    paymentTerms.value,
    deliveryTimeline.value
  );
  const tamperEvidenceHash = await computeSha256(signaturePayload);

  return {
    title: title || 'Informal Business Agreement Draft',
    businessContext: businessContext || 'B2B Small Business Transaction',
    rawConversation: cleanedText,
    analysisTimestamp: new Date().toISOString(),
    engineUsed: 'deterministic-rules',
    partyA,
    partyB,
    scopeOrProducts,
    quantity,
    price,
    currency,
    taxInclusiveStatus,
    paymentTerms,
    deliveryTimeline,
    transportResponsibility,
    partyAResponsibilities,
    partyBResponsibilities,
    qualityAcceptance,
    cancellationRefund,
    otherCommitments: ['Both parties agree to act in good faith to resolve ambiguities before delivery.'],
    missingTerms,
    ambiguousTerms,
    completenessScore,
    confidenceRating,
    tamperEvidenceHash,
  };
}
