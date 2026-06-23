import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Soporta GET (link en email) y POST (List-Unsubscribe One-Click RFC 8058)
async function handle(id: string | null) {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  // @ts-ignore - RPC types not generated for code-reminder functions
  const { data, error } = await supabase.rpc('unsubscribe_code_reminder', {
    p_id: id,
  });
  if (error) {
    return NextResponse.json({ error: 'No se pudo procesar' }, { status: 500 });
  }
  return { ok: data === true };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('u');
  const r = await handle(id);
  if ('error' in (r as object) === false && (r as { ok: boolean }).ok !== undefined) {
    const ok = (r as { ok: boolean }).ok;
    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Baja confirmada</title>
<style>
body{font-family:Georgia,serif;background:#FAF7F0;color:#2D2A26;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}
.card{max-width:480px;background:white;border-radius:12px;padding:48px 40px;box-shadow:0 2px 15px rgba(0,0,0,0.05);text-align:center}
h1{color:#1F3A5F;font-size:24px;margin:0 0 16px}
p{font-size:16px;line-height:1.7;color:#5D574F;margin:0 0 12px}
.tag{font-size:12px;letter-spacing:3px;color:#8B7355;text-transform:uppercase;margin-bottom:30px;display:block}
</style></head>
<body><div class="card">
<span class="tag">Refugio en la Palabra</span>
<h1>${ok ? 'Hecho.' : 'Algo no encajó'}</h1>
<p>${
  ok
    ? 'No volverás a recibir los recordatorios de tu código de descuento.'
    : 'No hemos podido localizar tu suscripción. Si esto sigue, escríbenos.'
}</p>
${ok ? '<p style="margin-top:24px;color:#A09A92;font-size:14px;">Tu código sigue siendo válido cuando quieras usarlo.</p>' : ''}
</div></body></html>`;
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return r as NextResponse;
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('u');
  const r = await handle(id);
  if ('error' in (r as object) === false) {
    return NextResponse.json({ success: true });
  }
  return r as NextResponse;
}
