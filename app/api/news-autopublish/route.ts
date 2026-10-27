import { NextResponse } from 'next/server';
import { verifyCampaignAuth } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';
import {
  EDITION_ADMIN_COLUMNS,
  MISSING_DRAFTS_SCHEMA,
  type EditionRow,
  isMissingSchema,
  publishEdition,
} from '@/lib/news/editions-admin';

// =====================================================
// ACTUALIDAD — publicación automática de borradores vencidos
// =====================================================
// Cron diario de Vercel (vercel.json). Publica los borradores cuyo
// auto_publish_at ya pasó: si Aida no revisó la edición en 48 h, sale sola.
// Un borrador en pausa (auto_publish_at NULL) nunca se publica solo.
//
// Auth: Bearer CRON_SECRET (Vercel) o sesión de admin.

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const auth = await verifyCampaignAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  let admin;
  try {
    admin = getServiceClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sin cliente admin' },
      { status: 500 }
    );
  }

  const { data, error } = await admin
    .from('news_editions')
    .select(EDITION_ADMIN_COLUMNS)
    .eq('is_draft', true)
    .not('auto_publish_at', 'is', null)
    .lte('auto_publish_at', new Date().toISOString())
    .order('edition_date', { ascending: true });
  if (error) {
    return NextResponse.json(
      { error: isMissingSchema(error) ? MISSING_DRAFTS_SCHEMA : error.message },
      { status: 500 }
    );
  }

  const results: { edition_date: string; published?: number; skipped?: string; error?: string }[] = [];
  for (const edition of (data as EditionRow[]) || []) {
    try {
      // onlyIfDue: si Aida la pausó o descartó mientras tanto, no se publica.
      const published = await publishEdition(admin, edition, { onlyIfDue: true });
      results.push(
        published === null
          ? { edition_date: edition.edition_date, skipped: 'cambió de estado durante la ejecución' }
          : { edition_date: edition.edition_date, published }
      );
    } catch (err) {
      results.push({
        edition_date: edition.edition_date,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ ok: true, checked: results.length, results });
}
