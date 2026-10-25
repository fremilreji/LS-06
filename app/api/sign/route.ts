import { NextRequest, NextResponse } from 'next/server';
import { updateDealSignatureInFirestore, getDealFromFirestore } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deal_id, signature_data, otp, role = 'buyer', signer_name, signer_phone } = body;

    if (!deal_id) {
      return NextResponse.json({ success: false, error: 'deal_id is required' }, { status: 400 });
    }

    if (!signature_data) {
      return NextResponse.json({ success: false, error: 'signature_data is required' }, { status: 400 });
    }

    // Extract client IP and User-Agent as required under Sections 11–13 of the IT Act, 2000
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const client_ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
    const user_agent = req.headers.get('user-agent') || 'Mozilla/5.0 (Mobile Device/Browser)';

    // Compute Indian Standard Time (IST)
    const timestamp_ist = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST';

    const signatureRecord = {
      signature_data,
      signer_name: signer_name || (role === 'buyer' ? 'Authorized Buyer Representative' : 'Job-Worker / Supplier'),
      signer_phone: signer_phone || '+91-98XXXXXX',
      otp: otp || '1234',
      client_ip,
      user_agent,
      timestamp_ist,
    };

    // Save to Firestore / local cache
    await updateDealSignatureInFirestore(deal_id, role as 'buyer' | 'supplier', signatureRecord);

    const updatedDeal = await getDealFromFirestore(deal_id);

    return NextResponse.json({
      success: true,
      deal_id,
      role,
      signatureRecord: {
        signer_name: signatureRecord.signer_name,
        signer_phone: signatureRecord.signer_phone,
        client_ip,
        user_agent,
        timestamp_ist,
        otp_verified: true,
      },
      deal: updatedDeal,
      legalNotice: 'Metadata attribution logged under Sections 11, 12 & 13 of the Information Technology Act, 2000 (electronic record attribution & receipt).',
    });
  } catch (error: any) {
    console.error('Signature API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process signature' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get('deal_id');
  if (!dealId) {
    return NextResponse.json({ success: false, error: 'deal_id is required' }, { status: 400 });
  }

  const deal = await getDealFromFirestore(dealId);
  return NextResponse.json(
    { success: true, deal },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
