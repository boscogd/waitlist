import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCTOS, producto, ENVIO, euros } from '@/lib/tienda/catalogo';
import ProductoArte from '../_componentes/ProductoArte';
import Etiqueta from '../_componentes/Etiqueta';
import Tarjeta, { BarraPreventa, EstadoEntrega, Precio } from '../_componentes/Tarjeta';
import { Comprar } from '../_componentes/Comprar';

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = producto((await params).slug);
  return p ? { title: p.nombre, description: p.resumen } : {};
}

export default async function FichaProducto({ params }: { params: Promise<{ slug: string }> }) {
  const p = producto((await params).slug);
  if (!p) notFound();

  const linea = p.linea === 'ropa' ? { texto: 'Ropa', ancla: 'ropa' } : { texto: 'Hecho en casa', ancla: 'hecho-en-casa' };
  const relacionados = PRODUCTOS.filter((x) => x.linea === p.linea && x.slug !== p.slug).slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <nav aria-label="Estás en" className="text-sm text-texto/60">
          <ol className="flex flex-wrap gap-x-2">
            <li>
              <Link href="/tienda" className="hover:text-azul">Tienda</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/tienda#${linea.ancla}`} className="hover:text-azul">{linea.texto}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-texto/85">{p.nombre}</li>
          </ol>
        </nav>
      </div>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="relative lg:sticky lg:top-28 lg:self-start">
          <ProductoArte arte={p.arte} titulo={p.nombre} className="aspect-square w-full rounded-[28px]" />
          {p.hechura && <Etiqueta hechura={p.hechura} grande className="absolute left-3 top-5 sm:-left-6 sm:top-8" />}
        </div>

        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-lora)] text-4xl font-semibold leading-tight text-azul text-balance">{p.nombre}</h1>
          <p className="mt-2 text-2xl text-texto">
            <Precio p={p} />
          </p>
          <p className="mt-4 text-lg leading-relaxed text-texto/75">{p.resumen}</p>

          <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-azul/10">
            {p.entrega.tipo === 'preventa' ? (
              <>
                <BarraPreventa total={p.entrega.total} reservadas={p.entrega.reservadas} cierra={p.entrega.cierra} />
                <p className="mt-2 text-sm text-texto/60">Pagas ahora y se encargan solo las que se reservan. {p.entrega.texto}</p>
              </>
            ) : (
              <EstadoEntrega entrega={p.entrega} />
            )}
            <div className="mt-5">
              <Comprar p={p} />
            </div>
            {p.aviso && <p className="border-t border-azul/10 pt-4 text-sm text-texto/70">{p.aviso}</p>}
          </div>

          <div className="mt-10 space-y-4 leading-relaxed text-texto/80">
            {p.descripcion.map((d) => (
              <p key={d}>{d}</p>
            ))}
          </div>

          <dl className="mt-8 divide-y divide-azul/10 border-y border-azul/10 text-sm">
            {p.detalles.map((d) => (
              <div key={d.etiqueta} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
                <dt className="text-texto/60">{d.etiqueta}</dt>
                <dd className="text-texto">{d.valor}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[8rem_1fr] gap-4 py-3">
              <dt className="text-texto/60">Lo hace</dt>
              <dd className="text-texto">
                {p.hechura ? `${p.hechura.quien}, en Sevilla` : p.entrega.tipo === 'preventa' ? 'Taller de bordado de Sevilla' : 'Taller de impresión en Barcelona'}
              </dd>
            </div>
          </dl>

          <details className="group mt-6 border-b border-azul/10 pb-4">
            <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-medium text-azul">
              Envío y devoluciones
              <span aria-hidden="true" className="text-xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-texto/75">
              <p>
                {euros(ENVIO.coste)} a la península, gratis desde {euros(ENVIO.gratisDesde)}. Baleares y Canarias, con su tarifa (a Canarias va sin IVA y puede pasar por aduana).
              </p>
              <p>
                Tienes 14 días desde que lo recibes para devolverlo. Lo personalizado o hecho por encargo no se puede devolver, salvo que llegue dañado. Garantía de 3 años.
              </p>
            </div>
          </details>
        </div>
      </section>

      {relacionados.length > 0 && (
        <section className="border-t border-azul/10 bg-white/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul">También en {linea.texto.toLowerCase()}</h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {relacionados.map((r) => (
                <Tarjeta key={r.slug} p={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
