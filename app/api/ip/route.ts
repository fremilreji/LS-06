import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  let ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || '');

  // If localhost or empty, try fetching public IP or use a sensible dynamic IP
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        if (data.ip) ip = data.ip;
      }
    } catch {
      ip = '106.51.22.84'; // fallback only if completely offline
    }
  }

  const userAgent = req.headers.get('user-agent') || 'Browser Client';
  const istTimestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' IST';

  return NextResponse.json({
    ip,
    userAgent,
    timestamp: istTimestamp,
  });
}
