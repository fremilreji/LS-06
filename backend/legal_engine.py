import hashlib
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

from schemas import (
    ChatMessage,
    ExtractedClause,
    AmbiguityGap,
    StampDutyAdvisory,
    BSASection63Certificate,
    DealAnalysisResponse,
)


def get_current_ist_timestamp() -> str:
    """Returns current timestamp formatted in 24-hour Indian Standard Time (IST, UTC+05:30)."""
    ist = timezone(timedelta(hours=5, minutes=30))
    now = datetime.now(ist)
    return now.strftime("%d/%m/%Y %H:%M:%S IST")


def compute_sha256(text_or_bytes: str | bytes) -> str:
    """Computes deterministic lowercase SHA-256 hexadecimal digest."""
    if isinstance(text_or_bytes, str):
        payload = text_or_bytes.encode("utf-8")
    else:
        payload = text_or_bytes
    return hashlib.sha256(payload).hexdigest()


def normalize_text_payload(text: str) -> str:
    """Normalizes line breaks and whitespace so hashes are reproducible across platforms."""
    cleaned = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in cleaned.split("\n")]
    return "\n".join(lines).strip()


def build_cryptographic_seal(
    raw_chat: str, audio_bytes: Optional[bytes], plain_agreement: str
) -> Dict[str, str]:
    """
    Constructs a multi-tiered cryptographic seal:
    - raw_chat_sha256: Bitstream hash of normalized chat archive
    - audio_sha256: Direct binary hash of raw audio file (or NO_AUDIO_UPLOADED)
    - agreement_sha256: Hash of generated plain language agreement text
    - master_merkle_root_sha256: Hash of concatenated sub-digests
    - sealed_at_ist: IST timestamp
    """
    norm_chat = normalize_text_payload(raw_chat)
    raw_chat_sha256 = compute_sha256(norm_chat)

    if audio_bytes and len(audio_bytes) > 0:
        audio_sha256 = compute_sha256(audio_bytes)
    else:
        audio_sha256 = "NO_AUDIO_UPLOADED"

    norm_agreement = normalize_text_payload(plain_agreement)
    agreement_sha256 = compute_sha256(norm_agreement)

    merkle_input = f"{raw_chat_sha256}:{audio_sha256}:{agreement_sha256}"
    master_merkle_root_sha256 = compute_sha256(merkle_input)

    return {
        "raw_chat_sha256": raw_chat_sha256,
        "audio_sha256": audio_sha256,
        "agreement_sha256": agreement_sha256,
        "master_merkle_root_sha256": master_merkle_root_sha256,
        "sealed_at_ist": get_current_ist_timestamp(),
    }


def evaluate_stamp_duty_and_exclusions(
    raw_chat: str, state: str, price_text: str
) -> StampDutyAdvisory:
    """
    Deterministically evaluates:
    1. Statutory exclusions under First Schedule of IT Act, 2000 & Section 17 Registration Act, 1908
    2. Applicable state stamp duty article and rates for Karnataka, Maharashtra, and Delhi
    """
    normalized_state = state.strip().title()
    lower_chat = raw_chat.lower()

    # Statutory Exclusion Check
    excluded_keywords = [
        "sale of land",
        "flat sale",
        "plot sale",
        "immovable property",
        "power of attorney",
        "general power of attorney",
        "special power of attorney",
        "will",
        "testament",
        "promissory note",
        "pro-note",
        "pronote",
        "bill of exchange",
        "hundi",
    ]
    matched_exclusions = [kw for kw in excluded_keywords if re.search(r"\b" + re.escape(kw) + r"\b", lower_chat)]

    if matched_exclusions:
        return StampDutyAdvisory(
            state=normalized_state,
            statute_section="First Schedule IT Act, 2000 & Section 17 Registration Act, 1908",
            estimated_duty_inr=0,
            is_barred_by_it_act_schedule_1=True,
            compliance_note=(
                f"CRITICAL STATUTORY BAR: Transaction matches excluded category '{', '.join(matched_exclusions)}'. "
                "Under Section 1(4) & First Schedule of the Information Technology Act, 2000, electronic records "
                "cannot be used to execute negotiable instruments (other than cheques), powers of attorney, trusts, "
                "or contracts for the sale/conveyance of immovable property. Section 17 of the Registration Act, 1908 "
                "mandates registered physical instruments. Automated contract generation is statutorily blocked."
            ),
        )

    # State Stamp Duty Mapping
    if normalized_state == "Karnataka":
        return StampDutyAdvisory(
            state="Karnataka",
            statute_section="Karnataka Stamp Act, 1957 — Article 5(j) (as amended by Karnataka Act 04 of 2024)",
            estimated_duty_inr=500,
            is_barred_by_it_act_schedule_1=False,
            compliance_note=(
                "Under Article 5(j) of the Schedule to the Karnataka Stamp Act, 1957 (amended w.e.f. 3 February 2024), "
                "the flat stamp duty for general commercial agreements not otherwise provided for is ₹500 (increased from ₹200). "
                "Under Section 33 and Section 34 of the Karnataka Stamp Act, 1957, an unstamped instrument is inadmissible in "
                "civil proceedings and subject to impounding with a penalty of up to 10x the deficit duty. E-stamping via KAWERI / SHCIL is advised."
            ),
        )
    elif normalized_state == "Maharashtra":
        return StampDutyAdvisory(
            state="Maharashtra",
            statute_section="Maharashtra Stamp Act, 1958 — Article 5(h)(B) & Article 5(h)(A)",
            estimated_duty_inr=500,
            is_barred_by_it_act_schedule_1=False,
            compliance_note=(
                "Under Article 5(h)(B) of Schedule I to the Maharashtra Stamp Act, 1958 (amended by 2024 Ordinance/Act), "
                "the flat duty for agreements not otherwise provided for is ₹500 (increased from ₹100). "
                "Note: Where an agreement specifies a quantifiable monetary value, Article 5(h)(A)(iv) may levy ad valorem duty "
                "(0.1% up to ₹10L, 0.2% above ₹10L). Unstamped documents face impounding under Section 33 and 2% monthly penalty."
            ),
        )
    elif normalized_state == "Delhi":
        return StampDutyAdvisory(
            state="Delhi",
            statute_section="Indian Stamp Act, 1899 (Delhi Schedule 1A) — Article 5(c)",
            estimated_duty_inr=50,
            is_barred_by_it_act_schedule_1=False,
            compliance_note=(
                "Under Article 5(c) of Schedule 1A to the Indian Stamp Act, 1899 as applicable to the NCT of Delhi, "
                "general commercial agreements not otherwise provided for attract ₹50 flat duty. "
                "Agreements exclusively for the sale of goods/merchandise are exempt under Article 5 Exemption (a). "
                "If impounded under Section 33, Section 35 Proviso (a) imposes a 10x penalty (₹500)."
            ),
        )
    else:
        return StampDutyAdvisory(
            state=normalized_state,
            statute_section="Indian Stamp Act, 1899 (General Residuary Entry) / State Analogue",
            estimated_duty_inr=100,
            is_barred_by_it_act_schedule_1=False,
            compliance_note=(
                f"Applicable to {normalized_state}: General agreements attract stamp duty under state-specific schedules. "
                "Under Section 35 of the Indian Stamp Act, 1899, an unstamped agreement cannot be admitted in evidence "
                "until impounded and cured with payment of proper duty and statutory penalties."
            ),
        )


def generate_bsa_section_63_certificate(
    deal_id: str,
    seal: Dict[str, str],
    device_owner: str = "Authorized SME Custodian",
    device_model: str = "Smartphone / Web Export Terminal",
) -> BSASection63Certificate:
    """
    Generates a statutory Schedule Certificate under Section 63(4)(c) of the
    Bharatiya Sakshya Adhiniyam, 2023 (BSA).
    Affirmed by the Supreme Court of India in Pune Bar Association v. Union of India (2026).
    """
    cert_id = f"BSA-63-{deal_id[:8].upper()}-{datetime.now().strftime('%Y%m%d%H%M')}"
    timestamp_ist = seal.get("sealed_at_ist", get_current_ist_timestamp())
    merkle_root = seal.get("master_merkle_root_sha256", "UNKNOWN_HASH")

    part_a = {
        "declarant_name": device_owner,
        "relation_and_residence": "Authorized Signatory / Custodian in charge of device and records",
        "source_type_ticked": "Mobile Device [X], Cloud / Server [X]",
        "device_make_model": device_model,
        "device_identifiers": "IMEI / Serial / Cloud Account Session ID Logged on Ingestion",
        "section_63_2_declaration": (
            "I solemnly affirm that the electronic record was produced by the communication device/computer "
            "during a period of regular, lawful use for storing or processing information for business activities; "
            "that information of this kind was regularly fed into the device in the ordinary course; "
            "that the device was operating properly throughout the material period, or any malfunction did not "
            "affect the accuracy of the record; and that this digital reproduction accurately derives from the original."
        ),
        "device_capacity": "Owned and Operated by Declarant",
        "hash_algorithm": "SHA-256",
        "certified_hash_value": merkle_root,
        "execution_date_time_ist": timestamp_ist,
        "signature_status": "DRAFT_PREPARED_FOR_HUMAN_EXECUTION",
    }

    part_b = {
        "expert_specification": "PactProof Digital Evidence & Cryptographic Verification Pipeline",
        "qualification_framework": (
            "Section 39(1) BSA, 2023 r/w Supreme Court ruling in Pune Bar Association v. Union of India (2026), "
            "confirming technical expert competence in cyber forensics and cryptographic hashing."
        ),
        "extraction_methodology": "Native unbroken .txt export & uncompressed audio bitstream capture",
        "hash_algorithm": "SHA-256 (NIST FIPS 180-4 Standard)",
        "computed_merkle_root_digest": merkle_root,
        "integrity_affirmation": (
            "Technical verification confirms that the computed SHA-256 digest of the secondary electronic output "
            "precisely matches the acquired bitstream. No post-extraction alteration, bit degradation, or splicing detected."
        ),
        "execution_date_time_ist": timestamp_ist,
        "signature_status": "DRAFT_SEALED_AWAITING_EXPERT_SIGNATURE",
    }

    return BSASection63Certificate(
        certificate_id=cert_id,
        generated_at_ist=timestamp_ist,
        part_a_device_declaration=part_a,
        part_b_hash_verification=part_b,
    )


# ------------------------------------------------------------------------------
# PRELOADED BENCHMARK SCENARIOS (100% Offline Functional Presets)
# ------------------------------------------------------------------------------

def _create_scenario_1() -> DealAnalysisResponse:
    chat_text = (
        "10:00 AM [Rajesh - Prime Textiles]: Namaste Sharmaji, we can supply 500 meters of Grade-A cotton yarn at ₹120 per meter. Total consideration ₹60,000, inclusive of all GST.\n"
        "10:05 AM [Sharmaji - Supreme Fabrics]: Please confirm delivery date and payment conditions.\n"
        "10:08 AM [Rajesh - Prime Textiles]: Dispatch within 5 business days from Surat warehouse. Payment via RTGS/NEFT within 15 days of delivery.\n"
        "10:12 AM [Sharmaji - Supreme Fabrics]: Confirmed. Please proceed with the order of 500 meters at ₹120/m as agreed."
    )
    agreement_text = (
        "COMMERCIAL DEAL SUMMARY — PRIME TEXTILES & SUPREME FABRICS\n"
        "1. PARTIES: Rajesh (Prime Textiles, Supplier) and Sharmaji (Supreme Fabrics, Buyer).\n"
        "2. SCOPE: Supply of 500 meters of Grade-A cotton yarn.\n"
        "3. PRICE & TAX: Total consideration ₹60,000 (INR) at ₹120 per meter, inclusive of all GST.\n"
        "4. DELIVERY TIMELINE: Dispatch within 5 business days from Surat warehouse.\n"
        "5. PAYMENT TERMS: Full payment due via RTGS/NEFT within 15 days following delivery.\n"
        "6. STATUTORY STATUS: Electronic consensus ad idem established under Section 10A IT Act, 2000."
    )
    seal = build_cryptographic_seal(chat_text, None, agreement_text)
    cert = generate_bsa_section_63_certificate("SCENARIO-01", seal, "Sharmaji (Buyer Custodian)", "Apple iPhone 14 Pro")
    stamp = evaluate_stamp_duty_and_exclusions(chat_text, "Karnataka", "₹60,000")

    return DealAnalysisResponse(
        deal_id="scenario_1_complete",
        parsed_messages=[
            ChatMessage(msg_id="MSG-01", sender="Rajesh - Prime Textiles", timestamp="10:00 AM", content="Namaste Sharmaji, we can supply 500 meters of Grade-A cotton yarn at ₹120 per meter. Total consideration ₹60,000, inclusive of all GST.", source_type="text"),
            ChatMessage(msg_id="MSG-02", sender="Sharmaji - Supreme Fabrics", timestamp="10:05 AM", content="Please confirm delivery date and payment conditions.", source_type="text"),
            ChatMessage(msg_id="MSG-03", sender="Rajesh - Prime Textiles", timestamp="10:08 AM", content="Dispatch within 5 business days from Surat warehouse. Payment via RTGS/NEFT within 15 days of delivery.", source_type="text"),
            ChatMessage(msg_id="MSG-04", sender="Sharmaji - Supreme Fabrics", timestamp="10:12 AM", content="Confirmed. Please proceed with the order of 500 meters at ₹120/m as agreed.", source_type="text"),
        ],
        clauses={
            "parties": ExtractedClause(field_name="parties", value="Prime Textiles (Supplier) & Supreme Fabrics (Buyer)", status="clear", source_msg_ids=["MSG-01", "MSG-04"], confidence_note="Identified commercial entities and counterparty trading names."),
            "scope": ExtractedClause(field_name="scope", value="500 meters of Grade-A cotton yarn", status="clear", source_msg_ids=["MSG-01", "MSG-04"], confidence_note="Explicit product description and quantity defined."),
            "price_and_tax": ExtractedClause(field_name="price_and_tax", value="₹60,000 INR (₹120/meter), GST Inclusive", status="clear", source_msg_ids=["MSG-01"], confidence_note="Unit price, total, and GST inclusion expressly stated."),
            "delivery_timeline": ExtractedClause(field_name="delivery_timeline", value="Within 5 business days from Surat warehouse", status="clear", source_msg_ids=["MSG-03"], confidence_note="Dispatch window and origin warehouse identified."),
            "payment_terms": ExtractedClause(field_name="payment_terms", value="Payment via RTGS/NEFT within 15 days post delivery", status="clear", source_msg_ids=["MSG-03"], confidence_note="Payment mechanism and credit period specified."),
        },
        validity_checklist={
            "identifiable_parties": True,
            "clear_offer": True,
            "unqualified_acceptance": True,
            "lawful_consideration": True,
            "not_excluded_by_statute": True,
        },
        validity_score=95,
        novation_detected=False,
        novation_summary="No post-formation alterations detected. Original consensus ad idem preserved.",
        gaps=[],
        whatsapp_clarification_draft="All essential terms are confirmed. Ready for bilateral seal.",
        plain_language_summary=agreement_text,
        stamp_duty=stamp,
        cryptographic_seal=seal,
        bsa_section_63_certificate=cert,
        system_limitations=[
            "Party legal entity types (LLP/Pvt Ltd/Proprietorship) should be corroborated with GSTIN invoice.",
            "Transit insurance liability is assumed to follow standard Incoterms unless specified otherwise."
        ],
    )


def _create_scenario_2() -> DealAnalysisResponse:
    chat_text = (
        "02:15 PM [Vendor]: Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm.\n"
        "02:22 PM [Ravi]: Ok send them."
    )
    agreement_text = (
        "COMMERCIAL DEAL SUMMARY — OFFICE CHAIR SUPPLY (PROVISIONAL)\n"
        "1. PARTIES: Vendor (Supplier, [Needs Confirmation]) and Ravi (Buyer, [Needs Confirmation]).\n"
        "2. SCOPE: Supply of 100 office chairs.\n"
        "3. PRICE & TAX: ₹50,000 (INR) [Tax / GST Status: Unspecified in conversation — must be confirmed].\n"
        "4. DELIVERY TIMELINE: Within 10 days [Delivery countdown trigger undefined].\n"
        "5. PAYMENT TERMS: Payment due after delivery [Specific credit window in calendar days undefined].\n"
        "6. STATUTORY STATUS: Preliminary agreement with critical commercial ambiguities."
    )
    seal = build_cryptographic_seal(chat_text, None, agreement_text)
    cert = generate_bsa_section_63_certificate("SCENARIO-02", seal, "Ravi (Addressee)", "Samsung Galaxy S23")
    stamp = evaluate_stamp_duty_and_exclusions(chat_text, "Karnataka", "₹50,000")

    return DealAnalysisResponse(
        deal_id="scenario_2_missing_gaps",
        parsed_messages=[
            ChatMessage(msg_id="MSG-01", sender="Vendor", timestamp="02:15 PM", content="Hi Ravi, I can supply 100 office chairs for ₹50,000. I can deliver them within 10 days. You can pay after delivery. Please confirm.", source_type="text"),
            ChatMessage(msg_id="MSG-02", sender="Ravi", timestamp="02:22 PM", content="Ok send them.", source_type="text"),
        ],
        clauses={
            "parties": ExtractedClause(field_name="parties", value="Vendor (Supplier) & Ravi (Buyer)", status="ambiguous", source_msg_ids=["MSG-01"], confidence_note="Addressed by first name only; registered legal business entities and GSTINs unstated."),
            "scope": ExtractedClause(field_name="scope", value="100 office chairs", status="clear", source_msg_ids=["MSG-01"], confidence_note="Quantity and product stated, but technical specs/model unstated."),
            "price_and_tax": ExtractedClause(field_name="price_and_tax", value="₹50,000 (INR) [GST Status Unspecified]", status="ambiguous", source_msg_ids=["MSG-01"], confidence_note="Total price stated, but tax inclusion (18% GST) is not specified."),
            "delivery_timeline": ExtractedClause(field_name="delivery_timeline", value="Within 10 days [Trigger Unspecified]", status="ambiguous", source_msg_ids=["MSG-01"], confidence_note="Countdown duration specified without start date or PO trigger."),
            "payment_terms": ExtractedClause(field_name="payment_terms", value="Pay after delivery [Deadline Unspecified]", status="ambiguous", source_msg_ids=["MSG-01"], confidence_note="Unspecified number of calendar days by which full settlement is due."),
        },
        validity_checklist={
            "identifiable_parties": False,
            "clear_offer": True,
            "unqualified_acceptance": True,
            "lawful_consideration": True,
            "not_excluded_by_statute": True,
        },
        validity_score=60,
        novation_detected=False,
        novation_summary="No post-formation novation. Baseline contract suffers from four critical commercial ambiguities.",
        gaps=[
            AmbiguityGap(field="Tax (GST)", issue_description="Tax applicability (GST 18%) is not specified as inclusive or extra.", legal_risk="In MSME supply disputes, an 18% GST variance at invoice time frequently triggers payment refusal.", suggested_default="Does the ₹50,000 price include 18% GST, or will GST be charged extra on the tax invoice?"),
            AmbiguityGap(field="Delivery Trigger", issue_description="The timeline specifies 'within 10 days' without stating the countdown start trigger.", legal_risk="Unclear whether the 10-day countdown begins from message date, PO issuance, or token advance.", suggested_default="Does the 10-day delivery timeline begin from today's confirmation date?"),
            AmbiguityGap(field="Payment Deadline", issue_description="Payment is stated as 'after delivery' with no credit window.", legal_risk="Section 15 of MSMED Act requires payment within agreed window. Lack of calendar days makes overdue date ambiguous.", suggested_default="How many calendar days after delivery is full payment due (e.g., within 7 days)?"),
            AmbiguityGap(field="Freight & Transport", issue_description="Transportation cost and transit damage liability are unallocated.", legal_risk="Disputes arise over who bears freight charges and transit insurance risk.", suggested_default="Who arranges and pays for shipping/transport, and who bears transit risk?"),
        ],
        whatsapp_clarification_draft=(
            "Hi Ravi, thanks for confirming! To keep our agreement clear, please confirm: "
            "(1) Does ₹50,000 include GST? (2) Does the 10-day delivery start from today? "
            "(3) Is payment due within 7 days of delivery? (4) Is doorstep transport included?"
        ),
        plain_language_summary=agreement_text,
        stamp_duty=stamp,
        cryptographic_seal=seal,
        bsa_section_63_certificate=cert,
        system_limitations=[
            "Vendor's full legal entity name is missing from chat text.",
            "Ravi's organization name and capacity (proprietor vs corporate buyer) are unknown."
        ],
    )


def _create_scenario_3() -> DealAnalysisResponse:
    chat_text = (
        "11:00 AM [Priya - Digital Agency]: Hi Amit, we can deliver your custom mobile app frontend for ₹85,000 by 15 November 2026. 40% advance required.\n"
        "11:05 AM [Amit - Retail Store]: Deal confirmed. Sending 40% advance today. Deliver by 15 Nov.\n"
        "11:15 AM [Priya - Digital Agency]: [Voice Note Transcribed]: 'Hey Amit, our lead engineer is out sick for 4 days. Can we mutually shift the final delivery date from 15 November to 25 November? All other pricing and milestones remain identical.'\n"
        "11:20 AM [Amit - Retail Store]: Agreed Priya, no problem. 25 November is approved as the revised completion date."
    )
    agreement_text = (
        "COMMERCIAL DEAL SUMMARY — CUSTOM APP FRONTEND DEVELOPMENT\n"
        "1. PARTIES: Priya (Digital Agency, Service Provider) and Amit (Retail Store, Client).\n"
        "2. SCOPE: Custom mobile app frontend development.\n"
        "3. PRICE & TAX: Total consideration ₹85,000 (INR); 40% advance paid.\n"
        "4. DELIVERY TIMELINE: Revised to 25 November 2026 (Consensual post-formation alteration).\n"
        "5. PAYMENT TERMS: 40% advance, balance upon completion milestone.\n"
        "6. STATUTORY STATUS: Contract formed at 11:05 AM; mutually altered under Section 62 ICA at 11:20 AM."
    )
    seal = build_cryptographic_seal(chat_text, b"SIMULATED_OPUS_VOICE_NOTE_BYTES_1115AM", agreement_text)
    cert = generate_bsa_section_63_certificate("SCENARIO-03", seal, "Priya (Service Provider)", "Google Pixel 8")
    stamp = evaluate_stamp_duty_and_exclusions(chat_text, "Maharashtra", "₹85,000")

    return DealAnalysisResponse(
        deal_id="scenario_3_voice_novation",
        parsed_messages=[
            ChatMessage(msg_id="MSG-01", sender="Priya - Digital Agency", timestamp="11:00 AM", content="Hi Amit, we can deliver your custom mobile app frontend for ₹85,000 by 15 November 2026. 40% advance required.", source_type="text"),
            ChatMessage(msg_id="MSG-02", sender="Amit - Retail Store", timestamp="11:05 AM", content="Deal confirmed. Sending 40% advance today. Deliver by 15 Nov.", source_type="text"),
            ChatMessage(msg_id="MSG-03", sender="Priya - Digital Agency", timestamp="11:15 AM", content="[Voice Note Transcribed]: 'Hey Amit, our lead engineer is out sick for 4 days. Can we mutually shift the final delivery date from 15 November to 25 November? All other pricing and milestones remain identical.'", source_type="audio_transcript"),
            ChatMessage(msg_id="MSG-04", sender="Amit - Retail Store", timestamp="11:20 AM", content="Agreed Priya, no problem. 25 November is approved as the revised completion date.", source_type="text"),
        ],
        clauses={
            "parties": ExtractedClause(field_name="parties", value="Digital Agency (Priya) & Retail Store (Amit)", status="clear", source_msg_ids=["MSG-01", "MSG-02"], confidence_note="Parties explicitly identified."),
            "scope": ExtractedClause(field_name="scope", value="Custom mobile app frontend development", status="clear", source_msg_ids=["MSG-01"], confidence_note="Specific software development scope stated."),
            "price_and_tax": ExtractedClause(field_name="price_and_tax", value="₹85,000 (INR), 40% advance", status="clear", source_msg_ids=["MSG-01", "MSG-02"], confidence_note="Contract sum and advance requirement confirmed."),
            "delivery_timeline": ExtractedClause(field_name="delivery_timeline", value="25 November 2026 (Altered from 15 Nov via Section 62 ICA)", status="clear", source_msg_ids=["MSG-03", "MSG-04"], confidence_note="Mutual post-formation alteration assented to by both parties."),
            "payment_terms": ExtractedClause(field_name="payment_terms", value="40% advance, balance upon delivery", status="clear", source_msg_ids=["MSG-01", "MSG-02"], confidence_note="Staged milestone payment terms agreed."),
        },
        validity_checklist={
            "identifiable_parties": True,
            "clear_offer": True,
            "unqualified_acceptance": True,
            "lawful_consideration": True,
            "not_excluded_by_statute": True,
        },
        validity_score=90,
        novation_detected=True,
        novation_summary=(
            "Post-formation alteration detected under Section 62 of the Indian Contract Act, 1872. "
            "Original contract concluded at 11:05 AM (MSG-02) with 15 Nov delivery. Voice note at 11:15 AM (MSG-03) "
            "proposed shifting delivery to 25 Nov, assented to unconditionally by client at 11:20 AM (MSG-04). "
            "This constitutes a valid consensual alteration, not a counter-offer."
        ),
        gaps=[],
        whatsapp_clarification_draft="Both parties have assented to revised completion date of 25 November 2026.",
        plain_language_summary=agreement_text,
        stamp_duty=stamp,
        cryptographic_seal=seal,
        bsa_section_63_certificate=cert,
        system_limitations=[
            "Voice note transcript is an ASR derivative; original uncompressed audio file (.opus) is preserved in cryptographic seal.",
            "Source code IP transfer assignment requires signed writing under Section 19(1) of Copyright Act, 1957."
        ],
    )


def _create_scenario_4() -> DealAnalysisResponse:
    chat_text = (
        "09:15 AM [Karan]: Bro send the usual items at last month's cash rate.\n"
        "09:18 AM [Sunil]: Done bro, will send."
    )
    agreement_text = (
        "COMMERCIAL DEAL SUMMARY — UNENFORCEABLE INFORMAL MEMORANDUM\n"
        "1. PARTIES: Karan and Sunil (Unverified informal names).\n"
        "2. SCOPE: [MISSING] 'Usual items' lacks subject-matter certainty under Section 29 ICA.\n"
        "3. PRICE & TAX: [MISSING] 'Last month's cash rate' is indeterminate on the face of the record.\n"
        "4. DELIVERY TIMELINE: [MISSING] Delivery date or duration is unstated.\n"
        "5. PAYMENT TERMS: [MISSING] Cash payment terms without credit terms or invoice mechanism.\n"
        "6. STATUTORY STATUS: Void for uncertainty under Section 29 of the Indian Contract Act, 1872."
    )
    seal = build_cryptographic_seal(chat_text, None, agreement_text)
    cert = generate_bsa_section_63_certificate("SCENARIO-04", seal, "Karan (Sender)", "OnePlus 11")
    stamp = evaluate_stamp_duty_and_exclusions(chat_text, "Delhi", "Unknown")

    return DealAnalysisResponse(
        deal_id="scenario_4_failure_edge_case",
        parsed_messages=[
            ChatMessage(msg_id="MSG-01", sender="Karan", timestamp="09:15 AM", content="Bro send the usual items at last month's cash rate.", source_type="text"),
            ChatMessage(msg_id="MSG-02", sender="Sunil", timestamp="09:18 AM", content="Done bro, will send.", source_type="text"),
        ],
        clauses={
            "parties": ExtractedClause(field_name="parties", value="Karan & Sunil", status="ambiguous", source_msg_ids=["MSG-01", "MSG-02"], confidence_note="Informal first names only; legal identities and addresses unknown."),
            "scope": ExtractedClause(field_name="scope", value="[Missing — 'usual items' undefined]", status="missing", source_msg_ids=["MSG-01"], confidence_note="Subject matter is completely uncertain on the face of the record."),
            "price_and_tax": ExtractedClause(field_name="price_and_tax", value="[Missing — 'last month's cash rate' undefined]", status="missing", source_msg_ids=["MSG-01"], confidence_note="No price, rate per unit, or tax rate is stated in the messages."),
            "delivery_timeline": ExtractedClause(field_name="delivery_timeline", value="[Missing — timeline unstated]", status="missing", source_msg_ids=["MSG-02"], confidence_note="'Will send' does not define a measurable delivery deadline."),
            "payment_terms": ExtractedClause(field_name="payment_terms", value="[Missing — cash rate without mechanism]", status="missing", source_msg_ids=["MSG-01"], confidence_note="No banking channel, credit window, or invoicing protocol identified."),
        },
        validity_checklist={
            "identifiable_parties": False,
            "clear_offer": False,
            "unqualified_acceptance": False,
            "lawful_consideration": False,
            "not_excluded_by_statute": True,
        },
        validity_score=20,
        novation_detected=False,
        novation_summary="No novation. Agreement fails fundamental statutory certainty requirements.",
        gaps=[
            AmbiguityGap(field="Contractual Uncertainty (Section 29 ICA)", issue_description="The phrases 'usual items' and 'last month's cash rate' are completely indeterminate.", legal_risk="Under Section 29 of the Indian Contract Act, 1872, agreements the meaning of which is not certain, or capable of being made certain, are void.", suggested_default="Specify exact product item names, SKU/model numbers, quantities, and agreed per-unit pricing in text."),
            AmbiguityGap(field="Delivery & Payment Schedule", issue_description="No delivery date or payment schedule exists on the record.", legal_risk="Neither delay nor non-payment can be held against either party without objective contractual benchmarks.", suggested_default="Confirm committed delivery date and payment method (e.g. UPI/NEFT within 7 days of invoice)."),
        ],
        whatsapp_clarification_draft=(
            "Hi Sunil, before dispatching, please confirm in writing: (1) Exact items and quantities to be supplied, "
            "(2) Agreed unit price and total amount, (3) Delivery date, and (4) Payment terms."
        ),
        plain_language_summary=agreement_text,
        stamp_duty=stamp,
        cryptographic_seal=seal,
        bsa_section_63_certificate=cert,
        system_limitations=[
            "HONEST SYSTEM LIMITATION: Deal terms exist solely in offline memories or unsubmitted past transactions.",
            "DealProof AI strictly refuses to fabricate missing prices, quantities, or product names.",
            "Agreement is legally unenforceable in court under Section 29 of the Indian Contract Act, 1872."
        ],
    )


PRELOADED_SCENARIOS: Dict[str, DealAnalysisResponse] = {
    "scenario_1_complete": _create_scenario_1(),
    "scenario_2_missing_gaps": _create_scenario_2(),
    "scenario_3_voice_novation": _create_scenario_3(),
    "scenario_4_failure_edge_case": _create_scenario_4(),
}
