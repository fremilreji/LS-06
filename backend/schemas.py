from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    msg_id: str = Field(..., description="Message identifier, e.g. MSG-01")
    sender: str = Field(..., description="Sender display name or phone number")
    timestamp: str = Field(..., description="Time of message, e.g. 10:02 AM")
    content: str = Field(..., description="Message text or transcription content")
    source_type: str = Field(..., description="'text' or 'audio_transcript'")


class ExtractedClause(BaseModel):
    field_name: str = Field(..., description="Field identifier, e.g. parties, scope, price_and_tax")
    value: str = Field(..., description="Extracted clause value or status")
    status: str = Field(..., description="'clear', 'ambiguous', or 'missing'")
    source_msg_ids: List[str] = Field(default_factory=list, description="IDs of messages substantiating clause")
    confidence_note: str = Field(..., description="Explanation of confidence and reasoning")


class AmbiguityGap(BaseModel):
    field: str = Field(..., description="Field name with gap, e.g. GST, delivery start date")
    issue_description: str = Field(..., description="Detailed issue statement")
    legal_risk: str = Field(..., description="Commercial or legal consequence under Indian law")
    suggested_default: str = Field(..., description="Suggested question or default resolving term")


class StampDutyAdvisory(BaseModel):
    state: str = Field(..., description="State jurisdiction (e.g. Karnataka, Maharashtra, Delhi)")
    statute_section: str = Field(..., description="Specific statutory article and amendment citation")
    estimated_duty_inr: int = Field(..., description="Estimated stamp duty in INR")
    is_barred_by_it_act_schedule_1: bool = Field(..., description="True if transaction is excluded under First Schedule of IT Act, 2000")
    compliance_note: str = Field(..., description="Advisory on impounding, validity vs admissibility, and e-stamping")


class BSASection63Certificate(BaseModel):
    certificate_id: str = Field(..., description="Unique certificate identifier")
    generated_at_ist: str = Field(..., description="Timestamp in Indian Standard Time (IST, 24-hour format)")
    part_a_device_declaration: Dict[str, str] = Field(..., description="Part A custodian declarations per Section 63(4)(c) BSA 2023 Schedule")
    part_b_hash_verification: Dict[str, str] = Field(..., description="Part B technical expert hash verification per Section 63(4)(c) BSA 2023 Schedule")


class DealAnalysisResponse(BaseModel):
    deal_id: str
    parsed_messages: List[ChatMessage]
    clauses: Dict[str, ExtractedClause]
    validity_checklist: Dict[str, bool]
    validity_score: int
    novation_detected: bool
    novation_summary: str
    gaps: List[AmbiguityGap]
    whatsapp_clarification_draft: str
    plain_language_summary: str
    stamp_duty: StampDutyAdvisory
    cryptographic_seal: Dict[str, str]
    bsa_section_63_certificate: BSASection63Certificate
    system_limitations: List[str]


class ResolveGapsRequest(BaseModel):
    deal_id: str
    resolved_fields: Dict[str, str]
    counterparty_confirmed: bool = False


class VerifyTamperRequest(BaseModel):
    deal_id: str
    submitted_chat_text: str
    submitted_agreement_text: str


class VerifyTamperResponse(BaseModel):
    is_authentic: bool
    stored_merkle_root: str
    computed_merkle_root: str
    chat_hash_matches: bool
    agreement_hash_matches: bool
    verdict_message: str
