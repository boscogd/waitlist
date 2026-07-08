import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/api-auth';
import { getServiceClient } from '@/lib/supabase-admin';

// =====================================================
// GET /api/admin/audience — conteo de segmentos
// =====================================================
// Devuelve el tamaño de cada segmento de la app para el centro de correos:
//   all     → todos los usuarios de auth.users
//   active  → con login en los últimos 14 días
//   dormant → sin login desde hace 14+ días (o que nunca han entrado)
// EXCLUYE de TODOS los conteos a quien tenga profiles.winback_unsubscribed=true.

export const dynamic = 'force-dynamic';

// Ventana (en días) que separa "activo" de "dormido".
const ACTIVE_WINDOW_DAYS = 14;

type MinimalUser = {
  id: string;
  email?: string;
  last_sign_in_at?: string | null;
};

// Recorre auth.admin.listUsers paginando hasta agotar (perPage 1000).
async function listAllUsers(
  client: ReturnType<typeof getServiceClient>
): Promise<MinimalUser[]> {
  const all: MinimalUser[] = [];
  let page = 1;
  const perPage = 1000;

  // Paginamos hasta que una página devuelva menos de perPage usuarios.
  for (;;) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Error listando usuarios: ${error.message}`);

    const users = (data?.users || []) as MinimalUser[];
    all.push(...users);

    if (users.length < perPage) break;
    page++;
  }

  return all;
}

// Devuelve el set de ids de perfiles dados de baja del win-back.
async function loadUnsubscribedIds(
  client: ReturnType<typeof getServiceClient>
): Promise<Set<string>> {
  // La tabla `profiles` no está en los tipos generados: acceso laxo controlado.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from('profiles')
    .select('id')
    .eq('winback_unsubscribed', true);

  if (error) throw new Error(`Error leyendo bajas: ${error.message}`);
  return new Set(((data || []) as Array<{ id: string }>).map((r) => r.id));
}

export async function GET(request: Request) {
  // Autenticación admin (cookie httpOnly `admin-session` o Bearer legado).
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const client = getServiceClient();
    const [users, unsubscribed] = await Promise.all([
      listAllUsers(client),
      loadUnsubscribedIds(client),
    ]);

    const cutoff = Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    let all = 0;
    let active = 0;
    let dormant = 0;

    for (const u of users) {
      // Excluimos de todos los conteos a los dados de baja del win-back.
      if (unsubscribed.has(u.id)) continue;
      all++;

      const last = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : null;
      // active = login dentro de la ventana; dormant = fuera de ella o nunca.
      if (last !== null && last >= cutoff) {
        active++;
      } else {
        dormant++;
      }
    }

    return NextResponse.json({
      success: true,
      segments: [
        { id: 'all', label: 'Todos los usuarios', count: all },
        { id: 'active', label: 'Activos (últimos 14 días)', count: active },
        { id: 'dormant', label: 'Dormidos (14+ días)', count: dormant },
      ],
    });
  } catch (error) {
    // El caso "SUPABASE_SERVICE_ROLE_KEY no configurada" (y cualquier otro
    // fallo de configuración) se devuelve como 400 con mensaje claro para que
    // el frontend lo muestre en vez de un 500 opaco.
    const message = error instanceof Error ? error.message : 'Error obteniendo audiencia';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
