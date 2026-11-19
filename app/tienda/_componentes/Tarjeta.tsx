import Link from 'next/link';
import { distintivo, euros, type Entrega, type Producto } from '@/lib/tienda/catalogo';
import Foto from './Foto';

const PUNTO: Record<Entrega['tipo'], string> = {
  stock: 'bg-[#2F7A4B]',
  encargo: 'bg-[#B8862B]',
  'bajo-demanda': 'bg-azul',
  preventa: 'bg-[#B8862B]',
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
      {p.desde && <span className="font-normal text-texto/60">Desde </span>}
      {euros(p.precio)}
    </span>
  );
}

export function BarraPreventa({ total, reservadas, cierra }: { total: number; reservadas: number; cierra: string }) {
  const pct = Math.round((reservadas / total) * 100);
  return (
    <div>
      <div className="flex justify-between gap-4 text-sm tabular-nums">
        <span className="font-medium text-texto">
          {reservadas} de {total} reservados
        </span>
        <span className="text-texto/60">Cierra el {cierra}</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.08]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reservadas}
        aria-label="Polares reservados"
      >
        <div className="h-full rounded-full bg-azul" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Tarjeta de producto: foto 4:5 (la segunda aparece al pasar el ratón), nombre y precio. */
export default function Tarjeta({ p, prioridad = false }: { p: Producto; prioridad?: boolean }) {
  const aviso = distintivo(p);
  const [primera, segunda] = p.fotos;
  const sizes = '(min-width: 1024px) 280px, (min-width: 640px) 45vw, 50vw';
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F2F1EE]">
        <Foto foto={primera} sizes={sizes} prioridad={prioridad} className="absolute inset-0 h-full w-full" />
        {segunda && (
          <Foto
            foto={segunda}
            sizes={sizes}
            decorativa
            className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
          />
        )}
        {aviso && (
          <span className="absolute left-2.5 top-2.5 rounded-[3px] bg-white px-2 py-1 text-xs font-medium text-texto shadow-sm">
            {aviso}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-[15px] font-medium leading-snug text-texto">
        <Link
          href={`/tienda/${p.slug}`}
          className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:underline-offset-4 focus-visible:outline-none"
        >
          {p.nombre}
        </Link>
      </h3>
      <p className="mt-1 text-[15px] text-texto/75">
        <Precio p={p} />
      </p>
      <span aria-hidden="true" className="pointer-events-none absolute -inset-1.5 ring-azul group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}
