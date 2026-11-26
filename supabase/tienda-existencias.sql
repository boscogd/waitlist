-- =====================================================
-- TIENDA · EXISTENCIAS DE LO HECHO A MANO (belenes)
-- =====================================================
-- Ejecutar UNA vez en Supabase → SQL Editor.
--
-- tienda_existencias: cuántas unidades quedan de cada pieza hecha a mano. Se
--   cambia a mano desde Table Editor cuando se teje más (columna «quedan»).
--   Una pieza sin fila aquí no se puede comprar.
-- tienda_reservas: lo que se descontó por cada pago (una fila por sesión de
--   Stripe), para que un aviso repetido de Stripe no descuente dos veces, y
--   cuándo salieron sus correos, para no mandar dos veces la orden de envío
--   aunque Stripe reintente días después.
--
-- Solo el servidor (service_role) lee y escribe: RLS activada sin políticas.

create table if not exists public.tienda_existencias (
  slug text primary key,
  quedan integer not null default 0 check (quedan >= 0),
  actualizado timestamptz not null default now()
);

create table if not exists public.tienda_reservas (
  sesion text primary key,
  estado text not null check (estado in ('ok', 'faltan')),
  lineas jsonb not null,
  faltan jsonb,
  creada timestamptz not null default now(),
  aviso_enviado timestamptz,
  confirmacion_enviada timestamptz
);

-- Por si la tabla se creó con una versión anterior de este archivo.
alter table public.tienda_reservas add column if not exists aviso_enviado timestamptz;
alter table public.tienda_reservas add column if not exists confirmacion_enviada timestamptz;

alter table public.tienda_existencias enable row level security;
alter table public.tienda_reservas enable row level security;

-- Descuenta todas las líneas de un pago o ninguna.
-- p_lineas: [{"slug":"misterio-ganchillo","cantidad":1}, …]
-- Devuelve {"estado":"ok"|"faltan", "faltan":[{"slug":…,"pide":…,"quedan":…}],
--          "aviso_enviado":bool, "confirmacion_enviada":bool}.
-- Si la sesión ya se atendió, devuelve lo mismo que la primera vez (aunque
-- entre medias se hayan añadido existencias).
create or replace function public.tienda_descontar(p_sesion text, p_lineas jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  previa public.tienda_reservas;
  l record;
  faltan jsonb := '[]'::jsonb;
  disponibles integer;
begin
  if p_sesion is null or p_lineas is null or jsonb_typeof(p_lineas) <> 'array' then
    raise exception 'tienda_descontar: argumentos no válidos';
  end if;

  -- Un pago a la vez: dos avisos de la misma sesión no se cruzan.
  perform pg_advisory_xact_lock(hashtext('tienda_descontar:' || p_sesion));

  select * into previa from public.tienda_reservas where sesion = p_sesion;
  if found then
    return jsonb_build_object(
      'estado', previa.estado,
      'faltan', coalesce(previa.faltan, '[]'::jsonb),
      'repetido', true,
      'aviso_enviado', previa.aviso_enviado is not null,
      'confirmacion_enviada', previa.confirmacion_enviada is not null
    );
  end if;

  -- Bloquea las filas en orden de slug (sin interbloqueos entre pagos) y comprueba.
  for l in
    select x.slug, sum(x.cantidad)::integer as cantidad
    from jsonb_to_recordset(p_lineas) as x(slug text, cantidad integer)
    group by x.slug
    order by x.slug
  loop
    if l.cantidad is null or l.cantidad < 1 then
      raise exception 'tienda_descontar: cantidad no válida para %', l.slug;
    end if;
    select quedan into disponibles from public.tienda_existencias where slug = l.slug for update;
    if not found then disponibles := 0; end if;
    if disponibles < l.cantidad then
      faltan := faltan || jsonb_build_object('slug', l.slug, 'pide', l.cantidad, 'quedan', disponibles);
    end if;
  end loop;

  if jsonb_array_length(faltan) > 0 then
    insert into public.tienda_reservas (sesion, estado, lineas, faltan) values (p_sesion, 'faltan', p_lineas, faltan);
    return jsonb_build_object('estado', 'faltan', 'faltan', faltan, 'repetido', false);
  end if;

  update public.tienda_existencias e
  set quedan = e.quedan - x.cantidad, actualizado = now()
  from (
    select slug, sum(cantidad)::integer as cantidad
    from jsonb_to_recordset(p_lineas) as r(slug text, cantidad integer)
    group by slug
  ) x
  where e.slug = x.slug;

  insert into public.tienda_reservas (sesion, estado, lineas) values (p_sesion, 'ok', p_lineas);
  return jsonb_build_object('estado', 'ok', 'faltan', '[]'::jsonb, 'repetido', false);
end;
$$;

revoke all on function public.tienda_descontar(text, jsonb) from public, anon, authenticated;
grant execute on function public.tienda_descontar(text, jsonb) to service_role;

-- Apunta que ya salió un correo del pedido ('aviso' a nosotros o 'confirmacion' al cliente).
create or replace function public.tienda_marcar_correo(p_sesion text, p_correo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_correo = 'aviso' then
    update public.tienda_reservas set aviso_enviado = coalesce(aviso_enviado, now()) where sesion = p_sesion;
  elsif p_correo = 'confirmacion' then
    update public.tienda_reservas set confirmacion_enviada = coalesce(confirmacion_enviada, now()) where sesion = p_sesion;
  else
    raise exception 'tienda_marcar_correo: correo no válido %', p_correo;
  end if;
end;
$$;

revoke all on function public.tienda_marcar_correo(text, text) from public, anon, authenticated;
grant execute on function public.tienda_marcar_correo(text, text) to service_role;

-- Piezas a la venta. Cambia los números por las unidades que haya de verdad
-- antes de encender los pagos (con 0 salen «Agotado»).
insert into public.tienda_existencias (slug, quedan) values
  ('misterio-ganchillo', 0),
  ('reyes-magos', 0),
  ('pastor-ovejas', 0),
  ('angel-ganchillo', 0)
on conflict (slug) do nothing;
