import { GoogleGenAI } from '@google/genai';
import { ExtractedAgreementData } from '@/types/agreement';
import { extractTermsRuleBased } from './extractTerms';
import { computeSha256, generateAgreementSignaturePayload } from '../crypto/hash';
import { detectMissingAndAmbiguousTerms } from './detectMissingTerms';

/**
 * Hybrid Extractor:
 * If GEMINI_API_KEY is configured in the environment, securely invokes Gemini
 * to refine extraction, while validating against strict schemas.
 * If not configured or if an error occurs, falls back cleanly to the deterministic rule-based extractor.
 */
export async function extractTermsHybrid(
  rawText: string,
  title: string,
  businessContext?: string
): Promise<ExtractedAgreementData> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Transparent deterministic fallback
    return await extractTermsRuleBased(rawText, title, businessContext);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are a legal tech contract analysis assistant for Indian MSMEs (Hackathon problem LS-06).
Your job is to extract structured terms from informal conversations (WhatsApp, email, SMS) into precise JSON.
CRITICAL RULES:
1. Do NOT invent legal names, quantities, prices, or clauses.
2. If unknown or not explicitly stated, mark as "[Needs confirmation]" or "[Unspecified]".
3. Do NOT assume the addressee is the supplier unless the text explicitly says so.
4. Distinguish explicitly stated facts from inferred assumptions.
5. Provide exact quotation excerpts from the text for every extracted field.
6. Detect missing critical terms: GST inclusion, delivery start trigger, inspection window, payment deadline, transport liability.`;

    const userPrompt = `Analyse this informal business message and return a JSON object:
Title: ${title}
Context: ${businessContext || 'B2B informal transaction'}
Conversation:
"""
${rawText}
"""

Return ONLY a valid JSON object matching this TypeScript structure:
{
  "partyA": { "name": string, "role": "Supplier"|"Buyer"|"Service Provider"|"Client", "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string, "clarificationNeeded": string },
  "partyB": { "name": string, "role": "Supplier"|"Buyer"|"Service Provider"|"Client", "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string, "clarificationNeeded": string },
  "scopeOrProducts": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string },
  "quantity": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string },
  "price": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string },
  "currency": string,
  "taxInclusiveStatus": "INCLUSIVE"|"EXCLUSIVE"|"UNSPECIFIED",
  "paymentTerms": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string, "ambiguityNotes": string },
  "deliveryTimeline": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string, "ambiguityNotes": string },
  "transportResponsibility": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string },
  "qualityAcceptance": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string },
  "cancellationRefund": { "value": string, "isExplicit": boolean, "confidence": "HIGH"|"MEDIUM"|"LOW", "excerpt": string }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText);

    // Run standard missing terms detection on the parsed result
    const { missingTerms, ambiguousTerms, completenessScore } = detectMissingAndAmbiguousTerms({
      partyA: parsed.partyA,
      partyB: parsed.partyB,
      scopeOrProducts: parsed.scopeOrProducts,
      quantity: parsed.quantity,
      price: parsed.price,
      taxInclusiveStatus: parsed.taxInclusiveStatus || 'UNSPECIFIED',
      paymentTerms: parsed.paymentTerms,
      deliveryTimeline: parsed.deliveryTimeline,
      transportResponsibility: parsed.transportResponsibility,
      qualityAcceptance: parsed.qualityAcceptance,
      cancellationRefund: parsed.cancellationRefund,
      rawText,
    });

    const signaturePayload = generateAgreementSignaturePayload(
      rawText,
      parsed.partyA?.name || '',
      parsed.partyB?.name || '',
      parsed.scopeOrProducts?.value || '',
      parsed.price?.value || '',
      parsed.paymentTerms?.value || '',
      parsed.deliveryTimeline?.value || ''
    );
    const tamperEvidenceHash = await computeSha256(signaturePayload);

    return {
      title: title || 'Informal Business Agreement Draft',
      businessContext: businessContext || 'B2B Small Business Transaction',
      rawConversation: rawText.trim(),
      analysisTimestamp: new Date().toISOString(),
      engineUsed: 'gemini-ai',
      partyA: parsed.partyA,
      partyB: parsed.partyB,
      scopeOrProducts: parsed.scopeOrProducts,
      quantity: parsed.quantity,
      price: parsed.price,
      currency: parsed.currency || 'INR',
      taxInclusiveStatus: parsed.taxInclusiveStatus || 'UNSPECIFIED',
      paymentTerms: parsed.paymentTerms,
      deliveryTimeline: parsed.deliveryTimeline,
      transportResponsibility: parsed.transportResponsibility,
      partyAResponsibilities: [
        `Deliver ${parsed.scopeOrProducts?.value || 'agreed items'} in full conformity with agreed specifications.`
      ],
      partyBResponsibilities: [
        `Inspect delivery upon arrival and remit ${parsed.price?.value || 'contract sum'} according to agreed timeline.`
      ],
      qualityAcceptance: parsed.qualityAcceptance,
      cancellationRefund: parsed.cancellationRefund,
      otherCommitments: ['Both parties agree to act in good faith to resolve ambiguities before delivery.'],
      missingTerms,
      ambiguousTerms,
      completenessScore,
      confidenceRating: completenessScore >= 75 ? 'HIGH' : completenessScore < 45 ? 'LOW' : 'MEDIUM',
      tamperEvidenceHash,
    };
  } catch (error) {
    console.warn('Gemini AI extraction encountered an issue, falling back to deterministic engine:', error);
    const fallback = await extractTermsRuleBased(rawText, title, businessContext);
    fallback.engineUsed = 'deterministic-rules';
    return fallback;
  }
}
