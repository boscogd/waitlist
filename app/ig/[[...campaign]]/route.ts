import { NextResponse } from 'next/server';

// =====================================================
// GET /ig y /ig/<campaña> — enlace de Instagram con origen
// =====================================================
// Es el enlace que va en la bio (refugioenlapalabra.com/ig) y en stories o
// publicaciones (/ig/story, /ig/reel-rosario...). Redirige a la home con
// utm_source=instagram para que la analítica (lib/track.ts) marque la visita
// y el origen viaje hasta la app al pulsar «Abrir la app» (buildAppUrl).
//
// No dependemos del referrer: el navegador interno de Instagram a veces lo
// manda (l.instagram.com) y a veces no.

export const dynamic = 'force-dynamic';

const CAMPAIGN_RE = /^[a-z0-9_-]{1,40}$/;

export async function GET(request: Request, { params }: { params: Promise<{ campaign?: string[] }> }) {
  const { campaign } = await params;
  const slug = (campaign?.[0] || '').toLowerCase();

  const target = new URL('/', request.url);
  target.searchParams.set('utm_source', 'instagram');
  target.searchParams.set('utm_medium', 'social');
  target.searchParams.set('utm_campaign', CAMPAIGN_RE.test(slug) ? slug : 'bio');

  // 307 y sin caché: cada clic tiene que llegar a la home con sus utm.
  const res = NextResponse.redirect(target, 307);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
