-- =====================================================
-- EMBUDO DE INSTAGRAM (site_funnel)
-- Ejecutar una vez en el SQL Editor de Supabase (idempotente).
-- Requiere antes supabase/analytics-schema.sql.
-- =====================================================
--
-- Etapas, para los últimos p_days días (día natural Europe/Madrid):
--
--   1. visits       Visitantes que entran a la web desde Instagram
--                   (enlace /ig → utm_source=instagram, o referrer *.instagram.com).
--   2. descargar    De ellos, cuántos ven /descargar.
--   3. app_clicks   De ellos, cuántos pulsan «Abrir la app e instalar» (install_click).
--      El cruce 1→2→3 es por visitor_hash, que rota cada día: si alguien
--      entra y pulsa en días distintos, no se une.
--   4. app_opens    Llegadas a la app con origen Instagram. Las manda la propia
--      app (evento app_open a /api/track) la primera vez que se abre en ese
--      navegador. Incluye a quien llega a la app sin pasar por la web.
--      Si se abre dentro del navegador de Instagram y luego en Chrome/Safari,
--      cuenta dos veces (app_opens_inapp dice cuántas fueron internas).
--   5. signups      Cuentas creadas en el periodo con origen Instagram
--      (profiles.signup_attribution, la fuente fiable).
--   6. pwa_users    De esas cuentas, cuántas han usado la app instalada
--      (algún evento en user_events con app_platform = 'pwa').
--   +  pwa_installs Instalaciones detectadas por la app con origen Instagram
--      (evento pwa_install: appinstalled en Android o primer arranque en modo
--      app). En iPhone la app instalada no comparte almacenamiento con Safari,
--      así que ahí el origen se pierde salvo que ya estuviera registrado.
--
-- Solo service_role puede ejecutarla (la usa /api/admin/analytics).
-- =====================================================

create or replace function public.site_funnel(
  p_days   integer default 30,
  p_source text    default 'instagram'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz      constant text := 'Europe/Madrid';
  v_days    integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_source  text := lower(coalesce(nullif(trim(p_source), ''), 'instagram'));
  -- 'instagram' también acepta 'ig' como utm_source
  v_aliases text[] := case when v_source = 'instagram' then array['instagram', 'ig'] else array[v_source] end;
  v_today   date := (now() at time zone v_tz)::date;
  v_from_ts timestamptz := ((v_today - (v_days - 1))::timestamp) at time zone v_tz;
  v_result  json;
begin
  with
  entries as (
    select distinct visitor_hash
    from public.site_events
    where created_at >= v_from_ts
      and is_entry
      and path not like '/app%'
      and (
        lower(utm_source) = any (v_aliases)
        or (utm_source is null and referrer_host like '%' || v_source || '.com')
      )
  ),
  entries_inapp as (
    select distinct e.visitor_hash
    from public.site_events e
    join entries using (visitor_hash)
    where e.created_at >= v_from_ts and e.is_entry and e.browser like '%(interno)'
  ),
  descargar as (
    select distinct e.visitor_hash
    from public.site_events e
    join entries using (visitor_hash)
    where e.created_at >= v_from_ts and e.kind = 'pageview' and e.path = '/descargar'
  ),
  clicks as (
    select distinct e.visitor_hash
    from public.site_events e
    join entries using (visitor_hash)
    where e.created_at >= v_from_ts and e.kind = 'event' and e.name = 'install_click'
  ),
  app_events as (
    select name, visitor_hash, props
    from public.site_events
    where created_at >= v_from_ts
      and kind = 'event'
      and name in ('app_open', 'pwa_install')
      and (
        lower(props->>'s') = any (v_aliases)
        or props->>'ref' like '%' || v_source || '.com'
      )
  ),
  signups as (
    select p.id
    from public.profiles p
    join auth.users u on u.id = p.id
    where u.created_at >= v_from_ts
      and (
        lower(p.signup_attribution->>'utm_source') = any (v_aliases)
        or p.signup_attribution->>'web_ref' like '%' || v_source || '.com'
      )
  ),
  pwa_users as (
    -- user_events tiene columnas distintas según la época (properties/metadata):
    -- to_jsonb evita depender de cuál existe.
    select distinct s.id
    from signups s
    join public.user_events ue on ue.user_id = s.id
    where coalesce(
            to_jsonb(ue) -> 'properties' ->> 'app_platform',
            to_jsonb(ue) -> 'metadata' ->> 'app_platform'
          ) = 'pwa'
  )
  select json_build_object(
    'source',          v_source,
    'days',            v_days,
    'visits',          (select count(*) from entries),
    'visits_inapp',    (select count(*) from entries_inapp),
    'descargar',       (select count(*) from descargar),
    'app_clicks',      (select count(*) from clicks),
    'app_opens',       (select count(distinct visitor_hash) from app_events where name = 'app_open'),
    'app_opens_inapp', (select count(distinct visitor_hash) from app_events where name = 'app_open' and props->>'inapp' = 'true'),
    'signups',         (select count(*) from signups),
    'pwa_users',       (select count(*) from pwa_users),
    'pwa_installs',    (select count(distinct visitor_hash) from app_events where name = 'pwa_install'),
    'campaigns', (
      select coalesce(json_agg(c), '[]'::json) from (
        select coalesce(utm_campaign, '(sin campaña)') as name,
               count(distinct visitor_hash) as visitors
        from public.site_events
        where created_at >= v_from_ts
          and is_entry
          and lower(utm_source) = any (v_aliases)
        group by 1
        order by 2 desc
        limit 10
      ) c
    )
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.site_funnel(integer, text) from public;
revoke all on function public.site_funnel(integer, text) from anon;
revoke all on function public.site_funnel(integer, text) from authenticated;
grant execute on function public.site_funnel(integer, text) to service_role;
