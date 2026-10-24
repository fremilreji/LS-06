-- DealProof AI - Srujana Tech Fest 2026 LS-06
-- Supabase PostgreSQL Schema with Row Level Security (RLS)

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Agreements Table
CREATE TABLE IF NOT EXISTS public.agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    business_context TEXT,
    raw_conversation TEXT NOT NULL,
    current_version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'DRAFT_NEEDS_REVIEW' 
      CHECK (status IN ('DRAFT_NEEDS_REVIEW', 'READY_FOR_PARTY_REVIEW', 'PARTY_CONFIRMED')),
    extracted_data JSONB NOT NULL,
    clauses JSONB NOT NULL,
    tamper_evidence_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Agreement Versions History Table
CREATE TABLE IF NOT EXISTS public.agreement_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
    version INT NOT NULL,
    clauses JSONB NOT NULL,
    change_summary TEXT NOT NULL,
    tamper_evidence_hash TEXT NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'User',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agreement_id, version)
);

-- 4. Audit Trail Table
CREATE TABLE IF NOT EXISTS public.agreement_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Row Level Security Policies (Strict privacy: users can only view and edit their own agreements)
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Select own agreements
CREATE POLICY "Users can only read own agreements"
ON public.agreements FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Insert own agreements
CREATE POLICY "Users can insert own agreements"
ON public.agreements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Update own agreements
CREATE POLICY "Users can update own agreements"
ON public.agreements FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Delete own agreements
CREATE POLICY "Users can delete own agreements"
ON public.agreements FOR DELETE
USING (auth.uid() = user_id);

-- Version policies
CREATE POLICY "Users read versions of own agreements"
ON public.agreement_versions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.agreements a WHERE a.id = agreement_id AND a.user_id = auth.uid()));

CREATE POLICY "Users insert versions of own agreements"
ON public.agreement_versions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.agreements a WHERE a.id = agreement_id AND a.user_id = auth.uid()));

-- Indexing for fast lookups
CREATE INDEX IF NOT EXISTS idx_agreements_user ON public.agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_versions_agreement ON public.agreement_versions(agreement_id);
