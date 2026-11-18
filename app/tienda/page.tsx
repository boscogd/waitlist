import Link from 'next/link';
import { PRODUCTOS, producto, euros, ENVIO } from '@/lib/tienda/catalogo';
import ProductoArte from './_componentes/ProductoArte';
import Etiqueta from './_componentes/Etiqueta';
import Tarjeta, { BarraPreventa, EstadoEntrega } from './_componentes/Tarjeta';
import { Comprar } from './_componentes/Comprar';
import FormEncargo from './_componentes/FormEncargo';

export const metadata = {
  title: { absolute: 'Tienda | Refugio en la Palabra' },
  description: 'Belenes de crochet, escapularios y altares hechos a mano en Sevilla, y ropa de Refugio en la Palabra.',
};

const ANTES = [
  {
    titulo: 'El escapulario va sin bendecir',
    texto: 'La primera vez lo bendice e impone un sacerdote. No cobramos ninguna bendición: llévalo a tu parroquia.',
  },
  {
    titulo: 'Envíos',
    texto: `${euros(ENVIO.coste)} a la península, gratis desde ${euros(ENVIO.gratisDesde)}. Baleares y Canarias, con su tarifa. Sale de Sevilla en 48 h.`,
  },
  {
    titulo: 'Devoluciones',
    texto: 'Tienes 14 días para devolver lo que no te convenza. Lo que lleva un nombre bordado o se hace por encargo no se puede devolver.',
  },
  {
    titulo: 'Para qué sirve la tienda',
    texto: 'Lo que vendemos ayuda a sostener la app de Refugio, que sigue siendo gratis para empezar.',
  },
];

export default function TiendaPage() {
  const misterio = producto('misterio-crochet')!;
  const polar = producto('polar-inmaculada')!;
  const hechoEnCasa = PRODUCTOS.filter((p) => p.linea === 'hecho-en-casa');
  const ropaBajoDemanda = PRODUCTOS.filter((p) => p.linea === 'ropa' && p.slug !== polar.slug);
  const preventa = polar.entrega.tipo === 'preventa' ? polar.entrega : null;

  return (
    <>
      {/* ─── Portada: la pieza estrella con su etiqueta ─── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pt-16">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azul/60">Tienda de Refugio en la Palabra · Sevilla</p>
          <h1 className="mt-4 font-[family-name:var(--font-lora)] text-[2.6rem] font-semibold leading-[1.05] text-azul text-balance sm:text-6xl">
            Hecho a mano en Sevilla, para rezar en casa.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-texto/75">
            Belenes que teje mi madre, escapularios y altares que cose Aida, y la ropa de Refugio. Pocas piezas, hechas despacio: en cada una pone quién la ha hecho y cuántas quedan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/tienda/${misterio.slug}`}
              className="rounded-full bg-azul px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-albero"
            >
              Ver el misterio de crochet
            </Link>
            <Link
              href="#ropa"
              className="rounded-full border border-azul/20 px-6 py-3.5 text-base font-medium text-azul transition-colors hover:border-azul"
            >
              Polar de la Inmaculada
            </Link>
          </div>
          <div className="mt-10 flex gap-4 border-l-2 border-albero pl-4">
            <div>
              <p className="text-sm font-semibold text-azul">Adviento</p>
              <p className="mt-0.5 text-sm leading-relaxed text-texto/70">
                Para tenerlo en Navidad, pide con envío hasta el 10 de diciembre. Las figuras de los Reyes, hasta el 2 de enero.
              </p>
            </div>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-[520px]">
          <Link href={`/tienda/${misterio.slug}`} aria-label={`${misterio.nombre}, ${euros(misterio.precio)}`} className="block rounded-[28px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-albero">
            <ProductoArte arte="misterio" titulo="" className="aspect-square w-full rounded-[28px]" />
          </Link>
          {misterio.hechura && <Etiqueta hechura={misterio.hechura} grande className="absolute left-3 top-5 sm:-left-8 sm:top-10" />}
          <figcaption className="mt-4 flex items-baseline justify-between gap-4 px-1 sm:justify-end">
            <span className="font-[family-name:var(--font-lora)] text-lg text-azul">{misterio.nombre}</span>
            <span className="tabular-nums text-texto/70">{euros(misterio.precio)}</span>
          </figcaption>
        </figure>
      </section>

      {/* ─── Hecho en casa ─── */}
      <section id="hecho-en-casa" className="scroll-mt-28 border-t border-azul/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul sm:text-4xl">Hecho en casa</h2>
            <p className="mt-3 text-lg leading-relaxed text-texto/70">
              Cada pieza lleva su etiqueta: quién la hace, cuántas horas de trabajo tiene y cuántas quedan este mes. Cuando se acaban, se acaban.
            </p>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {hechoEnCasa.map((p) => (
              <Tarjeta key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ropa: la preventa del polar y lo bajo demanda ─── */}
      <section id="ropa" className="scroll-mt-28 border-t border-azul/10">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul sm:text-4xl">Ropa</h2>

          <div className="mt-10 grid items-center gap-10 rounded-[28px] bg-white p-5 shadow-[0_1px_0_rgba(31,58,95,0.06)] ring-1 ring-azul/10 sm:p-8 lg:grid-cols-2 lg:gap-14">
            <ProductoArte arte={polar.arte} titulo={polar.nombre} className="aspect-square w-full rounded-2xl" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azul/60">Preventa · edición de 50</p>
              <h3 className="mt-2 font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul">{polar.nombre}</h3>
              <p className="mt-1 text-xl tabular-nums text-texto">{euros(polar.precio)}</p>
              <p className="mt-4 leading-relaxed text-texto/75">{polar.descripcion[1]}</p>
              {preventa && (
                <div className="mt-6">
                  <BarraPreventa total={preventa.total} reservadas={preventa.reservadas} cierra={preventa.cierra} />
                  <p className="mt-2 text-sm text-texto/60">{preventa.texto}</p>
                </div>
              )}
              <div className="mt-6">
                <Comprar p={polar} />
              </div>
              <Link href={`/tienda/${polar.slug}`} className="text-sm font-medium text-azul underline underline-offset-2">
                Composición, medidas y cuidados
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {ropaBajoDemanda.map((p) => (
              <Tarjeta key={p.slug} p={p} />
            ))}
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-azul/20 p-6 sm:col-span-2">
              <p className="font-[family-name:var(--font-lora)] text-xl text-azul">Se hacen cuando las pides</p>
              <p className="mt-2 text-sm leading-relaxed text-texto/70">
                Las camisetas y sudaderas se fabrican en Barcelona al recibir tu pedido. Así no sobra ropa en ningún almacén y siempre están todas las tallas.
              </p>
              <div className="mt-4">
                <EstadoEntrega entrega={{ tipo: 'bajo-demanda', texto: 'Llegan en 5–8 días.' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Encargos para grupos ─── */}
      <section id="encargos" className="scroll-mt-28 bg-azul text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div className="max-w-lg">
            <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold sm:text-4xl">Encargos para grupos</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Sudaderas y polares con el nombre de vuestro grupo, bordados en un taller de Sevilla.
            </p>
            <ul className="mt-8 space-y-4 text-white/85">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-albero" />
                Confirmaciones, hermandades jóvenes, campamentos, colegios y peregrinaciones. Para la JMJ de Seúl en agosto de 2027, mejor pedir en primavera.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-albero" />
                Desde 20 prendas. Cuantas más, mejor precio por unidad.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-albero" />
                Si lleváis el escudo o la imagen de vuestra hermandad, nos hace falta su autorización por escrito.
              </li>
            </ul>
          </div>
          <FormEncargo />
        </div>
      </section>

      {/* ─── Antes de comprar ─── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-[family-name:var(--font-lora)] text-3xl font-semibold text-azul">Antes de comprar</h2>
        <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {ANTES.map((a) => (
            <div key={a.titulo} className="border-t-2 border-albero pt-4">
              <dt className="font-semibold text-azul">{a.titulo}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-texto/70">{a.texto}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
