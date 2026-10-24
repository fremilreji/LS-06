export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  businessContext: string;
  rawConversation: string;
  description: string;
  highlightedExpectations: string[];
}

export const SAMPLE_CONVERSATIONS: SamplePreset[] = [
  {
    id: 'chairs-ravi',
    title: 'Procurement of 100 Office Chairs (Benchmark)',
    category: 'Furniture Supply / Goods',
    businessContext: 'Office setup procurement between vendor and commercial buyer',
    rawConversation: `Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm.`,
    description: 'Official hackathon benchmark prompt. Tests role distinction, missing tax terms, unspecified delivery trigger, and lack of inspection protocol.',
    highlightedExpectations: [
      'Identifies speaker as prospective supplier and Ravi as counterparty (not supplier)',
      'Identifies quantity: 100 office chairs, price: ₹50,000, timeline: within 10 days, payment: after delivery',
      'Flags critical missing terms: Registered entities, GST inclusion, delivery start date, payment due deadline',
      'Flags missing transport responsibility and inspection window',
    ],
  },
  {
    id: 'app-dev-priya',
    title: 'Custom Mobile App Frontend Development (Novation Demo)',
    category: 'Software Services',
    businessContext: 'Freelance development engagement for a local retail mobile application',
    rawConversation: `Dear Priya,
As discussed on the call, our agency can develop the Flutter mobile app for your grocery store for ₹85,000. 
We will need 40% advance to start work, 30% on beta milestone, and the remaining 30% upon final app store submission.
Target completion is within 45 days. 
Please share your business GSTIN and initial approval.`,
    description: 'Service contract scenario with milestone-based payments and technical delivery scope.',
    highlightedExpectations: [
      'Extracts 40/30/30 milestone payment terms and ₹85,000 project fee',
      'Detects 45-day development timeline',
      'Flags missing IP ownership handover clause, scope-creep limits, and third-party API expense liabilities',
    ],
  },
  {
    id: 'cotton-textiles',
    title: 'Wholesale Cotton Fabric Order',
    category: 'Manufacturing / Textiles',
    businessContext: 'B2B supply of raw textile materials between distributor and garment manufacturer',
    rawConversation: `Namaste Sharmaji,
We can supply 500 meters of premium cotton fabric at ₹120 per meter. Total comes to ₹60,000.
We can dispatch the rolls within 5 days from our Surat warehouse. 
Payment via RTGS within 15 days of invoice date. 
Freight extra at actuals. 
Kindly confirm so we can block the inventory for you.`,
    description: 'B2B manufacturing transaction with freight liability, explicit unit pricing, and credit terms.',
    highlightedExpectations: [
      'Extracts unit price (₹120/m) and total price (₹60,000) for 500 meters',
      'Explicitly detects freight is extra at actuals',
      'Highlights missing quality inspection window (fabric defect detection before cutting)',
      'Asks for GST inclusion confirmation',
    ],
  },
  {
    id: 'failure-edge-case',
    title: 'Failure Edge Case: Vague Informal Banter (Section 29 ICA)',
    category: 'Uncertainty / Void Contract',
    businessContext: 'Casual WhatsApp exchange lacking essential terms',
    rawConversation: `09:15 AM [Karan]: Bro send the usual items at last month's cash rate.
09:18 AM [Sunil]: Done bro, will send.`,
    description: 'Intellectual honesty demo: Refuses to hallucinate missing terms. Correctly flags deal as Void for Uncertainty under Section 29 of the Indian Contract Act, 1872.',
    highlightedExpectations: [
      'Refuses to fabricate prices, quantities, or product names',
      'Flags scope and consideration as completely missing',
      'Scores validity at 20% and warns agreement cannot be enforced in an Indian court',
      'Drafts a WhatsApp clarification asking for explicit written terms before dispatch',
    ],
  },
];
