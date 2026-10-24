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
    id: 'bommanahalli-kurti',
    title: 'Bommanahalli Kurti Stitching Lot (1,500 Pcs)',
    category: 'Garment Job-Work / Micro-Unit',
    businessContext: 'Cutting, stitching & finishing on buyer-supplied Rayon fabric',
    rawConversation: `10:00 AM [Raghav - Apex Fashion Brands]: Namaste Suresh ji, we need 1,500 Rayon Printed Kurtis stitched. Fabric cut panels and main brand labels will be supplied by our warehouse. Thread, buttons, and polybag packing from your end.
10:05 AM [Suresh - Lakshmi Garments (Tailor)]: Namaste Raghav ji. Our rate for cutting-stitching-finishing is ₹70 per piece. Total consideration will be ₹1,05,000.
10:08 AM [Raghav - Apex Fashion Brands]: Rate ₹70 is approved. Delivery needed at our Bommanahalli warehouse on or before November 5.
10:12 AM [Suresh - Lakshmi Garments (Tailor)]: Done sir. Please send fabric by tomorrow. Payment terms please confirm.
10:15 AM [Raghav - Apex Fashion Brands]: Payment baad mein karenge, standard cycle mein ho jayega. Please start sampling.`,
    description: 'Real garment cluster case. Tests 2 sector exploitation traps: unstated payment date ("baad mein") and missing inspection cutoff. Injects Sec 15 MSMED 15-day rule and Sec 41 SOGA 72-hr inspection.',
    highlightedExpectations: [
      'Extracts 1,500 Rayon Kurtis @ ₹70/pc (Total: ₹1,05,000 INR)',
      'Identifies Suresh (Lakshmi Garments) as Job-Worker Bailee and Raghav (Apex) as Buyer Bailor',
      'Flags Trap 1: Missing defect inspection cutoff (protects against delayed Kat debit notes)',
      'Flags Trap 2: Unstated payment date (auto-applies 15-day Appointed Day default under MSMED Sec 15)',
      'Injects 2.5% permissible wastage allowance & latent defect shield under Sec 150-152 ICA',
    ],
  },
  {
    id: 'tiruppur-polo',
    title: 'Tiruppur Polo T-Shirts (Voice-Note Scope Creep)',
    category: 'Knitwear Job-Work / Variation',
    businessContext: '2,000 pcs Polo T-shirts with mid-stream embroidery & bio-wash variation',
    rawConversation: `09:30 AM [Kumar - Tiruppur Knitwear Hub]: Hello brother, we are locking 2,000 Polo T-Shirts stitching at ₹55/piece. Delivery deadline is October 30.
09:35 AM [Murugan - Murugan Apparels (Job-Worker)]: Confirmed Kumar sir. 2,000 pcs @ ₹55/pc = ₹1,10,000. 50% advance on PO, balance within 15 days.
02:15 PM [Kumar - Tiruppur Knitwear Hub] [Voice Note MSG-03]: "Brother, one small change in the Polo order. Brand wants chest logo embroidery plus silicone bio-wash on all pieces, and add 300 extra XXL pieces. Delivery October 30 only, at the same ₹55 rate."
02:45 PM [Murugan - Murugan Apparels (Job-Worker)]: Sir, embroidery and bio-wash require external job work. Rate will be +₹15 extra (₹70/piece total) and delivery requires 2 more days till November 2. Please confirm.
03:10 PM [Kumar - Tiruppur Knitwear Hub]: Done, ₹70/pc approved for full lot, November 2 delivery, 30 days payment.`,
    description: 'Demonstrates mid-stream voice-note scope creep resolved bilaterally under Section 62 & 70 (Quantum Meruit) of the Indian Contract Act, 1872.',
    highlightedExpectations: [
      'Detects mid-stream voice note MSG-03 adding operations (embroidery + bio-wash)',
      'Shields tailor under Section 7 & 62 ICA against unilateral scope creep at old rate',
      'Confirms bilateral rate revision to ₹70/pc and extended deadline to November 2',
      'Applies Sections 53 & 67 delay shield for fabric supply delays',
    ],
  },
  {
    id: 'ambiguous-cargo-pants',
    title: 'Cargo Pants Ambiguity Trap (Sec 29 ICA Hard Halt)',
    category: 'Uncertainty / Void Contract',
    businessContext: 'Vague quantity range, unfixed rate, and arbitrary flat deduction threat',
    rawConversation: `11:00 AM [Buyer - Unverified Sourcing Agent]: Bhai cargo pants banana hai. 1,500 se 2,000 pieces ke beech banwana hai. Rate market rate chalega, ₹90 se ₹105 ke beech finishing dekh ke denge.
11:15 AM [Tailor - Small Stitching Workshop]: Bhai payment kab milega aur delivery kab chahiye?
11:20 AM [Buyer - Unverified Sourcing Agent]: Delivery jaldi chahiye. Payment jab showroom party paisa chhorega tab milega. Agar fitting me zara bhi dikkat aayi toh flat 20% kat-ke milega. Saman bhej rahe hain.`,
    description: 'Intellectual honesty demo: Triggers Hard Halt under Section 29 ICA (agreements void for uncertainty) and blocks signing until definite terms are confirmed.',
    highlightedExpectations: [
      'Halts contract generation under Section 29 Indian Contract Act, 1872',
      'Flags open quantity range ("1,500 se 2,000 pcs") as non-contractual',
      'Flags subjective rate ("market rate / finishing dekh ke") as legally indefinite',
      'Blocks arbitrary 20% penalty clause under Section 74 ICA',
      'Outputs 1-tap WhatsApp clarification checklist in Hinglish',
    ],
  },
];
