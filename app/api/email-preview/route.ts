import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decorateEmailHtml } from '@/lib/resend';
import type { EmailTemplate } from '@/lib/types';

export const dynamic = 'force-dynamic';

// =====================================================
// GET /api/email-preview?step=1
// =====================================================
// Renderiza en el navegador los emails de la campaña de recordatorio de
// código TAL CUAL los recibe el usuario (con preheader + pie legal), con
// datos de ejemplo y SIN enviar nada. Pensado para revisar en el preview.
//
// Seguridad: disponible en preview/local sin más. En PRODUCCIÓN exige
// ?key=ADMIN_SECRET_KEY para no exponerlo públicamente.

const STEP_KEYS: Record<string, string> = {
  '1': 'code_reminder_1',
  '2': 'code_reminder_2',
  '3': 'code_reminder_3',
};

const SAMPLE: Record<string, string> = {
  '{{name}}': 'María',
  '{{code}}': 'REFUGIO-7K2P9',
  '{{app_url}}':
    process.env.NEXT_PUBLIC_APP_URL || 'https://refugio-en-la-palabra.netlify.app',
  '{{unsubscribe_url}}': '#',
};

function fill(s: string): string {
  return Object.entries(SAMPLE).reduce((acc, [t, v]) => acc.split(t).join(v), s);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // En producción exigimos la clave; en preview/local es libre.
  const isProd = process.env.VERCEL_ENV === 'production';
  const authedByKey = !!process.env.ADMIN_SECRET_KEY && key === process.env.ADMIN_SECRET_KEY;
  if (isProd && !authedByKey) {
    return NextResponse.json(
      { error: 'En producción añade ?key=ADMIN_SECRET_KEY a la URL' },
      { status: 403 }
    );
  }

  const step = STEP_KEYS[searchParams.get('step') || '1'] ? (searchParams.get('step') || '1') : '1';
  const templateKey = STEP_KEYS[step];

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', templateKey)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: `Plantilla "${templateKey}" no encontrada. ¿Ejecutaste code-reminder-schema.sql?` },
      { status: 404 }
    );
  }

  const t = data as EmailTemplate;
  const html = decorateEmailHtml(fill(t.html_content), fill(t.preview_text || ''), '#');

  const keyQuery = key ? `&key=${encodeURIComponent(key)}` : '';
  const nav = ['1', '2', '3']
    .map(
      (s) =>
        `<a href="?step=${s}${keyQuery}" style="color:#E1B955;margin:0 8px;text-decoration:none;${
          s === step ? 'font-weight:bold;text-decoration:underline;' : ''
        }">Recordatorio #${s}</a>`
    )
    .join('');

  const bar = `<div style="background:#1F3A5F;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:12px 16px;text-align:center;">
    ${nav} &nbsp;|&nbsp; <span style="opacity:.8">Asunto:</span> <strong>${fill(t.subject)}</strong>
  </div>`;

  return new NextResponse(bar + html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
