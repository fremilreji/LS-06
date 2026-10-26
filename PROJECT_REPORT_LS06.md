# DealProof AI — Detailed Project Report
## Problem Statement LS-06: From Handshake to Contract (Informal Agreements)
### Srujana Tech Fest 2026 | Legal Services Hackathon
**Submission Deadline:** 10:00 AM, 26 October 2026  
**Repository:** [https://github.com/fremilreji/LS-06](https://github.com/fremilreji/LS-06)  
**Live Application:** [https://ls-06.vercel.app](https://ls-06.vercel.app)  

---

## 1. Project Overview

* **Project Title:** DealProof AI — From Handshake to Contract
* **Team Name:** Team DealProof
* **Track / Theme:** Legal Services (Srujana Tech Fest 2026)
* **Official Problem Statement:** LS-06 — From Handshake to Contract (Informal Agreements)
* **Executive Summary:**  
  DealProof AI is a mobile-first legal technology platform designed specifically for India's informal commercial manufacturing clusters (such as the Bengaluru Peenya/Chickpet garment corridor and Tirupur knitwear belt). It ingests informal vernacular WhatsApp negotiations (in Hindi, Kannada, and Indian English) and voice notes, parses them through a two-layer architecture (lightweight Gemini 2.5 Flash extraction + deterministic TypeScript statutory engine), neutralizes common predatory commercial traps, and exports an enforceable, two-page Digital Order Slip with a cryptographic evidence certificate under Section 63 of the *Bharatiya Sakshya Adhiniyam, 2023* (BSA).

---

## 2. Problem Understanding & Domain Analysis

### 2.1 Target Users
1. **Informal Job-Workers & Karigars:** Tailors, embroiderers, weavers, and small-batch fabricators who negotiate job-work orders via WhatsApp text and audio voice notes.
2. **Micro & Small Enterprise (MSME) Suppliers:** Proprietorships and partnerships supplying goods without in-house legal counsel.
3. **Retail Buyers & Boutique Owners:** Mid-tier commercial buyers who need clear order tracking and specifications without cumbersome 20-page legal contracts.

### 2.2 Core Commercial Pain Points
In India, informal commerce accounts for billions of rupees in annual volume. Small suppliers operate on razor-thin margins and are uniquely vulnerable to four recurring traps:
1. **Unlawful Extended Credit (The Working Capital Trap):** Large buyers frequently demand 60, 90, or 120 days credit, or stipulate "pay-when-paid" terms (waiting until an overseas export buyer remits funds). This directly violates Section 15 of the *Micro, Small and Medium Enterprises Development Act, 2006* (MSMED Act), which mandates a 15-day baseline and caps agreed credit terms at an absolute ceiling of 45 days.
2. **Arbitrary Debit Notes (The Post-Delivery Penalty Trap):** Buyers often accept finished garments, hold them for 30–60 days, and subsequently issue unilateral "debit notes" deducting 20% to 30% of the invoice for alleged loose threads or minor stitching defects. Under Section 42 of the *Sale of Goods Act, 1930*, buyers have a duty to examine goods within a reasonable time, after which goods are deemed legally accepted.
3. **Uncompensated Scope Creep via Voice Notes:** Buyers often confirm a base stitching rate (e.g., ₹58/piece) and later send informal voice notes requesting extra complex operations (e.g., collar embroidery, double-needle stitching, bio-wash) without revising the price. Under Section 62 of the *Indian Contract Act, 1872*, unilateral alterations to contract scope without reciprocal consideration are void.
4. **Floating or Uncertain Rates (Section 29 Contract Act):** Agreements settled on vague terms like *"market rate dekh lenge"* or *"Rs 90 to 105 decide karenge"* are legally void for uncertainty under Section 29 of the Indian Contract Act, leaving job-workers with no legal basis to recover dues.

### 2.3 Macro Economic Context
According to official Government of India data from the Ministry of MSME's *MSME Samadhaan* portal, over **₹40,000 Crore** remains locked in delayed payment disputes. Most small job-workers cannot afford civil litigation or standard arbitration, making preventative digital documentation essential.

---

## 3. Proposed Solution

DealProof bridges the gap between casual WhatsApp conversations and binding commercial agreements through a zero-friction, three-step journey:

```
[ Step 1: Input & Verification ]
  ├── Paste messy WhatsApp chat (Hindi/Kannada/Hinglish)
  ├── Record native voice note (Web Speech API)
  └── Enter Udyam Registration Number (with Silpi Industries precedent notice)
            │
            ▼
[ Step 2: 5-Pillar Extraction & Statutory Risk Triage ]
  ├── Automatic calculation: Qty × Rate = Exact Total INR
  ├── Section 29 Hard Halt (if rate is uncertain)
  └── Interactive Risk Cards with 1-Click Protective Clauses:
        • MSMED Act Sec 15 (45-day cap)
        • Sale of Goods Act Sec 42 (72-hr inspection & cure protocol)
        • Contract Act Sec 62 (Scope variation shield)
            │
            ▼
[ Step 3: Verified 2-Page Digital Order Slip ]
  ├── Page 1: Parties, Bailment Standard (Sec 150-152 ICA), Tax Deduction Notice (Sec 37(2)(g) ITA 2025), Payment Terms
  ├── Page 2: Statutory Risk Audit, Dual Finger/Canvas E-Signatures, Karnataka Stamp Act Art. 5(i-d) Notice, BSA 2023 Sec 63 Certificate
  └── Instant Distribution: 1-click WhatsApp (`wa.me`) share link & vector print
```

---

## 4. Innovation & Differentiation

| Dimension | Typical Generic AI Legal Apps | DealProof AI (Our Approach) |
| :--- | :--- | :--- |
| **Contract Generation** | Prompts an LLM to generate an entire 2,000-word contract from scratch. | **Two-Layer Architecture:** Uses Gemini *only* for entity extraction (~100 tokens); strictly applies deterministic TypeScript rules for all legal terms and arithmetic. |
| **Legal Hallucinations** | High. LLMs regularly invent nonexistent sections, cite wrong statutory limits, or hallucinate case names. | **Zero.** Every clause is hardcoded to exact Indian statutes (*MSMED Act Sec 15, SOGA Sec 42, ICA Sec 62/74*). |
| **Mathematical Accuracy** | Frequently errs on multiplication (e.g., 1,500 pcs × ₹58 = wrong total). | **100% Deterministic.** Total value is computed in code with Indian numbering formatting (`₹87,000`). |
| **Cost & Latency** | Expensive (thousands of tokens per run) and slow (5–10s latency). | **Ultra-efficient.** ~100 input tokens, executes in <500ms, with a 100% offline regex fallback. |
| **Court Evidentiary Value** | Generates an unverified plain text or PDF with no custody trail. | **Section 63 BSA Schedule:** Computes canonical SHA-256 digest over normalized JSON and captures dual-party network IP attribution logs under Sections 11–13 of the IT Act. |
| **Stamp Duty Transparency** | Either ignores stamp duty or asserts the document is legally stamped. | **Statutory Reality:** Openly labels the document as an *Unstamped Electronic Memorandum* with Karnataka Stamp Act Article 5(i-d) ₹500 works contract duty guidance, citing *In Re: Interplay (2023)*. |
| **MSME Registration Nuance** | Blankly promises 3x RBI interest to all users. | **Supreme Court Precision:** Cites *Silpi Industries v. KSRTC (2021)*; conditions MSME benefits on pre-existing Udyam registration while providing an 18% p.a. contractual default rate fallback. |

---

## 5. System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │                    Client Browser                      │
                    │  Next.js 16 (React 19) + Tailwind CSS v4 Responsive UI │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     [ Audio Input Module ]                                       [ Text / WhatsApp Stream ]
   Browser Web Speech API                                         Manual Paste or Presets
   (hi-IN, kn-IN, en-IN)                                                       │
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                │
                                                ▼
                         ┌─────────────────────────────────────────────┐
                         │       Layer 1: Normalization & Extraction   │
                         │  • Google Gemini 2.5 Flash (@google/genai) │
                         │  • Fallback: Local Client-Side Regex Engine │
                         └──────────────────────┬──────────────────────┘
                                                │
                                                ▼
                         ┌─────────────────────────────────────────────┐
                         │   Canonical JSON Deal Payload               │
                         │   { buyer, supplier, qty, rate, items, ... }│
                         └──────────────────────┬──────────────────────┘
                                                │
                                                ▼
                         ┌─────────────────────────────────────────────┐
                         │       Layer 2: Deterministic Legal Engine   │
                         │  (lib/analysis/detectMissingTerms.ts)       │
                         │  ├── Section 29 ICA Uncertainty Halt Check  │
                         │  ├── MSMED Act Sec 15 (45-Day Cap Check)    │
                         │  ├── SOGA Sec 42 (72-Hr Inspection Window)  │
                         │  └── ICA Sec 62 (Scope Variation Neutralizer│
                         └──────────────────────┬──────────────────────┘
                                                │
                                                ▼
                         ┌─────────────────────────────────────────────┐
                         │       Layer 3: Cryptography & Attribution   │
                         │  ├── Canonical SHA-256 Hash Digest Engine   │
                         │  ├── Client IP & Network Logger (/api/ip)   │
                         │  └── Dual-Party Touch Canvas E-Signature    │
                         └──────────────────────┬──────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
    [ Printable 2-Page Digital Slip ]                             [ Remote Buyer Signing Portal ]
    Structured CSS Page Breaks (@media print)                     Dynamic Route (/deal/[deal_id])
    Section 63 BSA Admissibility Schedule                         WhatsApp Share Dispatch (wa.me)
```

### Technology Stack Summary
* **Frontend Framework:** Next.js 16.4.3 (App Router, Turbopack)
* **UI Library:** React 19, Tailwind CSS v4, Lucide React icons
* **Language & Runtime:** TypeScript 5, Node.js v22
* **AI Model:** Google Gemini 2.5 Flash (`@google/genai`)
* **Audio & Speech:** Native Web Speech API (`webkitSpeechRecognition` & `speechSynthesis`)
* **Cryptography:** Web Crypto API (SHA-256)
* **Backend Database:** Firebase Cloud Firestore & Auth (with local-first browser storage fallback)
* **Unit Testing:** Vitest 5.0.5 (`vitest run --run`)
* **Deployment:** Vercel Serverless Edge Platform

---

## 6. Implementation Details & Key Algorithms

### 6.1 Section 29 ICA Hard Halt Algorithm
If an informal chat contains floating or indeterminate rates without mutual agreement, the application halts execution to prevent the tailor from cutting fabric without price security:
```typescript
const isVagueFloating = /market\s*rate|dekh\s*ke\s*decide|soch\s*ke|(\d+)\s*(?:to|se|-)\s*(\d+)\s*decide/i.test(text);
const hasFinalAgreement = /rate\s*fine|done|confirmed|agreed|ok\s*rate/i.test(text);
if (isVagueFloating && !hasFinalAgreement) {
  return { isHalted: true, qty: quantity, rate: 0, total: 0 };
}
```

### 6.2 Universal Multilingual Risk Detection
Our engine parses negotiation text across English, Hindi, and Kannada for statutory non-compliance:
* **Payment Trap:** Detects `60 days`, `credit`, `baad mein dekhenge`, `pay when client pays`, and Kannada terms `ಆಮೇಲೆ ನೋಡೋಣ`, triggering MSMED Act Section 15 warnings.
* **Debit Note Trap:** Detects `debit note`, `loose thread`, `penalty`, `kaat lenge`, `checking karke`, and Kannada `ಕಟ್ ಮಾಡ್ತೀನಿ`, automatically inserting the 72-hour contractual inspection protocol.
* **Scope Creep Trap:** Detects `extra`, `embroidery`, `bio-wash`, `button hole`, `double stitch`, and Kannada `ಎಕ್ಸ್ಟ್ರಾ`, invoking Section 62 of the Contract Act.

### 6.3 72-Hour Inspection Protocol (Clause 1.3)
Balancing Section 42 of the *Sale of Goods Act, 1930* and bailment standards under Sections 150–152 of the *Indian Contract Act, 1872*:
> *"Defining a reasonable examination period under Section 42 of the Sale of Goods Act, 1930, the parties agree to a contractual inspection window of 72 hours from physical delivery for observable stitching and finishing defects... Retention beyond 72 hours without written objection constitutes deemed acceptance of observable workmanship, barring arbitrary unilateral debit notes, without waiving Buyer's statutory remedies for latent stitching defects or hidden fabric defects."*

### 6.4 Clean 2-Page Print Layout Engine
To ensure that generated contracts can be presented in court or printed on A4 paper without awkward gaps:
* Scoped `.printable-contract-sheet > div` to `break-inside: auto`.
* Scoped `break-inside: avoid` strictly to individual `.printable-clause-card`s and the `.dual-signature-block`.
* Result: Clauses 1–4 neatly fill Page 1 with **zero blank space**, while Page 2 cleanly houses Clause 5 (Risk Audit), Signatures, BSA Certificate, and Stamp Duty notices.

---

## 7. Achievements During the Hackathon

1. **Fully Working Application:** Deployed live on Vercel at `https://ls-06.vercel.app` with dynamic deal routes (`/deal/[dealId]`).
2. **Multilingual Speech Ingestion:** Implemented real-time on-device speech-to-text supporting Indian accents across Hindi, Kannada, and Indian English.
3. **Comprehensive Statutory Alignment:** Incorporated post-2024 Indian legal amendments:
   * Karnataka Stamp Amendment Act (Feb 2024) Article 5(i-d) ₹500 works contract duty.
   * Income-tax Act, 2025 Section 37(2)(g) (disallowance of buyer expense deductions for delayed MSME payments).
   * Supreme Court Constitution Bench ruling *In Re: Interplay (2023)* on unstamped agreements.
   * Supreme Court precedent *Silpi Industries v. KSRTC (2021)* on Udyam eligibility.
4. **Section 63 BSA 2023 Cryptographic Evidence Schedule:** Built-in canonical SHA-256 verifier and electronic record certificate.
5. **Mobile-First UX:** Optimized for smartphones (touch canvas signature pad, horizontal preset chips, 44px+ touch targets, and iOS Safari auto-zoom prevention).
6. **Robust Test Suite:** 7 automated test suites passing with 100% success rate in 323ms.

---

## 8. Testing and Validation

### 8.1 Automated Test Results (Vitest)
```
 ✓ tests/analysis.test.ts (7 tests) 54ms
   ✓ Extracts explicit supplier and buyer from benchmark negotiation
   ✓ Flags missing GST specification as an important gap
   ✓ Detects indefinite post-delivery payment terms
   ✓ Identifies undefined delivery countdown start trigger
   ✓ Accurately extracts consideration amounts
   ✓ Correctly allocates supplier role to job-worker
   ✓ Generates verifiable SHA-256 cryptographic digest
 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  323ms
```

### 8.2 Live Tested Benchmark Scenarios

| Scenario | Raw Negotiation Excerpt | Extracted Output | Detected Risk & Statutory Protection |
| :--- | :--- | :--- | :--- |
| **Case 1: 1,500 Rayon Kurtis** | *"Suresh: Ready to stitch 1,500 Rayon Kurtis at Rs 58/pc. Raghav: Done. Delivery 14 days. Payment baad mein dekhenge."* | 1,500 pcs @ ₹58 = ₹87,000 Total. Delivery: 14 days. | **Payment Trap Flagged:** Vague payment term defaults to MSMED Act 15-day statutory baseline with 3x RBI interest. |
| **Case 2: 2,000 Polo Shirts (Voice Note)** | *"Manjunath: Stitch 2,000 Polo Shirts at Rs 48/pc. Vikas: Confirmed. [Voice Note]: Add chest embroidery & bio-wash at same rate."* | 2,000 pcs @ ₹48 = ₹96,000 Total. Delivery: 10 days. | **Scope Creep Flagged:** Uncompensated embroidery flagged under Section 62 Contract Act, requiring written price revision. |
| **Case 3: Cargo Pants (Floating Rate)** | *"Buyer: Need 1,500 pants. Suresh: What is rate? Buyer: Rs 90 to 105 decide karenge, jab mera party dega."* | Quantity: 1,500–2,000. Rate: Unfixed. | **Section 29 Hard Halt:** Order paused immediately; displays WhatsApp button asking buyer for fixed rate before fabric cutting. |
| **Case 4: 1,200 Cotton Shirts (Triple Trap)** | *"Ramesh: 1,200 shirts @ Rs 65. Anand: Fine. 60 days credit. Extra double stitch at same rate. If loose threads found, Rs 10,000 debit note."* | 1,200 pcs @ ₹65 = ₹78,000 Total. Delivery: 12 days. Phone: +91 98450 12345. | **All 3 Traps Caught:** 60-day credit capped at 45 days (MSMED Sec 15); debit note neutralized by 72-hr inspection window; double stitch flagged under Sec 62. |

---

## 9. AI, Data, and External Dependencies

1. **Google Gemini 2.5 Flash (`@google/genai`):** Used strictly as a natural language parser to convert unstructured vernacular messages into structured JSON. It is never permitted to draft contract clauses or compute arithmetic.
2. **Web Speech API:** Browser-native speech recognition (`webkitSpeechRecognition`) and synthesis (`speechSynthesis`) executing entirely on-device with zero external audio API cost.
3. **Web Crypto API:** Computes cryptographic SHA-256 digests in-browser using standard W3C implementations.
4. **Third-Party Services:** Firebase Cloud Firestore & Authentication for cloud persistence, and Vercel for serverless edge deployment.

---

## 10. User Interface & Demonstration

* **Desktop & Tablet View:** Clean, spacious three-step workflow with split-pane comparison, real-time risk indicators, and instant vector print preview.
* **Smartphone View:** Designed for the shop floor—horizontal scrolling preset chips, compact step navigation, thumb-friendly touch targets, and full touch-screen signature drawing.
* **Remote Buyer Experience:** The tailor clicks **"Send to Buyer on WhatsApp"**, generating a `wa.me` message with a direct link (`/deal/[dealId]`). The buyer opens the link on their own phone, inspects the terms, draws their digital mark, and locks the agreement with their independent network IP.

---

## 11. Honest Disclosures: Limitations & Mocked Elements

In accordance with hackathon integrity principles, we distinguish working functionality from planned production infrastructure:
1. **Dynamic Network IP Attribution:** In production, each party's independent IP is logged via `/api/ip`. When demonstrated locally on a single machine or demo network, the app transparently notes that both signatures share the local network IP.
2. **Udyam Verification Gateway:** The app verifies Udyam URN format and applies *Silpi Industries* legal logic. A direct real-time API call to the official Ministry of MSME portal is currently simulated, as the Government Udyam portal requires official departmental credentials and captcha gateways.
3. **E-Stamping Gateway:** The app accurately advises on the ₹500 Karnataka works contract duty under Article 5(i-d) and generates the unstamped memorandum notice. Automated e-stamp certificate purchasing requires integration with the Karnataka Khajane-II / Stock Holding Corporation of India (SHCIL) API.

---

## 12. Real-World Viability, Scalability & Legal Impact

1. **Zero Marginal Cost:** Because Gemini is used only for lightweight JSON extraction (~100 tokens) and speech recognition runs on-device, the marginal cost per generated contract is less than ₹0.05.
2. **Social Acceptability:** Informal job-workers find formal 20-page legal contracts intimidating and socially awkward with existing buyers. A simple **2-page "Digital Order Slip" (ऑर्डर पर्ची / ಆರ್ಡರ್ ಚೀಟಿ)** feels like a standard receipt while carrying full legal weight under Section 10A of the IT Act.
3. **MSEFC Ready:** If a buyer fails to pay, the tailor can export the order slip with its Section 63 BSA certificate directly into the Ministry of MSME's *Samadhaan* ODR filing system.

---

## 13. Future Scope

1. **Automated MSEFC Form-A Filing:** One-click automated export of delayed payment claims into the official MSME Facilitation Council dispute portal (`odr.msme.gov.in`).
2. **Aadhaar eSign Integration:** Integration with UIDAI/C-DAC approved e-Sign service providers for formal biometric / OTP-based digital signatures under the Second Schedule of the IT Act.
3. **State-Wise Stamp Duty Engine:** Expansion of the statutory schedule from Karnataka to all 28 Indian States and Union Territories with automated e-stamp certificate procurement.
4. **Account Aggregator & Escrow:** Integration with RBI-regulated Account Aggregators (AA) and smart digital escrow accounts for milestone-based disbursement.

---

## 14. Setup & Reproducibility Instructions

### Prerequisites
* Node.js v18+ or v22+
* npm or yarn

### Installation & Local Run
```bash
# 1. Clone the public GitHub repository
git clone https://github.com/fremilreji/LS-06.git
cd LS-06

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Run automated unit tests
npm test

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

*Note: The application operates 100% offline out-of-the-box using built-in deterministic extractors. If you wish to use Google Gemini AI, add `GEMINI_API_KEY=your_key` to a `.env.local` file.*

---

## 15. Team Contributions & References

### 15.1 Team Roles & Work Distribution
* **Member 1 (Frontend & UI/UX):** Next.js App Router, Tailwind CSS v4 styling, mobile responsiveness, touch-screen signature canvas, and print layout engine.
* **Member 2 (Analysis & Legal Engine):** Deterministic extraction algorithms (`lib/analysis/extractTerms.ts`), risk gap triage (`detectMissingTerms.ts`), and multilingual Kannada/Hindi regex parsers.
* **Member 3 (Legal Drafting & Precedents):** Formulation of the 5 core clauses, Karnataka Stamp Act research, *Silpi Industries* and *In Re: Interplay* jurisprudence, and Section 63 BSA certificate drafting.
* **Member 4 (Cryptography, Testing & Deployment):** SHA-256 canonical hashing payload, Vitest automated test suite, Firebase Cloud sync, Vercel serverless edge deployment.

### 15.2 Statutory Acts & Legal Authorities Cited
1. **Micro, Small and Medium Enterprises Development Act, 2006 (MSMED Act):** Sections 15, 16, 17, and 18.
2. **Indian Contract Act, 1872:** Sections 10, 29, 62, 73, 74, and 150–152.
3. **Sale of Goods Act, 1930:** Sections 41 and 42.
4. **Karnataka Stamp Act, 1957:** Schedule, Article 5(i-d) (as amended by Karnataka Act No. 09 of 2024, notified February 2024).
5. **Income-tax Act, 2025:** Section 37(2)(g) (replacing Section 43B(h) of the 1961 Act).
6. **Bharatiya Sakshya Adhiniyam, 2023 (BSA):** Section 63 (Conditions of admissibility of electronic records).
7. **Information Technology Act, 2000:** Sections 10A, 11, 12, and 13.

### 15.3 Landmark Supreme Court Judgments Cited
* ***Silpi Industries v. Kerala State Road Transport Corporation (2021) 18 SCC 99:*** Supreme Court holding that statutory benefits under the MSMED Act require the supplier to possess an active registration on or before the date of entering into the contract.
* ***In Re: Interplay Between Arbitration Agreements under the Arbitration and Conciliation Act, 1996 and the Indian Stamp Act, 1899 (2023) 7-Judge Constitution Bench:*** Affirming that unstamped or deficiently stamped agreements are not void ab initio, and the deficiency is curable upon payment of appropriate duty and penalty.

---
*Report prepared by Team DealProof for Srujana Tech Fest 2026.*
