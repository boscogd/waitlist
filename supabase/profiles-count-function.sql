-- =====================================================
-- Función RPC: profiles_count
-- =====================================================
-- Devuelve el número total de filas en la tabla `profiles`.
--
-- Se define con SECURITY DEFINER para que pueda contar los perfiles
-- sin que el llamador tenga permisos directos sobre la tabla. De esta
-- forma la landing puede mostrar el contador público sin exponer los
-- datos de los perfiles ni requerir la service_role key.
--
-- Ejecutar este script una vez en el SQL Editor de Supabase.
-- =====================================================

create or replace function public.profiles_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::int from public.profiles;
$$;

-- Revocar ejecución a todos por defecto y conceder solo a anon y authenticated
revoke all on function public.profiles_count() from public;
grant execute on function public.profiles_count() to anon;
grant execute on function public.profiles_count() to authenticated;
