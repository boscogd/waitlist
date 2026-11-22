import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCTOS, LINEAS, TONOS, producto, distintivo, ENVIO, euros } from '@/lib/tienda/catalogo';
import Tarjeta, { BarraPreventa, EstadoEntrega, Precio } from '../_componentes/Tarjeta';
import Galeria from '../_componentes/Galeria';
import { Comprar } from '../_componentes/Comprar';

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = producto((await params).slug);
  return p ? { title: p.nombre, description: p.resumen } : {};
}

function Plegable({ titulo, abierto = false, children }: { titulo: string; abierto?: boolean; children: React.ReactNode }) {
  return (
    <details open={abierto} className="group border-b border-black/[0.08]">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-medium text-texto [&::-webkit-details-marker]:hidden">
        {titulo}
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="pb-5 text-[15px] leading-relaxed text-texto/80">{children}</div>
    </details>
  );
}

export default async function FichaProducto({ params }: { params: Promise<{ slug: string }> }) {
  const p = producto((await params).slug);
  if (!p) notFound();

  const linea = LINEAS[p.linea];
  const relacionados = [
    ...PRODUCTOS.filter((x) => x.linea === p.linea && x.slug !== p.slug),
    ...PRODUCTOS.filter((x) => x.linea !== p.linea),
  ].slice(0, 4);
  const pocas = p.quedan !== undefined && p.quedan > 0 && p.quedan <= 3;

  return (
    <>
      <section className="mx-auto grid max-w-[1400px] gap-6 pb-16 sm:gap-8 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Galeria fotos={p.fotos} aviso={distintivo(p)} fondo={TONOS[p.tono].panel} tinta={TONOS[p.tono].tintaPanel} />
        </div>

        <div className="min-w-0 px-4 sm:px-0 lg:max-w-md lg:pt-2">
          <nav aria-label="Estás en" className="text-sm text-texto/55">
            <Link href="/tienda" className="hover:text-texto">
              Tienda
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href={`/tienda#${linea.ancla}`} className="hover:text-texto">
              {linea.nombre}
            </Link>
          </nav>
          <h1 className="tienda-titular mt-3 text-[13vw] text-azul sm:text-6xl lg:text-[4.2rem]">{p.nombre}</h1>
          <p className="mt-4 text-2xl font-semibold text-texto">
            <Precio p={p} />
          </p>
          {p.hechoPor && <p className="mt-3 text-[15px] text-texto/70">{p.hechoPor}</p>}

          <div className="mt-6 border-t border-black/[0.08] pt-6">
            {p.entrega.tipo === 'preventa' ? (
              <div className="mb-6">
                <BarraPreventa total={p.entrega.total} reservadas={p.entrega.reservadas} cierra={p.entrega.cierra} />
                <p className="mt-2 text-sm text-texto/65">Pagas ahora y se hacen solo los que se reservan. {p.entrega.texto}</p>
              </div>
            ) : (
              <EstadoEntrega entrega={p.entrega} className="mb-5" />
            )}
            {pocas && (
              <p className="-mt-2 mb-5 text-sm text-texto/70">
                {p.quedan === 1 ? 'Queda solo una.' : `Quedan ${p.quedan}.`} La siguiente tanda tarda unas semanas.
              </p>
            )}
            <Comprar p={p} />
          </div>

          <div className="mt-4 border-t border-black/[0.08]">
            <Plegable titulo="Descripción" abierto>
              <div className="space-y-3">
                {p.descripcion.map((d) => (
                  <p key={d}>{d}</p>
                ))}
                {p.aviso && <p className="text-sm text-texto/65">{p.aviso}</p>}
              </div>
            </Plegable>
            <Plegable titulo="Detalles">
              <dl className="space-y-2">
                {p.detalles.map((d) => (
                  <div key={d.etiqueta} className="grid grid-cols-[7.5rem_1fr] gap-3">
                    <dt className="text-texto/55">{d.etiqueta}</dt>
                    <dd>{d.valor}</dd>
                  </div>
                ))}
              </dl>
            </Plegable>
            <Plegable titulo="Envío y devoluciones">
              <div className="space-y-2">
                <p>
                  {euros(ENVIO.coste)} a la península, gratis desde {euros(ENVIO.gratisDesde)}. Baleares y Canarias, con su tarifa.
                </p>
                <p>Tienes 14 días para devolverlo. Lo hecho por encargo no se puede devolver, salvo que llegue dañado.</p>
              </div>
            </Plegable>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8 lg:px-10">
          <h2 className="tienda-titular text-5xl text-azul sm:text-6xl">También te puede gustar</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {relacionados.map((r) => (
              <Tarjeta key={r.slug} p={r} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
