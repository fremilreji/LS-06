# DealProof AI — From Handshake to Contract

> **Srujana Tech Fest 2026 | Legal Services Hackathon**  
> **Problem Statement:** LS-06 — From Handshake to Contract (Informal Agreements)  
> **Event Dates:** 24–26 October 2026 (48-Hour Software Hackathon)  
> **Evaluation Rubric:** Problem Understanding (15), Technical Depth (20), Functional Completeness (15), Domain Analysis (20), Validation & Robustness (10), UX & Accessibility (10), Presentation (10).

---

## 1. Executive Summary & Problem Context

Small and micro-enterprises (MSMEs) in India execute billions of rupees in commerce informally—through WhatsApp chats, direct messages, verbal promises, and phone calls. While informal dealings are fast and friction-free, they routinely lead to disputes when unexpected issues occur:
- Did the price include 18% GST?
- When does the 10-day delivery countdown actually begin?
- Who pays for transport and transit damage?
- Does the buyer have an inspection window before payment is legally due?

When disputes reach judicial or arbitration forums, small business owners have no clean, defensible agreement to present. Traditional legal contracts are perceived as slow, intimidating, and socially awkward with long-standing clients.

**DealProof AI** bridges the gap between the informal handshake and the formal contract:
1. **Zero-Friction Ingestion:** Users paste informal message excerpts without automated scraping or privacy violations.
2. **Strict Term Extraction:** Uses deterministic parsing and hybrid AI to extract parties, quantities, deliverables, pricing, and payment schedules without hallucinating facts.
3. **Missing-Term & Ambiguity Triage:** Detects omitted tax clauses, missing transport terms, and ambiguous delivery windows with 1-click WhatsApp clarification questions.
4. **Bilateral Plain-Language Draft:** Produces an editable 9-clause agreement draft clearly marking all unresolved gaps as `[Needs confirmation]`.
5. **Cryptographic Tamper-Evidence:** Generates immutable SHA-256 digests over the normalized conversation and draft clauses for auditability.
6. **Instant Vector PDF Export:** Downloads print-ready agreements complete with draft status badges and statutory legal disclaimers.

---

## 2. Four-Member Team Division

To facilitate parallel development without branch collisions, the project is structured across four functional roles:

| Team Member | Role | Key Responsibilities & Implemented Modules |
| :--- | :--- | :--- |
| **Member 1** | **Frontend & UI/UX** | LegalTech design system in Tailwind CSS, responsive SaaS homepage (`/`), conversation input form (`/create`), sample benchmark presets (`components/SamplePresets.tsx`), and tabbed results layout. |
| **Member 2** | **Analysis & Ambiguity Engine** | Deterministic extractor (`lib/analysis/extractTerms.ts`), counterparty role distinction, missing-term triage (`lib/analysis/detectMissingTerms.ts`), and WhatsApp clarification question generator. |
| **Member 3** | **Draft Generation & PDF Export** | Plain-language draft generator (`lib/agreement/generateDraft.ts`), in-place clause editor (`components/AgreementEditor.tsx`), and client-side vector PDF generator (`lib/agreement/exportPdf.ts`). |
| **Member 4** | **Storage, Security & Quality** | SHA-256 cryptographic audit trail (`lib/crypto/hash.ts`), version history manager (`lib/storage/draftStore.ts`), Supabase RLS schema (`lib/supabase/schema.sql`), and Vitest test suite (`tests/analysis.test.ts`). |

---

## 3. Technology Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript 5
- **Styling:** Tailwind CSS v4 with dark legal SaaS theme (navy, slate, restrained blue)
- **Validation:** Zod schemas (`ConversationInputSchema`, `PartyInfoSchema`, etc.)
- **AI Integration:** Google Gemini (`@google/genai`) with **100% offline deterministic fallback**
- **PDF Generation:** Client-side vector PDF engine (`jspdf`)
- **Cryptography:** Web Crypto API SHA-256 digest computation
- **Testing:** Vitest test runner (`npm test`)
- **Persistence:** Local-first storage fallback + Supabase PostgreSQL schema with Row Level Security (RLS)

---

## 4. Benchmark Demonstration Walkthrough

You can test the application live using our built-in benchmark presets:

### Official Benchmark Scenario: "Ravi — 100 Office Chairs"
> *"Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm."*

### What DealProof AI Demonstrates:
1. **Role Accuracy:** Correctly recognizes the sender as the prospective supplier and **Ravi** as the prospective buyer. It does *not* assume Ravi is the supplier.
2. **Extracted Facts:** 
   - Quantity: `100 units`
   - Scope: `office chairs`
   - Price: `₹50,000` (INR)
   - Delivery: `Within 10 days`
   - Payment: `Payment due after delivery`
3. **Missing & Ambiguous Gaps Flagged:**
   - **CRITICAL:** Legal entity names of both parties are unstated.
   - **IMPORTANT:** Tax (GST) is unspecified (inclusive vs exclusive).
   - **IMPORTANT:** Delivery countdown start trigger is undefined (does the 10-day clock start on confirmation or advance?).
   - **IMPORTANT:** Indefinite post-delivery window (when exactly is payment overdue?).
   - **IMPORTANT:** Transport & freight responsibility is unallocated.
   - **RECOMMENDED:** Inspection window and defect reporting mechanism are unmentioned.
4. **Clarification Action:** Click **"Copy for WhatsApp"** next to any flagged gap to paste a polite clarification question directly into chat.
5. **Draft Generation:** Generates 9 plain-language clauses with `[Needs confirmation]` tags and exports to PDF with 1 click.

---

## 5. Getting Started (Setup & Run)

### Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `10.x` or later

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/dealproof-ai.git
cd dealproof-ai

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
cp .env.example .env.local
# DealProof AI works 100% offline out-of-the-box! Adding GEMINI_API_KEY activates hybrid AI analysis.
```

### Running Tests

```bash
# Run unit tests
npm test
```

### Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 6. Directory Structure

```
dealproof-ai/
├── app/
│   ├── layout.tsx            # Global layout, dark SaaS styling, metadata
│   ├── page.tsx              # Feature A: Polished SaaS homepage
│   ├── create/page.tsx       # Features B, C, D, E, F: Creation, triage & editor
│   ├── drafts/page.tsx       # Feature G: Saved drafts & version history
│   ├── about/page.tsx        # Problem LS-06 guide, team breakdown & disclosures
│   └── api/
│       └── analyse/route.ts  # Hybrid API endpoint with Zod validation
├── components/
│   ├── Navbar.tsx            # Navigation & Hackathon LS-06 badge
│   ├── Footer.tsx            # Footer & legal notice
│   ├── SamplePresets.tsx     # 1-click test scenarios
│   ├── ExtractedTermsView.tsx# Feature C: Commercial terms & completeness meter
│   ├── MissingTermsAlert.tsx # Feature D: Ambiguity triage & WhatsApp copy buttons
│   ├── AgreementEditor.tsx   # Feature E: In-place clause editor & status switcher
│   └── EvidenceTraceability.tsx # Feature F: Source quote mapping & audit trail
├── lib/
│   ├── analysis/
│   │   ├── extractTerms.ts   # Deterministic Indian commercial rule engine
│   │   ├── extractTermsAI.ts # Hybrid Gemini AI with automatic fallback
│   │   └── detectMissingTerms.ts # Commercial gap & ambiguity detection
│   ├── agreement/
│   │   ├── generateDraft.ts  # 9-clause agreement template
│   │   └── exportPdf.ts      # Feature H: Client-side vector PDF generator
│   ├── crypto/
│   │   └── hash.ts           # SHA-256 tamper-evident digest generator
│   ├── storage/
│   │   └── draftStore.ts     # Local-first persistence & version snapshots
│   ├── supabase/
│   │   ├── client.ts         # Supabase client connector
│   │   └── schema.sql        # Supabase PostgreSQL schema with RLS policies
│   └── data/
│       └── sampleConversations.ts # Fictional benchmark scenarios
├── types/
│   └── agreement.ts          # Shared TypeScript interfaces & Zod schemas
├── tests/
│   └── analysis.test.ts      # Vitest test suite for extraction & PDF
└── README.md
```

---

## 7. Compliance with Srujana Hackathon Rules

1. **Official Problem Selected:** LS-06 — From Handshake to Contract.
2. **Authentic Hackathon Development:** All application modules were built iteratively during the hackathon.
3. **AI Disclosure:** Antigravity and Google Gemini were utilized for AI-assisted development. Code architecture, Zod validation, deterministic rule algorithms, and test suites are documented and explained.
4. **No Guaranteed Legal Advice:** Every page, PDF export, and footer displays the statutory notice:
   > *"This document is an AI-assisted draft for review and discussion. It is not a guarantee of legal validity or a substitute for advice from a qualified legal professional."*
5. **Privacy by Design:** Manual text paste prevents unauthorized background scraping; fictional data presets are used for demonstrations.
6. **Tamper Evidence:** We provide verifiable SHA-256 cryptographic hashes without making unsubstantiated claims about blockchain immutability.

---

## 8. Known Limitations & Roadmap

- **Jurisdiction & Stamp Duty:** Operational drafts clarify commercial understanding; formal legal enforceability in court still requires state stamp duty payment.
- **Multilingual Messaging:** Currently optimized for English informal business communication and Indian MSME terminology; regional Indian languages (Hindi, Kannada, Tamil) are planned.
- **Bi-directional Sign-off:** Current prototype records user confirmation; future versions will support SMS/WhatsApp OTP counterparty verification.

---

**Built with pride by Team DealProof AI for Srujana Tech Fest 2026.**
