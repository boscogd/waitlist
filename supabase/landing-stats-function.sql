-- =====================================================
-- Función RPC: landing_stats
-- =====================================================
-- Devuelve, en un solo JSON, las cifras que enseña la franja de datos de la
-- home (debajo del hero): rosarios rezados, logros desbloqueados y grupos de
-- oración creados. Son COUNT(*) de tablas de la app que la anon key no puede
-- leer por RLS, de ahí SECURITY DEFINER (mismo patrón que profiles_count).
--
-- La landing funciona aunque esta función no exista: /api/stats devuelve
-- null en esas cifras y la franja solo muestra personas + Instagram.
--
-- Ajusta los COUNT si quieres filtrar (p. ej. solo sesiones de rosario
-- completadas): sustituye la subconsulta por la condición que corresponda.
--
-- Ejecutar una vez en el SQL Editor de Supabase.
-- =====================================================

create or replace function public.landing_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'rosaries',     (select count(*)::int from public.rosary_sessions),
    'achievements', (select count(*)::int from public.user_achievements),
    'communities',  (select count(*)::int from public.communities)
  );
$$;

revoke all on function public.landing_stats() from public;
grant execute on function public.landing_stats() to anon;
grant execute on function public.landing_stats() to authenticated;
