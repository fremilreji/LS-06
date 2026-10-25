import { NextRequest, NextResponse } from 'next/server';
import { saveDealToFirestore, getDealFromFirestore } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const dealData = await req.json();
    const deal_id = await saveDealToFirestore(dealData);
    
    // Resolve host / Vercel domain
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${proto}://${host}`;
    const dynamicDealUrl = `${baseUrl}/deal/${deal_id}`;
    const whatsappText = `Sir, please review and sign the order slip here: ${dynamicDealUrl}`;
    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

    return NextResponse.json({
      success: true,
      deal_id,
      dealUrl: dynamicDealUrl,
      whatsappHref,
      whatsappText,
    });
  } catch (error: any) {
    console.error('Deal save API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save deal' },
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
  if (!deal) {
    return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
  }

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
