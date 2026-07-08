import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// =====================================================
// CLIENTE SUPABASE SERVICE-ROLE (solo servidor)
// =====================================================
// Devuelve un cliente Supabase con la SERVICE_ROLE key. Esta clave se salta
// RLS de forma controlada y vive ÚNICAMENTE en el servidor (nunca es
// NEXT_PUBLIC_, nunca llega al navegador). Se usa para leer auth.users
// (auth.admin.listUsers), la tabla `profiles` y para escrituras privilegiadas.
//
// Mismo patrón que `getAdminClient` en app/api/news-refresh/route.ts. Si falta
// la key lanza un error claro que las rutas convierten en un 400 legible para
// que el frontend lo muestre en vez de un 500 opaco.
export function getServiceClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}
