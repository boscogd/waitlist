-- =====================================================
-- RETO DE ADVIENTO 2026 — inscripciones desde la web
-- =====================================================
-- Ejecutar UNA vez en el SQL Editor de Supabase (la misma base de datos que
-- usa la app) ANTES de publicar la página /adviento.
--
-- ACUERDO CON LA APP (lo que cada parte hace):
--   * La web (este repo) anuncia el reto en /adviento y guarda aquí quién se
--     apunta: correo, nombre y fecha. Nada más.
--   * La app es la que sabe qué días rezó cada persona el Evangelio del día.
--     Un día cuenta si la cuenta lo rezó entre el 2026-11-29 y el 2026-12-24
--     (ambos incluidos), con el día calculado en hora de Madrid.
--   * El regalo: 3 meses de Premium a quien esté apuntado aquí Y haya rezado
--     al menos 23 de los 26 días. Se cruza por correo:
--         lower(advent_signups.email) = lower(auth.users.email)
--     Quien se apunte con un correo distinto al de su cuenta no aparecerá en
--     el cruce (la página lo advierte).
--   * El Premium se concede a mano la semana del 28-dic, con fecha de
--     caducidad a 3 meses, sin pasar por Google Play ni Stripe y sin
--     renovación. Al concederlo se rellena premium_granted_at.
--   * Quien ya paga Premium también lo recibe (decisión de Bosco, 12-nov):
--     al de pago mensual no se le cobra durante 3 meses; al del plan anual
--     se le retrasa la renovación 3 meses. Es decir, en los dos casos se
--     mueve 3 meses la próxima fecha de cobro. Si en algún medio de pago no
--     se puede (por confirmar en Stripe y en Google Play), se le da un
--     código de 3 meses para canjear cuando cancele.
--   * Las reglas (fechas, mínimo, meses) están en lib/content/adviento.ts.

create table if not exists public.advent_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  source text,
  created_at timestamptz not null default now(),
  premium_granted_at timestamptz,
  constraint advent_signups_email_lower check (email = lower(email)),
  constraint advent_signups_email_len check (char_length(email) between 5 and 254),
  constraint advent_signups_name_len check (char_length(name) between 2 and 100),
  constraint advent_signups_source_len check (source is null or char_length(source) <= 40)
);

create unique index if not exists advent_signups_email_key on public.advent_signups (email);

alter table public.advent_signups enable row level security;

-- Nadie entra directamente: sin políticas y sin permisos para anon ni
-- authenticated. Las inscripciones las guarda /api/adviento con la clave de
-- servicio (solo servidor), que es donde se aplican el límite de intentos,
-- el campo trampa y el cierre del 24-dic. Así tampoco se puede averiguar
-- desde fuera si un correo está apuntado.
drop policy if exists "advent_signups_insert_publico" on public.advent_signups;
revoke all on public.advent_signups from anon, authenticated;

comment on table public.advent_signups is 'Inscripciones al reto de Adviento 2026 hechas desde la web (/adviento).';
