import { NextResponse } from 'next/server';
import { generateRoast } from '../../../lib/ai';
import { escapeHtml, sendEmail } from '../../../lib/email';
import { fetchLandingPageText } from '../../../lib/page-fetch';
import { hasUsedTx, markTxUsed } from '../../../lib/store';
import { verifyUsdtTrc20Payment } from '../../../lib/tron';

const RECEIVER_WALLET = 'TBBR3P7L6F9Ta8miznGpEnF9emX9xqDLLr';
const OWNER_EMAIL = 'grizzzlydagod@gmail.com';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());
    const email = String(body.email || '').trim();
    const landingPageUrl = String(body.landingPageUrl || '').trim();
    const txHash = String(body.txHash || '').trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ ok: false, error: 'Valid email is required.' }, { status: 400 });
    if (!landingPageUrl) return NextResponse.json({ ok: false, error: 'Landing page URL is required.' }, { status: 400 });
    if (!txHash) return NextResponse.json({ ok: false, error: 'USDT TRC20 transaction hash is required.' }, { status: 400 });

    if (await hasUsedTx(txHash)) {
      return NextResponse.json({ ok: false, error: 'This transaction hash was already used.' }, { status: 409 });
    }

    const payment = await verifyUsdtTrc20Payment(txHash, RECEIVER_WALLET);
    if (!payment.valid) {
      return NextResponse.json({ ok: false, error: payment.reason || 'Payment could not be verified.' }, { status: 402 });
    }

    const pageText = await fetchLandingPageText(landingPageUrl);
    if (!pageText || pageText.length < 40) {
      return NextResponse.json({ ok: false, error: 'Could not read enough text from that landing page.' }, { status: 400 });
    }

    const roast = await generateRoast(landingPageUrl, pageText);
    await markTxUsed(txHash);

    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Your $1 Roast</h2><p>${escapeHtml(roast)}</p><hr><p><strong>Page:</strong> ${escapeHtml(landingPageUrl)}</p><p><strong>TX:</strong> ${escapeHtml(txHash)}</p></div>`;
    await sendEmail({ to: email, subject: 'Your $1 Roast is ready', html });
    await sendEmail({ to: OWNER_EMAIL, subject: `New Roasties order: ${email}`, html });

    return NextResponse.json({ ok: true, roast });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Something went wrong.' }, { status: 500 });
  }
}
