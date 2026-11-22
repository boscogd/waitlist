import Link from 'next/link';
import { TONOS, distintivo, euros, type Entrega, type Producto } from '@/lib/tienda/catalogo';
import Foto from './Foto';

const PUNTO: Record<Entrega['tipo'], string> = {
  stock: 'bg-[#2F7A4B]',
  encargo: 'bg-[#C58A12]',
  'bajo-demanda': 'bg-azul',
  preventa: 'bg-[#C58A12]',
  proximamente: 'bg-texto/30',
};

export function EstadoEntrega({ entrega, className = '' }: { entrega: Entrega; className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-sm text-texto/75 ${className}`}>
      <span aria-hidden="true" className={`mt-[6px] h-2 w-2 shrink-0 rounded-full ${PUNTO[entrega.tipo]}`} />
      <span>{entrega.texto}</span>
    </p>
  );
}

export function Precio({ p, className = '' }: { p: Producto; className?: string }) {
  return (
    <span className={`tabular-nums ${className}`}>
      {p.desde && <span className="font-normal opacity-70">Desde </span>}
      {euros(p.precio)}
    </span>
  );
}

export function BarraPreventa({
  total,
  reservadas,
  cierra,
  claro = false,
}: {
  total: number;
  reservadas: number;
  cierra: string;
  /** Sobre fondo oscuro. */
  claro?: boolean;
}) {
  const pct = Math.round((reservadas / total) * 100);
  return (
    <div>
      <div className="flex justify-between gap-4 text-sm tabular-nums">
        <span className="font-semibold">
          {reservadas} de {total} reservados
        </span>
        <span className="opacity-70">Cierra el {cierra}</span>
      </div>
      <div
        className={`mt-2 h-2 overflow-hidden rounded-full ${claro ? 'bg-white/25' : 'bg-black/10'}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reservadas}
        aria-label="Polares reservados"
      >
        <div className={`h-full rounded-full ${claro ? 'bg-white' : 'bg-azul'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const ANILLO =
  'pointer-events-none absolute -inset-1.5 ring-azul ring-offset-2 group-has-[a:focus-visible]:ring-2';

/** Tarjeta de producto: la foto va enmarcada sobre el color del producto. */
export default function Tarjeta({ p, prioridad = false }: { p: Producto; prioridad?: boolean }) {
  const aviso = distintivo(p);
  const [primera, segunda] = p.fotos;
  const tono = TONOS[p.tono];
  const sizes = '(min-width: 1024px) 300px, 45vw';
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] p-[5%]" style={{ backgroundColor: tono.panel }}>
        <div className="relative h-full overflow-hidden">
          <Foto
            foto={primera}
            sizes={sizes}
            prioridad={prioridad}
            className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.05] group-hover:-rotate-1 motion-reduce:transition-none"
          />
          {segunda && (
            <Foto
              foto={segunda}
              sizes={sizes}
              decorativa
              className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            />
          )}
        </div>
        {aviso && (
          <span
            className="absolute left-3 top-3 px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: tono.tintaPanel, color: tono.panel }}
          >
            {aviso}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-texto">
          <Link href={`/tienda/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {p.nombre}
          </Link>
        </h3>
        <Precio p={p} className="shrink-0 text-[15px] text-texto/75" />
      </div>
      <span aria-hidden="true" className={ANILLO} />
    </article>
  );
}

/** Figura del reparto del belén: tarjeta grande de color con el nombre enorme. */
export function TarjetaFigura({ p, nombre, prioridad = false }: { p: Producto; nombre: string; prioridad?: boolean }) {
  const aviso = distintivo(p);
  const tono = TONOS[p.tono];
  return (
    <article
      className="group relative flex w-[78vw] max-w-[340px] shrink-0 flex-col p-4 sm:w-[320px] sm:p-5"
      style={{ backgroundColor: tono.panel, color: tono.tintaPanel }}
    >
      <div className="flex items-center justify-between text-[13px] font-semibold tabular-nums">
        <span className="uppercase tracking-wide">{aviso ?? 'Hecho y listo'}</span>
        <Precio p={p} />
      </div>
      <div className="relative mt-1 aspect-[4/5] overflow-hidden">
        <Foto
          foto={p.fotos[0]}
          sizes="340px"
          prioridad={prioridad}
          className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.05] group-hover:-rotate-1 motion-reduce:transition-none"
        />
      </div>
      <h3 className="tienda-titular mt-4 text-[2.6rem] sm:text-5xl">
        <Link href={`/tienda/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {nombre}
        </Link>
      </h3>
      <p className="mt-2 text-sm font-medium leading-snug">{p.resumen}</p>
      <span aria-hidden="true" className={ANILLO} />
    </article>
  );
}
