"""
backend/schemas.py
==================
Strict Pydantic v2 schemas for Hackathon Problem Statement LS-06
("Jan-Karar / PactProof: From Handshake to Contract").

Sector Lock: Independent Garment & Tailoring Job-Work Micro-Units
(5–30 machines in clusters like Bommanahalli, Peenya, Tiruppur, Surat).
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    msg_id: str = Field(..., description="Message identifier, e.g. MSG-01")
    sender: str = Field(..., description="Sender display name, phone, or handle")
    timestamp: str = Field(..., description="Time of message, e.g. 10:02 AM")
    content: str = Field(..., description="Message text or audio transcript")
    source_type: str = Field(..., description="'text' or 'voice_note' or 'audio_transcript'")


class GapItem(BaseModel):
    gap_id: str = Field(..., description="Unique gap identifier, e.g. GAP-01")
    pillar_key: str = Field(..., description="'parties' | 'scope' | 'price_and_tax' | 'delivery_timeline' | 'payment_terms'")
    title: str = Field(..., description="Short title, maximum 5 words")
    where_msg_id: str = Field(..., description="Message ID where gap was identified, e.g. MSG-02")
    where_quote: str = Field(..., description="Exact quote from chat/audio demonstrating the issue")
    risk_summary: str = Field(..., description="One plain-language sentence explaining how the tailor loses money")
    statutory_fix_label: str = Field(..., description="Button action label, e.g. 'Apply Sec 15 MSMED 15-Day Rule'")
    statutory_fix_value: str = Field(..., description="Exact plain-language protective term inserted when clicked")
    whatsapp_clarify_text: str = Field(..., description="Polite Hinglish/regional message to ask buyer on WhatsApp")


class ExtractedClause(BaseModel):
    field_name: str = Field(..., description="Field key (parties, scope, price_and_tax, delivery_timeline, payment_terms)")
    value: str = Field(..., description="Extracted clause value or status")
    status: str = Field(..., description="'clear', 'ambiguous', or 'missing'")
    source_msg_ids: List[str] = Field(default_factory=list, description="IDs of messages substantiating clause")
    confidence_note: str = Field(..., description="Reasoning and statutory basis")
    statutory_basis: Optional[str] = Field(None, description="Relevant statutory section or case law citation")


class UdyamVerificationResult(BaseModel):
    udyam_urn: Optional[str] = Field(None, description="Udyam Registration Number, format UDYAM-XX-00-0000000")
    is_valid_format: bool = Field(False, description="True if regex matches standard Indian Udyam format")
    registered_prior_to_contract: bool = Field(False, description="True if registered before contract date per Silpi Industries")
    msme_odr_eligible: bool = Field(False, description="True if eligible for Section 18 MSMED ODR / Facilitation Council")
    enterprise_type: str = Field("UNVERIFIED", description="'MICRO', 'SMALL', or 'UNVERIFIED'")
    advisory_message: str = Field(..., description="Advisory on Section 18 standing and NBCC (2025) precedent")
    registration_portal_url: str = Field("https://udyamregistration.gov.in", description="Official free government portal")


class GarmentJobWorkTerms(BaseModel):
    job_work_type: str = Field("cutting_stitching_finishing", description="Garment operations (cutting, stitching, embroidery, finishing)")
    buyer_supplied_materials: str = Field("Fabrics, main labels, trims specified in chat", description="Materials bailed by buyer")
    tailor_supplied_trims: str = Field("Matching sewing thread, basic polybags, basic fusing", description="Consumables provided by tailor")
    permissible_wastage_pct: float = Field(2.5, description="Standard permissible cutting/sampling wastage allowance percentage")
    latent_defect_shield_active: bool = Field(True, description="True under Sec 150-152 ICA: tailor not liable for fabric bleeding/shrinkage")
    bailee_particular_lien_active: bool = Field(True, description="True under Sec 170 ICA: right to retain goods until labour charges paid")
    sample_approval_ref: Optional[str] = Field(None, description="Approved master sample photo reference or hash")
    visual_inspection_window_hours: int = Field(72, description="Visual inspection window in hours under Sec 41-42 Sale of Goods Act")
    deemed_acceptance_days: int = Field(15, description="Outer objection limit under Sec 2(b) Expl. (ii) of MSMED Act, 2006")


class PaymentAndTaxTerms(BaseModel):
    agreed_price_inr: Optional[float] = Field(None, description="Total agreed deal value in INR")
    rate_per_piece_inr: Optional[float] = Field(None, description="Stitching rate per piece in INR")
    quantity_pcs: Optional[int] = Field(None, description="Total number of pieces ordered")
    quantity: Optional[int] = Field(None, description="Extracted quantity of pieces (e.g. 2500)")
    rate_per_piece: Optional[float] = Field(None, description="Extracted labour rate per piece in INR (e.g. 103)")
    total_value: Optional[float] = Field(None, description="Calculated total consideration = quantity * rate_per_piece")
    total_value_formatted: Optional[str] = Field(None, description="Formatted total value in Indian numbering format (e.g. '2,57,500')")
    clause_2_1_text: Optional[str] = Field(None, description="Rendered text of Clause 2.1")
    currency: str = Field("INR", description="Currency ISO code")
    tax_status: str = Field("EXCLUSIVE_GST", description="'EXCLUSIVE_GST', 'INCLUSIVE_GST', or 'UNSPECIFIED'")
    payment_due_days: int = Field(15, description="Days from delivery before payment is overdue (capped at 45 under MSMED Sec 15)")
    statutory_due_date_rule: str = Field("15 days (Appointed Day default) or agreed date capped at 45 days per Sec 15 MSMED Act")
    is_pay_when_paid_prohibited: bool = Field(True, description="True: 'pay when exporter pays' is statutorily void under Sec 15 & 24 MSMED Act")
    rbi_bank_rate_pct: float = Field(5.75, description="Notified RBI Bank Rate (configurable, e.g. 5.75% or 6.75%)")
    msme_interest_rate_pct: float = Field(17.25, description="Overdue interest rate at 3x RBI bank rate under Sec 16 MSMED Act")
    monthly_compound_formula: str = Field("Compound interest with monthly rests at 3x RBI Bank Rate from the Appointed Day")
    section_43b_h_warning: str = Field(..., description="Income Tax Act Sec 43B(h) / Sec 37(2)(g) 2025 expense disallowance warning for buyer")


class NovationVariationItem(BaseModel):
    is_variation_detected: bool = Field(False, description="True if voice note or later message added operations/preponed delivery")
    variation_msg_id: Optional[str] = Field(None, description="Message ID where variation was proposed")
    unilateral_claim: Optional[str] = Field(None, description="Variation terms proposed (e.g. extra embroidery at same rate)")
    tailor_conditional_response: Optional[str] = Field(None, description="Tailor reply, e.g. conditional 'ok sir try panren' or rate counter")
    status: str = Field("NONE", description="'NONE', 'UNACCEPTED_VARIATION', or 'BILATERALLY_CONFIRMED'")
    legal_doctrine: str = Field("Sections 7 & 62 ICA (Novation requires unqualified assent); Quantum Meruit Sec 70; delay shielded under Sec 53 & 67")
    protective_clause: str = Field(..., description="Contract term preventing unilateral scope creep or penalty under Sec 74")


class StampDutyAnalysis(BaseModel):
    contract_nature: str = Field("Pure Job-Work Bailment (Service Memorandum)", description="Legal classification")
    duty_amount_inr: int = Field(0, description="Stamp duty in INR for informal formation under Sec 10A IT Act (₹0 upfront)")
    statute_article: str = Field("Indian Stamp Act, 1899 / State Stamp Acts Art 5", description="Statutory reference")
    interplay_2023_curable_advisory: str = Field(..., description="Supreme Court 7-Judge bench in In Re: Interplay (2023) procedural ruling")


class MSMEODRPortalPacket(BaseModel):
    portal_name: str = Field("MSME ODR Portal (odr.msme.gov.in) / MSEFC Facilitation Council", description="Designated forum")
    governing_section: str = Field("Section 18 MSMED Act, 2006", description="Statutory authority")
    claimant_role: str = Field("Independent Micro Garment Job-Worker", description="Statutory applicant role")
    respondent_role: str = Field("Principal Buyer / Manufacturer / Exporter", description="Statutory buyer role")
    msmed_2026_amendment_secs_8_10_notified: bool = Field(False, description="Flag for previewing 2026 90-day ODR & land-revenue recovery rules")
    buyer_75_percent_predeposit_warning: str = Field(
        "Under Section 19 MSMED Act, buyer must pre-deposit 75% of awarded amount with the court before challenging MSEFC order.",
        description="Buyer challenge deterrence shield"
    )
    form_msefc_annexure_summary: str = Field(..., description="Summary of evidence packet formatted for direct upload to odr.msme.gov.in")


class SignatureAuditRecord(BaseModel):
    role: str = Field(..., description="'supplier' or 'buyer'")
    signer_name: str = Field(..., description="Legal name of signatory")
    signer_phone: str = Field(..., description="Mobile number of signatory")
    signature_type: str = Field(..., description="'finger_draw' or 'illiterate_mark_sec_3_56'")
    otp_verified: bool = Field(..., description="True if OTP was verified on ingestion")
    authorized_agent_declared: bool = Field(..., description="True if confirmed authorized signatory/agent")
    client_ip: str = Field(..., description="IP address logged on execution")
    user_agent: str = Field(..., description="Browser/device user-agent string")
    timestamp_ist: str = Field(..., description="Indian Standard Time of execution")
    signature_digest: str = Field(..., description="SHA-256 digest of signature graphic payload")


class BSASection63Certificate(BaseModel):
    certificate_id: str = Field(..., description="Unique certificate identifier, e.g. BSA-63-LOT-2026")
    generated_at_ist: str = Field(..., description="Timestamp in Indian Standard Time (IST, 24-hour format)")
    master_merkle_root_sha256: str = Field(..., description="Root SHA-256 hash sealing chat, audio, sample, and contract")
    part_a_device_declaration: Dict[str, str] = Field(..., description="Part A custodian declaration per Section 63(4)(c) BSA 2023 Schedule")
    part_b_hash_verification: Dict[str, str] = Field(..., description="Part B technical forensic report per Section 63(4)(c) BSA 2023 Schedule")


class TTSVernacularScripts(BaseModel):
    en: str = Field(..., description="English audio script under 40 words for browser TTS")
    hi: str = Field(..., description="Hindi audio script under 40 words for browser TTS")
    kn: str = Field(..., description="Kannada audio script under 40 words for browser TTS")


class DealAnalysisResponse(BaseModel):
    deal_id: str
    contract_status: str = Field(..., description="'READY_FOR_SIGNATURE', 'HALTED_AMBIGUOUS_SEC_29', or 'SIGNED_AND_SEALED'")
    contract_title: str
    supplier_name: str
    buyer_name: str
    raw_chat: str = Field(..., description="Normalized raw chat transcript sealed in cryptographic digest")
    udyam_verification: UdyamVerificationResult
    parsed_messages: List[ChatMessage]
    clauses: Dict[str, ExtractedClause]
    gaps: List[GapItem]
    job_work_terms: GarmentJobWorkTerms
    payment_terms: PaymentAndTaxTerms
    scope_variation: NovationVariationItem
    stamp_duty: StampDutyAnalysis
    msme_odr_packet: MSMEODRPortalPacket
    signatures: Dict[str, SignatureAuditRecord]
    cryptographic_seal: Dict[str, str]
    bsa_certificate: BSASection63Certificate
    tts_scripts: TTSVernacularScripts
    plain_agreement_text: str
    whatsapp_nudge_text: str
    sec_29_halt_reasons: List[str] = Field(default_factory=list)


# --- API Request Payloads ---

class AnalyzeDealRequest(BaseModel):
    deal_id: Optional[str] = None
    raw_chat: str = Field(..., description="Raw WhatsApp export or conversation text")
    supplier_name: Optional[str] = None
    buyer_name: Optional[str] = None
    udyam_urn: Optional[str] = None
    sample_image_base64: Optional[str] = None
    audio_bytes_base64: Optional[str] = None
    rbi_bank_rate: Optional[float] = 5.75
    state: Optional[str] = "Karnataka"


class ResolveGapRequest(BaseModel):
    deal_id: str
    gap_id: str
    chosen_fix_value: str
    custom_value: Optional[str] = None
    counterparty_confirmed: bool = True


class VerifyUdyamRequest(BaseModel):
    udyam_urn: str
    contract_date_ist: Optional[str] = None


class SignContractRequest(BaseModel):
    deal_id: str
    role: str = Field(..., description="'supplier' or 'buyer'")
    signer_name: str
    signer_phone: str
    otp_code: str
    authorized_agent_declared: bool
    signature_type: str = Field(..., description="'finger_draw' or 'illiterate_mark_sec_3_56'")
    signature_data_url: str
    client_ip: Optional[str] = "127.0.0.1"
    user_agent: Optional[str] = "Web-Client"


class LogMilestoneRequest(BaseModel):
    deal_id: str
    milestone_type: str = Field(..., description="'FABRIC_RECEIVED', 'CUTTING_COMPLETE', 'STITCHING_COMPLETE', 'DISPATCHED', 'DELIVERY_ACCEPTED'")
    notes: str
    photo_hash: Optional[str] = None


class VerifyTamperRequest(BaseModel):
    deal_id: str
    submitted_chat_text: str
    submitted_agreement_text: str
    submitted_sample_image_hash: Optional[str] = None


class VerifyTamperResponse(BaseModel):
    is_authentic: bool
    stored_merkle_root: str
    computed_merkle_root: str
    chat_hash_matches: bool
    agreement_hash_matches: bool
    sample_image_matches: bool
    tamper_details: List[str]
    verdict_message: str
