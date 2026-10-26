# DealProof — From Handshake to Contract

A lightweight web app that turns informal WhatsApp business chats and voice notes into binding, legally verified 2-page commercial agreements for Indian MSMEs and job-workers.

Built for **Problem Statement LS-06 (From Handshake to Contract)** at **Srujana Tech Fest 2026**.

- **Live URL:** [https://ls-06.vercel.app](https://ls-06.vercel.app)
- **Repository:** [https://github.com/fremilreji/LS-06](https://github.com/fremilreji/LS-06)

---

## The Problem

In India's garment and manufacturing hubs (like Bangalore's Chickpet or Tirupur), tailors, weavers, and small fabricators conduct nearly all their business through WhatsApp messages and voice notes. They rarely sign formal contracts because lawyers are expensive and formal paperwork feels awkward with regular buyers.

When transactions go wrong, small suppliers get trapped:
1. **Unlawful 60–90 Day Credit:** Big buyers delay payment for months, ignoring the 45-day legal limit under Section 15 of the MSMED Act.
2. **Surprise Debit Notes:** Buyers inspect goods 30 days after delivery, find loose threads, and unilaterally cut 20–30% off the invoice.
3. **Unpaid Extra Work:** Buyers ask for extra embroidery or special washes via voice notes without increasing the agreed rate.
4. **Vague Rates:** Deals agreed on floating phrases ("rate market dekh ke decide karenge") end up legally unenforceable under Section 29 of the Indian Contract Act.

DealProof solves this by reading raw WhatsApp negotiation text and voice notes, identifying legal traps, and generating a clean, printable 2-page agreement with statutory protections already baked in.

---

## How It Works

Instead of asking an LLM to generate legal text from scratch (which leads to hallucinations, wrong math, and slow response times), DealProof uses a split architecture:

```
[ WhatsApp Chat / Voice Note ]
               │
               ▼
   1. Extraction Engine (Gemini 2.5 Flash / Local Regex)
      - Pulls parties, quantity, rate, delivery window, phone number
      - Fast (<500ms) and uses minimal tokens
               │
               ▼
   2. Deterministic Legal Rule Engine (TypeScript)
      - Hardcoded Indian statutory checks
      - Strict math calculation (Qty x Rate = Total)
      - No AI guessing on legal sections
               │
               ▼
[ 2-Page Verified Contract + BSA 2023 Digital Certificate ]
```

### 1. Ingestion & Extraction
- Users paste raw WhatsApp chat threads or record a voice note directly in the browser.
- Browser-native speech recognition (`webkitSpeechRecognition`) transcribes Hindi (`hi-IN`), Kannada (`kn-IN`), and Indian English (`en-IN`) on-device with zero server latency.
- Gemini 2.5 Flash normalizes informal slang into clean JSON (`partyA`, `partyB`, `quantity`, `price`, `deliveryTimeline`, `paymentTerms`).
- If offline or without an API key, local regex extractors run the entire process in the browser.

### 2. Legal Rule Engine (`lib/analysis/detectMissingTerms.ts`)
The extracted data runs through deterministic checks based on Indian commercial law:
- **MSMED Act, 2006 (Section 15):** Flags any payment period exceeding 45 days or conditional "pay-when-paid" clauses, resetting them to the statutory 15-day baseline.
- **MSMED Act, 2006 (Section 16):** Applies compound interest at 3x the RBI Bank Rate if the supplier holds an active Udyam registration, with a contractual 18% per annum default interest rate fallback.
- **Income-tax Act, 2025 (Section 37(2)(g)):** Inserts the mandatory tax deduction warning for corporate buyers.
- **Sale of Goods Act, 1930 (Section 42):** Neutralizes arbitrary debit notes by establishing a 72-hour inspection window with a 7-day right to cure observable defects, while preserving rights on latent fabric defects.
- **Indian Contract Act, 1872 (Section 62):** Flags uncompensated scope changes (e.g. extra embroidery or bio-wash requested at the same rate).
- **Indian Contract Act, 1872 (Section 29):** Pauses deal processing if the rate is vague or unfixed.
- **Karnataka Stamp Act, 1957 (Article 5(i-d)):** Marks the document as an *Unstamped Electronic Memorandum* with notice of the required ₹500 works contract duty (post-February 2024 amendment for contracts up to ₹10L), curable under the Supreme Court precedent *In Re: Interplay (2023)*.
- **Silpi Industries v. KSRTC (2021) Precedent:** Clarifies that statutory MSME benefits apply only if Udyam registration is active at the time of contract/supply, while enforcing contractual rights under the Contract Act.
- **Bharatiya Sakshya Adhiniyam, 2023 (Section 63):** Generates an electronic evidence certificate schedule with a canonical SHA-256 hash and dynamic network IP attribution under Sections 11–13 of the IT Act, 2000.

---

## Tech Stack

- **Frontend & App:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, custom print stylesheets (`@media print`)
- **Speech Engine:** Native Web Speech API (`webkitSpeechRecognition` & `speechSynthesis`)
- **LLM / Parser:** Google Gemini 2.5 Flash (`@google/genai`) with full offline regex fallback
- **Hashing:** Web Crypto API (SHA-256)
- **Database & Sync:** Firebase Cloud Firestore & Auth (with local-first browser storage fallback)
- **Deployment:** Vercel

---

## Quickstart

```bash
# Clone the repository
git clone https://github.com/fremilreji/LS-06.git
cd LS-06

# Install dependencies
npm install --legacy-peer-deps

# Run unit tests
npm test

# Start the dev server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

---

## Test It (Sample Chat)

Paste this sample WhatsApp conversation into the chat box to see extraction and risk detection in action:

```text
Ramesh (Sri Balaji Garments): Namaste Anand ji! Ready to stitch 1,200 Cotton Shirts at Rs 65 per piece. Fabric arrived today.
Anand (Metro Boutique): Rate of Rs 65 is fine Ramesh. Need delivery within 12 days. My number is +91 98450 12345.
Ramesh: Done sir, 12 days delivery confirmed. Total amount is Rs 78,000. What about advance and payment?
Anand: Payment will take 60 days credit after our export buyer pays us.
Anand: Also do extra double stitch and buttonhole for all shirts at the same price.
Anand: And remember, if we find any loose threads later in checking, we will directly deduct Rs 10,000 debit note.
```

**What the app does:**
1. Calculates math: 1,200 pcs @ ₹65 = ₹78,000.
2. Identifies Anand (Buyer) and Ramesh (Supplier) with phone number.
3. Flags 60-day credit as illegal under MSMED Act Section 15.
4. Flags the ₹10,000 debit note and applies the 72-hour inspection limit under Section 42 Sale of Goods Act.
5. Flags the unpaid double-stitch request under Section 62 Contract Act.
6. Generates a clean, 2-page printable contract ready to sign and share via WhatsApp (`wa.me`).

---

## Team & Roles (Redhounds)

Built collaboratively during the 48-hour Srujana Tech Fest 2026 (Problem Statement LS-06). Our team divided the architecture into two focused pods:

* **Chintha Nakshatra & Shivani B (Frontend, UX/UI & Accessibility)**
  * Designed the mobile-first, low-literacy interface tailored for micro-unit job-workers.
  * Built the Next.js React components and Tailwind CSS styling.
  * Engineered the "Traffic-Light" 5-Pillar gap resolution UI.
  * Developed the strict `@media print` formatting for the final A4 Court-Admissible PDF and MSME ODR Portal export.

* **Fremil Reji & K C Vaishnavi (Backend, Cloud Architecture & Legal Engine)**
  * Architected the FastAPI / Next.js API backend and Firebase Firestore database integration.
  * Built the AI-driven deterministic JSON state machine to map informal chats to Indian Statutory Law (MSMED Act, Contract Act).
  * Engineered the Anti-Forgery Dual Signature system with OTP verification and Section 11 IT Act IP/Device fingerprinting.
  * Implemented the SHA-256 cryptographic hashing for the Section 63 BSA 2023 evidence certificate.
