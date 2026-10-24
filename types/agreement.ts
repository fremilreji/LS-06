import { z } from 'zod';

// Criticality of missing or ambiguous terms
export type IssueCriticality = 'CRITICAL' | 'IMPORTANT' | 'RECOMMENDED';

// Confidence levels
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

// Review and confirmation status
export type DraftStatus = 'DRAFT_NEEDS_REVIEW' | 'READY_FOR_PARTY_REVIEW' | 'PARTY_CONFIRMED';

export interface PartyInfo {
  name: string;
  role: 'Supplier' | 'Buyer' | 'Service Provider' | 'Client' | 'Contractor' | 'Unknown';
  contactOrHandle?: string;
  isExplicit: boolean;
  confidence: ConfidenceLevel;
  excerpt?: string;
  clarificationNeeded?: string;
}

export interface ExtractedTermItem {
  value: string;
  isExplicit: boolean;
  confidence: ConfidenceLevel;
  excerpt?: string;
  ambiguityNotes?: string;
}

export interface MissingTermIssue {
  id: string;
  category: 'PARTIES' | 'PRICING_TAX' | 'PAYMENT' | 'DELIVERY' | 'SCOPE' | 'QUALITY_INSPECTION' | 'CANCELLATION' | 'DISPUTE';
  issue: string;
  whyItMatters: string;
  suggestedQuestion: string;
  criticality: IssueCriticality;
}

export interface AmbiguousTermIssue {
  id: string;
  term: string;
  conflictingStatements: string[];
  explanation: string;
  suggestedResolution: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface DraftClause {
  id: string;
  clauseNumber: number;
  title: string;
  body: string;
  needsConfirmation: boolean;
  supportingExcerpt?: string;
  userEdited?: boolean;
}

export interface ExtractedAgreementData {
  title: string;
  businessContext?: string;
  rawConversation: string;
  analysisTimestamp: string;
  engineUsed: 'gemini-ai' | 'deterministic-rules' | 'hybrid';

  // Parties
  partyA: PartyInfo;
  partyB: PartyInfo;

  // Commercial Terms
  scopeOrProducts: ExtractedTermItem;
  quantity: ExtractedTermItem;
  price: ExtractedTermItem;
  currency: string;
  taxInclusiveStatus: 'INCLUSIVE' | 'EXCLUSIVE' | 'UNSPECIFIED';
  paymentTerms: ExtractedTermItem;
  deliveryTimeline: ExtractedTermItem;
  transportResponsibility: ExtractedTermItem;

  // Obligations
  partyAResponsibilities: string[];
  partyBResponsibilities: string[];

  // Conditions & Clauses
  qualityAcceptance: ExtractedTermItem;
  cancellationRefund: ExtractedTermItem;
  otherCommitments: string[];

  // Missing & Ambiguous analysis
  missingTerms: MissingTermIssue[];
  ambiguousTerms: AmbiguousTermIssue[];

  // Confidence & completeness
  completenessScore: number; // 0 - 100
  confidenceRating: ConfidenceLevel;

  // Traceability & Integrity
  tamperEvidenceHash: string; // SHA-256 of raw conversation + normalized extracted terms
}

export interface AgreementDraft {
  id: string;
  version: number;
  title: string;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  extractedData: ExtractedAgreementData;
  clauses: DraftClause[];
  tamperEvidenceHash: string;
  auditTrail: AuditLogEntry[];
  reviewerNotes?: string;
  bothPartiesConfirmed?: boolean;
}

// Zod validation schemas
export const PartyInfoSchema = z.object({
  name: z.string().min(1, 'Party name cannot be empty'),
  role: z.enum(['Supplier', 'Buyer', 'Service Provider', 'Client', 'Contractor', 'Unknown']),
  contactOrHandle: z.string().optional(),
  isExplicit: z.boolean(),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  excerpt: z.string().optional(),
  clarificationNeeded: z.string().optional(),
});

export const ExtractedTermItemSchema = z.object({
  value: z.string(),
  isExplicit: z.boolean(),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  excerpt: z.string().optional(),
  ambiguityNotes: z.string().optional(),
});

export const MissingTermIssueSchema = z.object({
  id: z.string(),
  category: z.enum(['PARTIES', 'PRICING_TAX', 'PAYMENT', 'DELIVERY', 'SCOPE', 'QUALITY_INSPECTION', 'CANCELLATION', 'DISPUTE']),
  issue: z.string(),
  whyItMatters: z.string(),
  suggestedQuestion: z.string(),
  criticality: z.enum(['CRITICAL', 'IMPORTANT', 'RECOMMENDED']),
});

export const ConversationInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  businessContext: z.string().max(200, 'Context is too long').optional(),
  rawConversation: z
    .string()
    .min(15, 'Conversation text is too short. Please provide at least a sentence or two.')
    .max(15000, 'Conversation text exceeds 15,000 character limit for safety.'),
  consentAcknowledged: z.boolean().refine(val => val === true, {
    message: 'You must confirm you have authorization to submit this conversation excerpt.',
  }),
});
