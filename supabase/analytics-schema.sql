-- =====================================================
-- ANALÍTICA PROPIA DE LA LANDING (site_events)
-- Ejecutar una vez en el SQL Editor de Supabase (idempotente)
-- =====================================================
--
-- Qué guarda: una fila por página vista o evento (clic en "Instalar",
-- clic a Instagram, feedback enviado...) que registra POST /api/track.
--
-- Privacidad (sin cookies, sin banner):
--   - NO se guarda la IP ni el user-agent completo. El visitante se identifica
--     con un hash SHA-256 de (sal-del-día + IP + user-agent) recortado a 16
--     caracteres. La sal cambia cada día, así que el mismo visitante no es
--     enlazable de un día para otro (mismo enfoque que Plausible/Fathom).
--   - País/región/ciudad vienen de las cabeceras de geolocalización de Vercel
--     (x-vercel-ip-country...), no de un servicio externo.
--
-- Acceso:
--   - La anon key SOLO puede insertar (política de INSERT). No hay política
--     de SELECT: nadie lee la tabla con la anon key.
--   - El panel /admin/analytics lee vía la RPC site_analytics(), concedida
--     únicamente a service_role (requiere SUPABASE_SERVICE_ROLE_KEY en Vercel).
-- =====================================================

-- -----------------------------------------------------
-- 1. Tabla
-- -----------------------------------------------------
create table if not exists public.site_events (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  kind          text not null check (kind in ('pageview', 'event')),
  name          text not null,            -- 'pageview' o nombre del evento (install_click, cta_click...)
  path          text not null,            -- ruta de la landing (/, /descargar, /actualidad...)
  is_entry      boolean not null default false, -- primera página vista de la sesión (a dónde llegan)
  referrer_host text,                     -- dominio de origen (google.com, instagram.com...) solo en la entrada
  referrer      text,                     -- URL de origen completa (recortada) solo en la entrada
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  country       text,                     -- ISO-3166 alpha-2 (ES, MX...)
  region        text,
  city          text,
  device        text,                     -- mobile | tablet | desktop
  os            text,                     -- iOS | Android | Windows | macOS | Linux | Otro
  browser       text,                     -- Chrome | Safari | Firefox | Edge | Samsung | Otro
  visitor_hash  text not null,            -- 16 hex, rota cada día
  props         jsonb                     -- datos extra del evento (p. ej. {"where":"hero"})
);

create index if not exists idx_site_events_created_at
  on public.site_events (created_at desc);
create index if not exists idx_site_events_visitor
  on public.site_events (visitor_hash, created_at);
create index if not exists idx_site_events_kind_name
  on public.site_events (kind, name, created_at);

comment on table public.site_events is
  'Analítica propia de la landing: páginas vistas y eventos, sin datos personales (visitor_hash rota a diario).';

-- -----------------------------------------------------
-- 2. RLS: la anon key solo inserta
-- -----------------------------------------------------
alter table public.site_events enable row level security;

drop policy if exists site_events_anon_insert on public.site_events;
create policy site_events_anon_insert
  on public.site_events
  for insert
  to anon
  with check (
    length(path) <= 300
    and length(name) <= 64
    and length(visitor_hash) = 16
    and (props is null or pg_column_size(props) <= 2000)
  );

-- (Sin política de SELECT/UPDATE/DELETE a propósito.)

-- -----------------------------------------------------
-- 2b. Atribución web → app (columna en profiles)
-- -----------------------------------------------------
-- La app guarda aquí el origen con el que llegó el usuario desde la landing
-- (ver refugio-rosario-letanias/supabase/migrations/032_signup_attribution.sql,
-- misma sentencia). Idempotente: da igual cuál de los dos scripts se ejecute
-- primero.
alter table public.profiles
  add column if not exists signup_attribution jsonb;

-- -----------------------------------------------------
-- 3. RPC: site_analytics(p_days, p_recent)
-- -----------------------------------------------------
-- Devuelve en un solo JSON todo lo que pinta el panel para los últimos
-- p_days días (día natural en Europe/Madrid), más el periodo anterior de la
-- misma longitud para calcular variaciones, y los últimos p_recent eventos.
--
-- Solo service_role puede ejecutarla.

create or replace function public.site_analytics(
  p_days   integer default 30,
  p_recent integer default 40
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz           constant text := 'Europe/Madrid';
  v_days         integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_recent       integer := greatest(1, least(coalesce(p_recent, 40), 200));
  v_today        date := (now() at time zone v_tz)::date;
  v_from         date := v_today - (v_days - 1);
  v_from_ts      timestamptz := (v_from::timestamp) at time zone v_tz;
  v_prev_from_ts timestamptz := ((v_from - v_days)::timestamp) at time zone v_tz;
  v_result       json;
begin
  select json_build_object(
    'range', json_build_object(
      'days', v_days, 'from', v_from, 'to', v_today, 'tz', v_tz,
      'generated_at', now()
    ),

    -- Totales del periodo actual
    'totals', (
      select json_build_object(
        'visitors',  count(distinct visitor_hash) filter (where kind = 'pageview'),
        'pageviews', count(*) filter (where kind = 'pageview'),
        'entries',   count(*) filter (where is_entry),
        'installs',  count(*) filter (where kind = 'event' and name = 'install_click'),
        'events',    count(*) filter (where kind = 'event')
      )
      from public.site_events
      where created_at >= v_from_ts
    ),

    -- Totales del periodo anterior (misma longitud) para las variaciones
    'prev', (
      select json_build_object(
        'visitors',  count(distinct visitor_hash) filter (where kind = 'pageview'),
        'pageviews', count(*) filter (where kind = 'pageview'),
        'entries',   count(*) filter (where is_entry),
        'installs',  count(*) filter (where kind = 'event' and name = 'install_click'),
        'events',    count(*) filter (where kind = 'event')
      )
      from public.site_events
      where created_at >= v_prev_from_ts and created_at < v_from_ts
    ),

    -- Serie diaria continua (días sin datos salen a 0)
    'by_day', (
      select coalesce(json_agg(json_build_object(
        'date',      to_char(d.day, 'YYYY-MM-DD'),
        'visitors',  coalesce(s.visitors, 0),
        'pageviews', coalesce(s.pageviews, 0),
        'installs',  coalesce(s.installs, 0)
      ) order by d.day), '[]'::json)
      from generate_series(v_from, v_today, interval '1 day') as d(day)
      left join (
        select (created_at at time zone v_tz)::date as day,
               count(distinct visitor_hash) filter (where kind = 'pageview') as visitors,
               count(*) filter (where kind = 'pageview') as pageviews,
               count(*) filter (where kind = 'event' and name = 'install_click') as installs
        from public.site_events
        where created_at >= v_from_ts
        group by 1
      ) s on s.day = d.day::date
    ),

    -- De dónde vienen (dominio de origen de la primera página de la sesión)
    'referrers', (
      select coalesce(json_agg(r), '[]'::json) from (
        select coalesce(referrer_host, '(directo)') as name,
               count(distinct visitor_hash) as visitors,
               count(*) as entries
        from public.site_events
        where created_at >= v_from_ts and is_entry
        group by 1
        order by 2 desc, 3 desc
        limit 12
      ) r
    ),

    -- Campañas (utm)
    'utm', (
      select coalesce(json_agg(u), '[]'::json) from (
        select utm_source as source, utm_medium as medium, utm_campaign as campaign,
               count(distinct visitor_hash) as visitors,
               count(*) as entries
        from public.site_events
        where created_at >= v_from_ts and is_entry and utm_source is not null
        group by 1, 2, 3
        order by 4 desc
        limit 12
      ) u
    ),

    -- A dónde llegan (página de entrada)
    'landing', (
      select coalesce(json_agg(l), '[]'::json) from (
        select path, count(distinct visitor_hash) as visitors, count(*) as entries
        from public.site_events
        where created_at >= v_from_ts and is_entry
        group by 1
        order by 2 desc, 3 desc
        limit 12
      ) l
    ),

    -- Páginas más vistas
    'pages', (
      select coalesce(json_agg(p), '[]'::json) from (
        select path, count(*) as pageviews, count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts and kind = 'pageview'
        group by 1
        order by 2 desc
        limit 15
      ) p
    ),

    -- Países / ciudades
    'countries', (
      select coalesce(json_agg(c), '[]'::json) from (
        select coalesce(country, '??') as country, count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts and kind = 'pageview'
        group by 1
        order by 2 desc
        limit 12
      ) c
    ),
    'cities', (
      select coalesce(json_agg(c), '[]'::json) from (
        select city, country, count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts and kind = 'pageview' and city is not null
        group by 1, 2
        order by 3 desc
        limit 12
      ) c
    ),

    -- Dispositivos
    'devices', (
      select coalesce(json_agg(x), '[]'::json) from (
        select coalesce(device, 'otro') as name, count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts and kind = 'pageview'
        group by 1 order by 2 desc
      ) x
    ),
    'os', (
      select coalesce(json_agg(x), '[]'::json) from (
        select coalesce(os, 'Otro') as name, count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts and kind = 'pageview'
        group by 1 order by 2 desc limit 8
      ) x
    ),
    'browsers', (
      select coalesce(json_agg(x), '[]'::json) from (
        select coalesce(browser, 'Otro') as name, count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts and kind = 'pageview'
        group by 1 order by 2 desc limit 8
      ) x
    ),

    -- Qué hacen (eventos)
    'events', (
      select coalesce(json_agg(e), '[]'::json) from (
        select name, count(*) as count, count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts and kind = 'event'
        group by 1
        order by 2 desc
        limit 20
      ) e
    ),

    -- Web → app: cuentas creadas en el periodo y cuántas traen origen web.
    -- created_at sale de auth.users (fuente fiable); la atribución, de
    -- profiles.signup_attribution (la escribe la app al registrarse).
    'signups', (
      select json_build_object(
        'total',    count(*),
        'from_web', count(*) filter (where p.signup_attribution->>'src' = 'web'),
        'prev_total', (
          select count(*) from public.profiles p0
          join auth.users u0 on u0.id = p0.id
          where u0.created_at >= v_prev_from_ts and u0.created_at < v_from_ts
        ),
        'prev_from_web', (
          select count(*) from public.profiles p0
          join auth.users u0 on u0.id = p0.id
          where u0.created_at >= v_prev_from_ts and u0.created_at < v_from_ts
            and p0.signup_attribution->>'src' = 'web'
        ),
        'by_source', (
          select coalesce(json_agg(x), '[]'::json) from (
            select coalesce(
                     p2.signup_attribution->>'utm_source',
                     p2.signup_attribution->>'web_ref',
                     '(directo)'
                   ) as name,
                   count(*) as signups
            from public.profiles p2
            join auth.users u2 on u2.id = p2.id
            where u2.created_at >= v_from_ts
              and p2.signup_attribution->>'src' = 'web'
            group by 1
            order by 2 desc
            limit 12
          ) x
        ),
        'by_where', (
          select coalesce(json_agg(x), '[]'::json) from (
            select coalesce(p3.signup_attribution->>'web_where', '?') as name,
                   count(*) as signups
            from public.profiles p3
            join auth.users u3 on u3.id = p3.id
            where u3.created_at >= v_from_ts
              and p3.signup_attribution->>'src' = 'web'
            group by 1
            order by 2 desc
          ) x
        ),
        'by_landing', (
          select coalesce(json_agg(x), '[]'::json) from (
            select coalesce(p4.signup_attribution->>'web_landing', '?') as name,
                   count(*) as signups
            from public.profiles p4
            join auth.users u4 on u4.id = p4.id
            where u4.created_at >= v_from_ts
              and p4.signup_attribution->>'src' = 'web'
            group by 1
            order by 2 desc
            limit 8
          ) x
        )
      )
      from public.profiles p
      join auth.users u on u.id = p.id
      where u.created_at >= v_from_ts
    ),

    -- Últimos eventos (feed en vivo)
    'recent', (
      select coalesce(json_agg(e order by e.created_at desc), '[]'::json) from (
        select id, created_at, kind, name, path, is_entry, referrer_host, utm_source,
               country, city, device, os, browser, visitor_hash, props
        from public.site_events
        order by created_at desc
        limit v_recent
      ) e
    )
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.site_analytics(integer, integer) from public;
revoke all on function public.site_analytics(integer, integer) from anon;
revoke all on function public.site_analytics(integer, integer) from authenticated;
grant execute on function public.site_analytics(integer, integer) to service_role;

-- -----------------------------------------------------
-- 4. Limpieza (opcional, manual)
-- -----------------------------------------------------
-- La tabla crece ~1 fila por página vista. Para quedarte con 13 meses:
--   delete from public.site_events where created_at < now() - interval '13 months';
