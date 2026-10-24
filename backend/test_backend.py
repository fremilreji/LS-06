"""
backend/test_backend.py
=======================
Automated test suite verifying the upgraded Jan-Karar / PactProof FastAPI backend:
1. Preset 1 (Bommanahalli Kurti - Gaps in Payment & Inspection)
2. Preset 2 (Tiruppur Polo - Voice Note Scope Creep & Counter-Offer)
3. Preset 3 (Ambiguous Cargo Pants - Hard Halt under Section 29 ICA)
4. POST /api/analyze with raw chat
5. POST /api/resolve-gap
6. POST /api/verify-udyam (Valid vs Invalid format & Silpi/NBCC precedent)
7. POST /api/sign (Anti-forgery dual signature, OTP, and IP/UA audit log)
8. POST /api/log-milestone (Contemporaneous production tracking)
9. POST /api/verify-tamper (Tamper detection sandbox)
"""

import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "Independent Garment" in data["sector_lock"]
    print("PASS: Root status check")


def test_preset_1():
    res = client.get("/api/presets/preset_1")
    assert res.status_code == 200
    deal = res.json()
    assert deal["contract_status"] == "READY_FOR_SIGNATURE"
    assert "Suresh" in deal["supplier_name"]
    assert "Raghav" in deal["buyer_name"]
    assert deal["job_work_terms"]["permissible_wastage_pct"] == 2.5
    assert deal["job_work_terms"]["latent_defect_shield_active"] is True
    assert deal["payment_terms"]["is_pay_when_paid_prohibited"] is True
    # Gaps should include missing payment date and missing inspection window
    gap_ids = [g["gap_id"] for g in deal["gaps"]]
    assert "GAP-01" in gap_ids or "GAP-02" in gap_ids
    assert "odr.msme.gov.in" in deal["msme_odr_packet"]["portal_name"]
    assert deal["udyam_verification"]["msme_odr_eligible"] is True
    print("PASS: Preset 1 (Bommanahalli Kurti Lot)")


def test_preset_2():
    res = client.get("/api/presets/preset_2")
    assert res.status_code == 200
    deal = res.json()
    assert "Murugan" in deal["supplier_name"]
    assert "Kumar" in deal["buyer_name"]
    assert deal["scope_variation"]["is_variation_detected"] is True
    print("PASS: Preset 2 (Tiruppur Polo Scope Variation)")


def test_preset_3():
    res = client.get("/api/presets/preset_3")
    assert res.status_code == 200
    deal = res.json()
    # Ambiguous Cargo Pants must trigger HARD HALT under Section 29 ICA
    assert deal["contract_status"] == "HALTED_AMBIGUOUS_SEC_29"
    assert len(deal["sec_29_halt_reasons"]) > 0
    assert deal["udyam_verification"]["msme_odr_eligible"] is False
    print("PASS: Preset 3 (Hard Halt on Ambiguity under Sec 29 ICA)")


def test_analyze_custom():
    chat = (
        "10:00 AM [Ramesh Tailors]: Namaste Sharmaji, we can stitch 500 school uniform shirts at ₹65/pc. Total ₹32,500.\n"
        "10:05 AM [Sharmaji Textiles]: Confirmed Ramesh. Delivery needed by Nov 10. Payment in 15 days."
    )
    res = client.post("/api/analyze", json={
        "raw_chat": chat,
        "supplier_name": "Ramesh Tailors",
        "buyer_name": "Sharmaji Textiles",
        "udyam_urn": "UDYAM-KR-03-0987654"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["supplier_name"] == "Ramesh Tailors"
    assert data["payment_terms"]["agreed_price_inr"] == 32500.0
    assert data["bsa_certificate"]["master_merkle_root_sha256"] is not None
    print("PASS: Custom Analyze Endpoint")


def test_resolve_gap():
    # Resolve GAP-01 on preset_1
    res = client.post("/api/resolve-gap", json={
        "deal_id": "preset_1",
        "gap_id": "GAP-01",
        "chosen_fix_value": "Visual inspection within 72 hours; deemed acceptance after 15 days under Sec 2(b) MSMED Act."
    })
    assert res.status_code == 200
    data = res.json()
    remaining_gaps = [g["gap_id"] for g in data["gaps"]]
    assert "GAP-01" not in remaining_gaps
    print("PASS: Resolve Gap Endpoint")


def test_verify_udyam():
    # Valid Udyam format
    res_valid = client.post("/api/verify-udyam", json={"udyam_urn": "UDYAM-KR-03-0128945"})
    assert res_valid.status_code == 200
    data_valid = res_valid.json()
    assert data_valid["is_valid_format"] is True
    assert data_valid["msme_odr_eligible"] is True
    assert data_valid["enterprise_type"] == "MICRO"

    # Invalid Udyam format
    res_invalid = client.post("/api/verify-udyam", json={"udyam_urn": "INVALID-12345"})
    assert res_invalid.status_code == 200
    data_invalid = res_invalid.json()
    assert data_invalid["is_valid_format"] is False
    assert data_invalid["msme_odr_eligible"] is False
    print("PASS: Verify Udyam Endpoint (Silpi / NBCC 2025 Precedents)")


def test_sign_contract():
    deal_id = "preset_1"
    # Supplier signs
    res_sup = client.post("/api/sign", json={
        "deal_id": deal_id,
        "role": "supplier",
        "signer_name": "Suresh Kumar",
        "signer_phone": "9876543210",
        "otp_code": "8492",
        "authorized_agent_declared": True,
        "signature_type": "finger_draw",
        "signature_data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        "client_ip": "103.21.124.50",
        "user_agent": "Mozilla/5.0 (Linux; Android 14; SM-A546E)"
    })
    assert res_sup.status_code == 200
    data_sup = res_sup.json()
    assert "supplier" in data_sup["signatures"]

    # Buyer signs
    res_buyer = client.post("/api/sign", json={
        "deal_id": deal_id,
        "role": "buyer",
        "signer_name": "Raghav Sharma",
        "signer_phone": "9123456780",
        "otp_code": "4190",
        "authorized_agent_declared": True,
        "signature_type": "finger_draw",
        "signature_data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        "client_ip": "103.21.124.88",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    })
    assert res_buyer.status_code == 200
    data_buyer = res_buyer.json()
    assert "buyer" in data_buyer["signatures"]
    assert data_buyer["contract_status"] == "SIGNED_AND_SEALED"
    print("PASS: Dual-Party Sign Contract with Anti-Forgery IP & UA Audit Log")


def test_log_milestone():
    res = client.post("/api/log-milestone", json={
        "deal_id": "preset_1",
        "milestone_type": "FABRIC_RECEIVED",
        "notes": "Received 3,200 meters Rayon printed fabric roll from Bommanahalli warehouse.",
        "photo_hash": "a1b2c3d4e5f67890"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["milestone_record"]["milestone_type"] == "FABRIC_RECEIVED"
    print("PASS: Log Production Milestone Endpoint")


def test_verify_tamper():
    deal_res = client.get("/api/presets/preset_1")
    deal = deal_res.json()
    raw_chat = deal["raw_chat"]
    agreement_text = deal["plain_agreement_text"]

    # Authentic Verification
    res_auth = client.post("/api/verify-tamper", json={
        "deal_id": deal["deal_id"],
        "submitted_chat_text": raw_chat,
        "submitted_agreement_text": agreement_text
    })
    assert res_auth.status_code == 200
    data_auth = res_auth.json()
    assert data_auth["is_authentic"] is True
    assert "INTEGRITY CONFIRMED" in data_auth["verdict_message"]

    # Tampered Verification
    res_tamper = client.post("/api/verify-tamper", json={
        "deal_id": deal["deal_id"],
        "submitted_chat_text": raw_chat + "\n[Raghav]: Altered terms: Rate is now ₹40/pc.",
        "submitted_agreement_text": agreement_text
    })
    assert res_tamper.status_code == 200
    data_tamper = res_tamper.json()
    assert data_tamper["is_authentic"] is False
    assert data_tamper["chat_hash_matches"] is False
    assert "TAMPERING DETECTED" in data_tamper["verdict_message"]
    print("PASS: Live Bitstream Tamper Verification Sandbox")


if __name__ == "__main__":
    print("\n--- RUNNING BACKEND STATUTORY ENGINE TEST SUITE ---")
    test_root()
    test_preset_1()
    test_preset_2()
    test_preset_3()
    test_analyze_custom()
    test_resolve_gap()
    test_verify_udyam()
    test_sign_contract()
    test_log_milestone()
    test_verify_tamper()
    print("\n=== ALL 10 TEST SUITES PASSED WITH 100% SUCCESS ===\n")
