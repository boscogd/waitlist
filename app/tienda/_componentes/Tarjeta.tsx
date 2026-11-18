import Link from 'next/link';
import { euros, sePuedeComprar, type Entrega, type Producto } from '@/lib/tienda/catalogo';
import ProductoArte from './ProductoArte';
import Etiqueta from './Etiqueta';
import { AnadirRapido } from './Comprar';

const PUNTO: Record<Entrega['tipo'], string> = {
  stock: 'bg-[#2F6B45]',
  encargo: 'bg-albero',
  'bajo-demanda': 'bg-azul',
  preventa: 'bg-albero',
  proximamente: 'bg-texto/30',
};

export function EstadoEntrega({ entrega }: { entrega: Entrega }) {
  return (
    <p className="flex items-start gap-2 text-sm text-texto/70">
      <span aria-hidden="true" className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${PUNTO[entrega.tipo]}`} />
      <span>{entrega.texto}</span>
    </p>
  );
}

export function Precio({ p, className = '' }: { p: Producto; className?: string }) {
  return (
    <span className={`tabular-nums ${className}`}>
      {p.desde && <span className="text-[0.8em] font-normal text-texto/60">desde </span>}
      {euros(p.precio)}
    </span>
  );
}

export function BarraPreventa({ total, reservadas, cierra }: { total: number; reservadas: number; cierra: string }) {
  const pct = Math.round((reservadas / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm tabular-nums">
        <span className="font-medium text-azul">
          {reservadas} de {total} reservados
        </span>
        <span className="text-texto/60">Cierra el {cierra}</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-azul/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reservadas}
        aria-label="Polares reservados"
      >
        <div className="h-full rounded-full bg-albero" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Tarjeta({ p }: { p: Producto }) {
  const rapido = sePuedeComprar(p) && !p.tallas && !p.personalizable;
  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <ProductoArte
          arte={p.arte}
          titulo={p.nombre}
          className="aspect-square w-full rounded-2xl transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none"
        />
        {p.hechura && <Etiqueta hechura={p.hechura} compacta className="absolute -bottom-4 left-3" />}
      </div>
      <div className={`${p.hechura ? 'mt-7' : 'mt-4'} flex flex-1 flex-col`}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-[family-name:var(--font-lora)] text-lg font-semibold leading-snug text-azul">
            <Link href={`/tienda/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {p.nombre}
            </Link>
          </h3>
          <Precio p={p} className="font-medium text-texto" />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-texto/70">{p.resumen}</p>
        <div className="mt-3 flex flex-1 items-end justify-between gap-3">
          <EstadoEntrega entrega={p.entrega} />
          {rapido && <AnadirRapido p={p} />}
        </div>
      </div>
      {/* Anillo de foco visible para toda la tarjeta */}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-2 rounded-3xl ring-albero group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}
