import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// =====================================================
// POST /api/resend/webhook
// =====================================================
// Recibe eventos de Resend. Ante un rebote (email.bounced) o una queja
// de spam (email.complained), da de baja automáticamente a esa dirección
// en ambas campañas (vía RPC suppress_email) para proteger la reputación
// de envío.
//
// Configúralo en Resend → Webhooks, apuntando a esta URL, y guarda el
// "Signing Secret" en la env var RESEND_WEBHOOK_SECRET (formato whsec_...).

function verifySvixSignature(payload: string, headers: Headers, secret: string): boolean {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signature = headers.get('svix-signature');
  if (!id || !timestamp || !signature) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signedContent = `${id}.${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Header: "v1,<sig> v1,<sig2> ..."
  const provided = signature
    .split(' ')
    .map((part) => part.split(',')[1])
    .filter(Boolean);

  const expectedBuf = Buffer.from(expected);
  return provided.some((sig) => {
    const sigBuf = Buffer.from(sig);
    return (
      sigBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(sigBuf, expectedBuf)
    );
  });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  // Si hay secret configurado, exigimos firma válida. (Configúralo en prod.)
  if (secret && !verifySvixSignature(raw, request.headers, secret)) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
  }

  let event: { type?: string; data?: { to?: string[] | string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const type = event.type || '';

  if (type === 'email.bounced' || type === 'email.complained') {
    const toField = event.data?.to;
    const recipients = Array.isArray(toField) ? toField : toField ? [toField] : [];
    for (const email of recipients) {
      try {
        // @ts-ignore - RPC types not generated para suppress_email
        await supabase.rpc('suppress_email', { p_email: email });
        console.log(`[ResendWebhook] ${type} → baja automática de ${email}`);
      } catch (err) {
        console.error(`[ResendWebhook] No se pudo suprimir ${email}:`, err);
      }
    }
  }

  // Siempre 200 para que Resend no reintente eventos que no nos interesan.
  return NextResponse.json({ ok: true });
}
