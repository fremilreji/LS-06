import os
import re
import uuid
import json
from typing import Optional, Dict, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import (
    ChatMessage,
    ExtractedClause,
    AmbiguityGap,
    DealAnalysisResponse,
    ResolveGapsRequest,
    VerifyTamperRequest,
    VerifyTamperResponse,
)
from legal_engine import (
    compute_sha256,
    normalize_text_payload,
    build_cryptographic_seal,
    evaluate_stamp_duty_and_exclusions,
    generate_bsa_section_63_certificate,
    PRELOADED_SCENARIOS,
    get_current_ist_timestamp,
)

load_dotenv()

app = FastAPI(
    title="DealProof AI / PactProof Legal Analysis Engine",
    description="Deterministic and Hybrid AI Indian Commercial Contract Formulation, BSA 2023 Certification & Stamp Duty Engine",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store for analyzed deals
DEAL_STORE: Dict[str, DealAnalysisResponse] = {}

# Populate preloaded scenarios into DEAL_STORE on startup
for key, scenario in PRELOADED_SCENARIOS.items():
    DEAL_STORE[key] = scenario
    DEAL_STORE[scenario.deal_id] = scenario


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "DealProof AI / PactProof Backend Engine",
        "jurisdiction": "India (ICA 1872, IT Act 2000, BSA 2023)",
        "available_presets": list(PRELOADED_SCENARIOS.keys()),
        "endpoints": [
            "GET /api/presets/{scenario_id}",
            "POST /api/analyze",
            "POST /api/resolve-gaps",
            "POST /api/verify-tamper",
        ],
    }


@app.get("/api/presets/{scenario_id}", response_model=DealAnalysisResponse)
def get_preset(scenario_id: str):
    """
    Returns a complete, pre-calculated benchmark scenario with live computed SHA-256 digests.
    """
    if scenario_id not in PRELOADED_SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Preset '{scenario_id}' not found. Available presets: {list(PRELOADED_SCENARIOS.keys())}",
        )
    preset = PRELOADED_SCENARIOS[scenario_id]

    # Re-verify and refresh seal hashes
    chat_content = "\n".join([f"{m.timestamp} [{m.sender}]: {m.content}" for m in preset.parsed_messages])
    refreshed_seal = build_cryptographic_seal(chat_content, None, preset.plain_language_summary)
    refreshed_cert = generate_bsa_section_63_certificate(
        preset.deal_id, refreshed_seal, "Authorized SME Custodian", "Smartphone Terminal"
    )

    preset.cryptographic_seal = refreshed_seal
    preset.bsa_section_63_certificate = refreshed_cert
    DEAL_STORE[preset.deal_id] = preset
    return preset


def _parse_custom_chat_deterministic(
    raw_text: str, state: str, audio_bytes: Optional[bytes] = None
) -> DealAnalysisResponse:
    """
    Deterministic rule-based parser that executes 100% offline without LLM reliance.
    Handles Indian commercial terminology, GST, delivery triggers, and novation.
    """
    deal_id = f"deal_{uuid.uuid4().hex[:8]}"
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

    parsed_messages: List[ChatMessage] = []
    for idx, line in enumerate(lines, 1):
        msg_id = f"MSG-{idx:02d}"

        # Pattern: "10:02 AM [Sender]: Content" or "Sender: Content" or "10:02 AM - Sender: Content"
        match_bracket = re.match(r"(?:(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[-]?\s*)?\[([^\]]+)\]:\s*(.*)", line)
        match_colon = re.match(r"(?:(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[-]?\s*)?([^:]+):\s*(.*)", line)

        if match_bracket:
            timestamp = match_bracket.group(1) or "10:00 AM"
            sender = match_bracket.group(2).strip()
            content = match_bracket.group(3).strip()
        elif match_colon:
            timestamp = match_colon.group(1) or "10:00 AM"
            sender = match_colon.group(2).strip()
            content = match_colon.group(3).strip()
        else:
            timestamp = "10:00 AM"
            sender = f"Party-{idx}"
            content = line

        is_audio = "voice note" in content.lower() or "audio" in content.lower()
        parsed_messages.append(
            ChatMessage(
                msg_id=msg_id,
                sender=sender,
                timestamp=timestamp,
                content=content,
                source_type="audio_transcript" if is_audio else "text",
            )
        )

    # Clause Extraction Heuristics
    lower_raw = raw_text.lower()

    # 1. Price and Currency
    price_match = (
        re.search(r"(?:₹|rs\.?|inr|\?)\s*([\d,]+(?:\.\d+)?)", raw_text, re.I)
        or re.search(r"([\d,]+(?:\.\d+)?)\s*(?:inr|rupees|\/-)", raw_text, re.I)
        or re.search(r"(?:for|amount of|total of|sum of)\s*(?:₹|rs\.?|inr|\?)?\s*([\d,]+(?:\.\d+)?)", raw_text, re.I)
    )
    if price_match:
        price_val = f"₹{price_match.group(1)}"
        has_gst = "inclusive" in lower_raw or "gst" in lower_raw
        price_clause = ExtractedClause(
            field_name="price_and_tax",
            value=f"{price_val} INR ({'GST Inclusive' if has_gst else 'GST Unspecified'})",
            status="clear" if has_gst else "ambiguous",
            source_msg_ids=[parsed_messages[0].msg_id] if parsed_messages else [],
            confidence_note="Identified numeric monetary figure with currency symbol.",
        )
    else:
        price_clause = ExtractedClause(
            field_name="price_and_tax",
            value="[Missing — price unstated]",
            status="missing",
            source_msg_ids=[],
            confidence_note="No explicit price or rate could be detected in text.",
        )

    # 2. Scope & Quantity
    qty_product_match = re.search(r"(\d+(?:,\d+)?\s*(?:units?|chairs?|meters?|pcs?|boxes?|kg|tons?|laptops?|items?)[^,\.\n]*)", raw_text, re.I)
    if qty_product_match:
        scope_clause = ExtractedClause(
            field_name="scope",
            value=qty_product_match.group(1).strip(),
            status="clear",
            source_msg_ids=[parsed_messages[0].msg_id] if parsed_messages else [],
            confidence_note="Extracted explicit product description and numeric quantity.",
        )
    else:
        scope_clause = ExtractedClause(
            field_name="scope",
            value="Commercial supplies / services as discussed",
            status="ambiguous",
            source_msg_ids=[],
            confidence_note="Identified general subject matter; exact product specifications require confirmation.",
        )

    # 3. Parties
    senders = list(dict.fromkeys([m.sender for m in parsed_messages]))
    if len(senders) >= 2:
        parties_clause = ExtractedClause(
            field_name="parties",
            value=f"{senders[0]} (Party 1) & {senders[1]} (Party 2)",
            status="ambiguous",
            source_msg_ids=[m.msg_id for m in parsed_messages[:2]],
            confidence_note="Discovered communicating handles. Registered corporate entities and GSTINs remain unstated.",
        )
    else:
        parties_clause = ExtractedClause(
            field_name="parties",
            value=f"{senders[0] if senders else 'Supplier'} & Counterparty",
            status="ambiguous",
            source_msg_ids=[],
            confidence_note="Single sender handle detected in chat excerpt.",
        )

    # 4. Delivery Timeline
    delivery_match = re.search(r"(?:within|in|by)\s*(\d+\s*(?:days?|weeks?|business days?)|(?:\d{1,2}(?:st|nd|rd|th)?\s*[a-zA-Z]+))", raw_text, re.I)
    if delivery_match:
        delivery_clause = ExtractedClause(
            field_name="delivery_timeline",
            value=f"Within {delivery_match.group(1).strip()}",
            status="ambiguous" if "from" not in lower_raw else "clear",
            source_msg_ids=[parsed_messages[0].msg_id] if parsed_messages else [],
            confidence_note="Delivery timeframe detected; trigger start event requires confirmation.",
        )
    else:
        delivery_clause = ExtractedClause(
            field_name="delivery_timeline",
            value="[Missing — delivery timeline unstated]",
            status="missing",
            source_msg_ids=[],
            confidence_note="No delivery timeline or committed completion date found.",
        )

    # 5. Payment Terms
    payment_match = re.search(r"(pay\s*after\s*delivery|advance|\d+%\s*advance|net\s*\d+\s*days?|rtgs|neft|cod)", raw_text, re.I)
    if payment_match:
        payment_clause = ExtractedClause(
            field_name="payment_terms",
            value=payment_match.group(1).strip().capitalize(),
            status="ambiguous" if "after delivery" in payment_match.group(1).lower() and not re.search(r"\d+\s*days", payment_match.group(1).lower()) else "clear",
            source_msg_ids=[parsed_messages[0].msg_id] if parsed_messages else [],
            confidence_note="Payment condition identified.",
        )
    else:
        payment_clause = ExtractedClause(
            field_name="payment_terms",
            value="[Missing — payment schedule undefined]",
            status="missing",
            source_msg_ids=[],
            confidence_note="Payment terms and credit window are not recorded in messages.",
        )

    clauses = {
        "parties": parties_clause,
        "scope": scope_clause,
        "price_and_tax": price_clause,
        "delivery_timeline": delivery_clause,
        "payment_terms": payment_clause,
    }

    # Novation check (Section 62 ICA)
    novation_cues = ["shift delivery", "extend delivery", "revise date", "can we mutually", "instead of", "reschedule"]
    novation_detected = any(cue in lower_raw for cue in novation_cues)
    if novation_detected:
        novation_summary = "Subsequent message or voice note indicates mutual request to vary delivery date/terms, qualifying as a Section 62 ICA post-formation alteration."
    else:
        novation_summary = "No post-formation novation detected."

    # Ambiguity Gaps
    gaps: List[AmbiguityGap] = []
    if "gst" not in lower_raw and "inclusive" not in lower_raw and price_clause.status != "missing":
        gaps.append(
            AmbiguityGap(
                field="Tax (GST)",
                issue_description="The agreed price does not state whether GST (e.g. 18%) is inclusive or extra.",
                legal_risk="In MSME commerce, tax disputes at invoice time cause payments to be held back.",
                suggested_default="Does the stated price include applicable GST, or is GST charged extra?",
            )
        )
    if delivery_clause.status == "ambiguous":
        gaps.append(
            AmbiguityGap(
                field="Delivery Countdown Trigger",
                issue_description="Delivery duration is specified without an objective start date.",
                legal_risk="Ambiguity over whether the countdown begins from chat date, PO issuance, or token advance.",
                suggested_default="Does the delivery timeline begin from today's confirmation date?",
            )
        )
    if "freight" not in lower_raw and "transport" not in lower_raw:
        gaps.append(
            AmbiguityGap(
                field="Freight & Transport Responsibility",
                issue_description="Logistics cost and transit damage liability are unallocated.",
                legal_risk="Disputes arise if goods are damaged during transit without agreed insurance responsibility.",
                suggested_default="Who arranges and pays for shipping/transport, and who bears transit risk?",
            )
        )

    # Score Calculation
    score = 100
    for c in clauses.values():
        if c.status == "missing":
            score -= 20
        elif c.status == "ambiguous":
            score -= 10
    score = max(20, min(100, score))

    validity_checklist = {
        "identifiable_parties": clauses["parties"].status != "missing",
        "clear_offer": clauses["scope"].status != "missing" and clauses["price_and_tax"].status != "missing",
        "unqualified_acceptance": any(w in lower_raw for w in ["confirm", "proceed", "agreed", "done", "ok"]),
        "lawful_consideration": clauses["price_and_tax"].status != "missing",
        "not_excluded_by_statute": True,
    }

    # Plain Language Summary
    plain_summary = (
        f"COMMERCIAL DEAL SUMMARY — {deal_id.upper()}\n"
        f"1. PARTIES: {clauses['parties'].value}.\n"
        f"2. SCOPE: {clauses['scope'].value}.\n"
        f"3. PRICE & TAX: {clauses['price_and_tax'].value}.\n"
        f"4. DELIVERY TIMELINE: {clauses['delivery_timeline'].value}.\n"
        f"5. PAYMENT TERMS: {clauses['payment_terms'].value}.\n"
        f"6. STATUTORY STATUS: Bilateral agreement draft subject to Indian Contract Act, 1872 & BSA 2023."
    )

    clarification_draft = (
        "Hi, to confirm our mutual understanding before dispatch: "
        + " ".join([f"({i+1}) {g.suggested_default}" for i, g in enumerate(gaps)])
        if gaps
        else "All commercial parameters have been captured clearly."
    )

    seal = build_cryptographic_seal(raw_text, audio_bytes, plain_summary)
    cert = generate_bsa_section_63_certificate(deal_id, seal, "Authorized SME Custodian", "Smartphone Terminal")
    stamp = evaluate_stamp_duty_and_exclusions(raw_text, state, clauses["price_and_tax"].value)

    if stamp.is_barred_by_it_act_schedule_1:
        validity_checklist["not_excluded_by_statute"] = False
        score = 10

    return DealAnalysisResponse(
        deal_id=deal_id,
        parsed_messages=parsed_messages,
        clauses=clauses,
        validity_checklist=validity_checklist,
        validity_score=score,
        novation_detected=novation_detected,
        novation_summary=novation_summary,
        gaps=gaps,
        whatsapp_clarification_draft=clarification_draft,
        plain_language_summary=plain_summary,
        stamp_duty=stamp,
        cryptographic_seal=seal,
        bsa_section_63_certificate=cert,
        system_limitations=[
            "Deterministic rule engine parser; corroboration with formal tax invoice is recommended.",
            "Bitstream integrity certified by SHA-256 seal; Part A device ownership remains custodian's sworn responsibility."
        ],
    )


async def _parse_with_gemini_if_configured(
    raw_text: str, state: str, audio_bytes: Optional[bytes] = None
) -> Optional[DealAnalysisResponse]:
    """
    Attempts parsing with Google Gemini API if GEMINI_API_KEY is present in environment.
    Falls back gracefully if key is absent or API call fails.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        system_prompt = (
            "You are an expert Indian commercial and evidence law analyst for DealProof AI (Hackathon Problem LS-06). "
            "Analyze the informal WhatsApp / message exchange and return strict JSON conforming to DealAnalysisResponse schema. "
            "Do NOT invent unmentioned clauses. If a term is unstated, mark it as 'missing' or 'ambiguous'."
        )

        user_content = f"State Jurisdiction: {state}\n\nConversation Text:\n\"\"\"\n{raw_text}\n\"\"\""

        # Try gemini-2.5-flash with fallback to gemini-1.5-flash
        model_name = "gemini-2.5-flash"
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[f"{system_prompt}\n\n{user_content}"],
                config={"response_mime_type": "application/json"},
            )
        except Exception:
            model_name = "gemini-1.5-flash"
            response = client.models.generate_content(
                model=model_name,
                contents=[f"{system_prompt}\n\n{user_content}"],
                config={"response_mime_type": "application/json"},
            )

        if not response or not response.text:
            return None

        parsed_json = json.loads(response.text)
        deal_id = f"deal_{uuid.uuid4().hex[:8]}"

        # Re-construct Pydantic clauses
        parsed_messages = [ChatMessage(**m) for m in parsed_json.get("parsed_messages", [])]
        clauses = {k: ExtractedClause(**v) for k, v in parsed_json.get("clauses", {}).items()}
        gaps = [AmbiguityGap(**g) for g in parsed_json.get("gaps", [])]

        plain_summary = parsed_json.get(
            "plain_language_summary",
            f"COMMERCIAL SUMMARY — {deal_id}\nParties: {clauses.get('parties', {}).get('value', 'Unspecified')}",
        )

        seal = build_cryptographic_seal(raw_text, audio_bytes, plain_summary)
        cert = generate_bsa_section_63_certificate(deal_id, seal, "Authorized SME Custodian", "Smartphone Terminal")
        stamp = evaluate_stamp_duty_and_exclusions(
            raw_text, state, clauses.get("price_and_tax", ExtractedClause(field_name="price", value="0", status="missing", confidence_note="")).value
        )

        validity_score = parsed_json.get("validity_score", 75)
        validity_checklist = parsed_json.get(
            "validity_checklist",
            {
                "identifiable_parties": True,
                "clear_offer": True,
                "unqualified_acceptance": True,
                "lawful_consideration": True,
                "not_excluded_by_statute": not stamp.is_barred_by_it_act_schedule_1,
            },
        )

        return DealAnalysisResponse(
            deal_id=deal_id,
            parsed_messages=parsed_messages,
            clauses=clauses,
            validity_checklist=validity_checklist,
            validity_score=validity_score,
            novation_detected=parsed_json.get("novation_detected", False),
            novation_summary=parsed_json.get("novation_summary", "No novation detected."),
            gaps=gaps,
            whatsapp_clarification_draft=parsed_json.get("whatsapp_clarification_draft", ""),
            plain_language_summary=plain_summary,
            stamp_duty=stamp,
            cryptographic_seal=seal,
            bsa_section_63_certificate=cert,
            system_limitations=[
                f"Parsed via hybrid AI ({model_name}) with deterministic legal seals.",
                "Review unconfirmed clauses prior to final execution.",
            ],
        )
    except Exception as e:
        print(f"[Gemini Warning] Falling back to deterministic parser: {e}")
        return None


@app.post("/api/analyze", response_model=DealAnalysisResponse)
async def analyze_deal(
    chat_text: Optional[str] = Form(None),
    state: str = Form("Karnataka"),
    device_owner: str = Form("SME Owner"),
    chat_file: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None),
):
    """
    Main Analysis Endpoint:
    Accepts text or uploaded chat/audio files.
    Runs hybrid AI if configured, otherwise executes the complete deterministic legal engine.
    """
    extracted_text = ""
    if chat_file:
        content_bytes = await chat_file.read()
        extracted_text = content_bytes.decode("utf-8", errors="replace")
    elif chat_text:
        extracted_text = chat_text.strip()

    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No chat text or file provided. Please provide 'chat_text' or upload 'chat_file'.",
        )

    audio_bytes: Optional[bytes] = None
    if audio_file:
        audio_bytes = await audio_file.read()

    # 1. Attempt Gemini hybrid analysis if API key is present
    result = await _parse_with_gemini_if_configured(extracted_text, state, audio_bytes)

    # 2. Fall back cleanly to deterministic parser
    if not result:
        result = _parse_custom_chat_deterministic(extracted_text, state, audio_bytes)

    # Store in memory session store
    DEAL_STORE[result.deal_id] = result
    return result


@app.post("/api/resolve-gaps", response_model=DealAnalysisResponse)
def resolve_gaps(request: ResolveGapsRequest):
    """
    Accepts resolved commercial terms (e.g. GST confirmed, 7-day payment window confirmed),
    updates clauses, removes resolved gaps, recalculates validity score, and regenerates seals.
    """
    if request.deal_id not in DEAL_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal '{request.deal_id}' not found in active session store.",
        )

    current_deal = DEAL_STORE[request.deal_id]
    clauses = current_deal.clauses.copy()
    gaps = current_deal.gaps.copy()

    FIELD_ALIASES = {
        "tax": "price_and_tax",
        "gst": "price_and_tax",
        "tax (gst)": "price_and_tax",
        "tax_(gst)": "price_and_tax",
        "price": "price_and_tax",
        "price_and_tax": "price_and_tax",
        "delivery": "delivery_timeline",
        "timeline": "delivery_timeline",
        "delivery_timeline": "delivery_timeline",
        "delivery trigger": "delivery_timeline",
        "delivery countdown trigger": "delivery_timeline",
        "payment": "payment_terms",
        "payment terms": "payment_terms",
        "payment_terms": "payment_terms",
        "freight": "delivery_timeline",
        "freight & transport": "delivery_timeline",
        "freight & transport responsibility": "delivery_timeline",
        "parties": "parties",
        "scope": "scope",
    }

    for field, new_value in request.resolved_fields.items():
        clean_field = field.strip().lower()
        target_clause_key = FIELD_ALIASES.get(clean_field, clean_field.replace(" ", "_"))
        if target_clause_key in clauses:
            clauses[target_clause_key].value = new_value
            clauses[target_clause_key].status = "clear"
            clauses[target_clause_key].confidence_note = "Confirmed and clarified by contracting party."
        # Remove from gaps list if present
        gaps = [g for g in gaps if g.field.lower() != clean_field and FIELD_ALIASES.get(g.field.lower(), "") != target_clause_key]

    # If counterparty explicitly confirmed the deal, promote any remaining ambiguous clauses to clear
    if request.counterparty_confirmed:
        for c in clauses.values():
            if c.status == "ambiguous":
                c.status = "clear"
                c.confidence_note += " (Ratified by mutual counterparty confirmation)."

    # Re-evaluate validity score
    missing_count = sum(1 for c in clauses.values() if c.status == "missing")
    ambiguous_count = sum(1 for c in clauses.values() if c.status == "ambiguous")
    new_score = max(40, 100 - (missing_count * 20) - (ambiguous_count * 10))

    if request.counterparty_confirmed and missing_count == 0 and ambiguous_count == 0:
        new_score = 100

    # Regenerate plain language summary
    updated_summary = (
        f"RATIFIED COMMERCIAL DEAL SUMMARY — {request.deal_id.upper()}\n"
        f"1. PARTIES: {clauses['parties'].value}.\n"
        f"2. SCOPE: {clauses['scope'].value}.\n"
        f"3. PRICE & TAX: {clauses['price_and_tax'].value}.\n"
        f"4. DELIVERY TIMELINE: {clauses['delivery_timeline'].value}.\n"
        f"5. PAYMENT TERMS: {clauses['payment_terms'].value}.\n"
        f"6. STATUS: {'CONFIRMED BILATERALLY BY BOTH PARTIES' if request.counterparty_confirmed else 'RESOLVED — PENDING FINAL COUNTERPARTY LOCK'}.\n"
        f"7. RATIFICATION TIMESTAMP: {get_current_ist_timestamp()}."
    )

    raw_chat = "\n".join([f"{m.timestamp} [{m.sender}]: {m.content}" for m in current_deal.parsed_messages])
    new_seal = build_cryptographic_seal(raw_chat, None, updated_summary)
    new_cert = generate_bsa_section_63_certificate(
        request.deal_id, new_seal, "Authorized SME Custodian", "Smartphone Terminal"
    )

    updated_deal = DealAnalysisResponse(
        deal_id=current_deal.deal_id,
        parsed_messages=current_deal.parsed_messages,
        clauses=clauses,
        validity_checklist={
            "identifiable_parties": True,
            "clear_offer": True,
            "unqualified_acceptance": True,
            "lawful_consideration": True,
            "not_excluded_by_statute": current_deal.validity_checklist.get("not_excluded_by_statute", True),
        },
        validity_score=new_score,
        novation_detected=current_deal.novation_detected,
        novation_summary=current_deal.novation_summary,
        gaps=gaps,
        whatsapp_clarification_draft="All terms resolved and ratified.",
        plain_language_summary=updated_summary,
        stamp_duty=current_deal.stamp_duty,
        cryptographic_seal=new_seal,
        bsa_section_63_certificate=new_cert,
        system_limitations=current_deal.system_limitations,
    )

    DEAL_STORE[request.deal_id] = updated_deal
    return updated_deal


@app.post("/api/verify-tamper", response_model=VerifyTamperResponse)
def verify_tamper(request: VerifyTamperRequest):
    """
    Tamper-Detection Endpoint:
    Recomputes SHA-256 digests over submitted chat text and agreement text,
    comparing against stored Master Merkle Root. Proves mathematical immutability.
    """
    if request.deal_id not in DEAL_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deal '{request.deal_id}' not found in active session store.",
        )

    stored_deal = DEAL_STORE[request.deal_id]
    stored_seal = stored_deal.cryptographic_seal

    # Compute submitted hashes
    norm_submitted_chat = normalize_text_payload(request.submitted_chat_text)
    norm_submitted_agreement = normalize_text_payload(request.submitted_agreement_text)

    computed_chat_hash = compute_sha256(norm_submitted_chat)
    computed_agreement_hash = compute_sha256(norm_submitted_agreement)

    stored_audio_hash = stored_seal.get("audio_sha256", "NO_AUDIO_UPLOADED")
    reconstructed_merkle_input = f"{computed_chat_hash}:{stored_audio_hash}:{computed_agreement_hash}"
    computed_merkle_root = compute_sha256(reconstructed_merkle_input)

    stored_merkle_root = stored_seal.get("master_merkle_root_sha256", "")

    chat_matches = computed_chat_hash == stored_seal.get("raw_chat_sha256", "")
    agreement_matches = computed_agreement_hash == stored_seal.get("agreement_sha256", "")
    is_authentic = computed_merkle_root == stored_merkle_root

    if is_authentic:
        verdict = (
            "AUTHENTIC & INTACT: All 64-character SHA-256 cryptographic digests match the original ingestion seal. "
            "Zero bitstream alteration, textual splicing, or date tampering detected."
        )
    else:
        discrepancies = []
        if not chat_matches:
            discrepancies.append("Chat Archive bitstream divergence detected (tampered message or timestamp)")
        if not agreement_matches:
            discrepancies.append("Agreement text divergence detected (modified clause, price, or terms)")
        verdict = f"TAMPERING DETECTED: Master Merkle Root collision failure. Discrepancies: {'; '.join(discrepancies)}."

    return VerifyTamperResponse(
        is_authentic=is_authentic,
        stored_merkle_root=stored_merkle_root,
        computed_merkle_root=computed_merkle_root,
        chat_hash_matches=chat_matches,
        agreement_hash_matches=agreement_matches,
        verdict_message=verdict,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
