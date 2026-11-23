import Link from 'next/link';
import { AMBIENTE, ENVIO, TONOS, euros, porLinea, producto } from '@/lib/tienda/catalogo';
import Foto from './_componentes/Foto';
import Tarjeta, { BarraPreventa, TarjetaFigura } from './_componentes/Tarjeta';
import FormEncargo from './_componentes/FormEncargo';
import { Cinta } from './_componentes/Movimiento';

export const metadata = {
  title: { absolute: 'Tienda | Refugio en la Palabra' },
  description: 'Belenes de ganchillo hechos a mano en Sevilla, escapularios, rosarios y ropa de Refugio en la Palabra.',
};

// Las figuras del belén, con el nombre que lleva cada tarjeta del reparto.
const REPARTO: [string, string][] = [
  ['misterio-ganchillo', 'Misterio'],
  ['reyes-magos', 'Reyes Magos'],
  ['pastor-ovejas', 'Pastor y rebaño'],
  ['angel-ganchillo', 'Ángel'],
  ['belen-completo', 'Belén entero'],
];

const CINTA = [
  'Tejido a mano en Sevilla',
  'Algodón',
  'Figuras de 9 a 12 cm',
  'Sale en 48 h',
  `Envío gratis desde ${euros(ENVIO.gratisDesde)}`,
  'Para Navidad, pide antes del 10 de diciembre',
];

// Con la ropa a la venta de verdad (NEXT_PUBLIC_TIENDA_PAGOS=1), el envío y el pago dicen lo real.
const PAGOS = process.env.NEXT_PUBLIC_TIENDA_PAGOS === '1';

const INFO = [
  {
    titulo: 'Envío',
    texto: PAGOS
      ? `${euros(ENVIO.coste)} a la península y Baleares, gratis desde ${euros(ENVIO.gratisDesde)}. No enviamos a Canarias, Ceuta ni Melilla. El plazo de la ropa va en cada ficha.`
      : `${euros(ENVIO.coste)} a la península, gratis desde ${euros(ENVIO.gratisDesde)}. Lo hecho a mano sale en 48 h; el plazo de la ropa va en cada ficha.`,
  },
  {
    titulo: 'Devoluciones',
    texto: PAGOS
      ? '14 días desde que te llega para devolverlo, también la ropa que se fabrica al pedirla. Todo en las condiciones de venta.'
      : '14 días para devolverlo. Lo que se hace por encargo no se puede devolver.',
  },
  { titulo: 'Pago', texto: PAGOS ? 'Tarjeta, Apple Pay o Google Pay, con el pago seguro de Stripe.' : 'Tarjeta, Bizum, Apple Pay o Google Pay.' },
  { titulo: 'Sin bendecir', texto: 'Escapularios, rosarios y medallas van sin bendecir: llévalos a tu parroquia.' },
];

const BOTON = 'inline-block px-6 py-4 text-[15px] font-semibold uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

export default function TiendaPage() {
  const devocion = porLinea('devocion');
  const polar = producto('polar-inmaculada')!;
  const otraRopa = porLinea('ropa').filter((p) => p.slug !== polar.slug);
  const preventa = polar.entrega.tipo === 'preventa' ? polar.entrega : null;
  const celeste = TONOS.celeste;

  return (
    <>
      {/* ─── Portada: el titular enorme sobre celeste y, al lado, las manos tejiendo ─── */}
      <section className="grid lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1.2fr_1fr]" style={{ backgroundColor: celeste.fondo, color: celeste.tinta }}>
        <div className="flex flex-col justify-between gap-10 px-4 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-12 lg:pt-12">
          <h1 className="tienda-titular text-[17.5vw] lg:text-[8.6vw] xl:text-[8.2vw]">
            Belenes
            <br />
            de ganchillo
            <br />
            hechos en
            <br />
            Sevilla
          </h1>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-sm text-[17px] font-medium leading-snug">
              Los teje mi madre en casa, figura a figura. Para tenerlo en Navidad, pídelo antes del 10 de diciembre.
            </p>
            <Link href="#reparto" className={`${BOTON} shrink-0 self-start bg-azul text-white hover:bg-azul-800 focus-visible:outline-azul`}>
              Ver las figuras
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-white sm:aspect-[16/10] lg:aspect-auto">
          <Foto foto={AMBIENTE.madre} sizes="(min-width: 1024px) 45vw, 100vw" prioridad className="absolute inset-0 h-full w-full p-[6%]" />
        </div>
      </section>

      {/* ─── Cinta ─── */}
      <Cinta textos={CINTA} />

      {/* ─── El reparto del belén ─── */}
      <section aria-labelledby="reparto" className="py-14 sm:py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <h2 id="reparto" className="tienda-titular scroll-mt-32 text-[19vw] text-azul sm:text-[8.5rem]">
            El reparto
          </h2>
          <p className="max-w-sm text-[17px] leading-snug text-texto/80 lg:pb-3">
            Todas las figuras van a la misma escala: empieza por el misterio y el belén crece cada año.
          </p>
        </div>
        <div className="tienda-reparto mt-8 flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-8 lg:px-10" role="list">
          {REPARTO.map(([slug, nombre], i) => {
            const p = producto(slug)!;
            return (
              <div key={slug} role="listitem">
                <TarjetaFigura p={p} nombre={nombre} prioridad={i < 2} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Quién los teje ─── */}
      <section className="grid lg:grid-cols-2" style={{ backgroundColor: TONOS.albero.fondo, color: TONOS.albero.tinta }}>
        <div className="order-2 flex flex-col justify-center px-4 py-12 sm:px-8 lg:order-1 lg:px-10 lg:py-20">
          <h2 className="tienda-titular text-[13vw] sm:text-7xl lg:text-[5.4vw]">
            Entre dos y cuatro horas por figura
          </h2>
          <div className="mt-6 max-w-md space-y-4 text-[17px] leading-relaxed">
            <p>
              Mi madre teje cada figura en casa, en los ratos que tiene, así que salen pocas. Cuando se acaban, hay que esperar a la siguiente tanda.
            </p>
            <p>El belén entero, con Reyes, pastores y animales, se encarga. Los de esta Navidad ya están cerrados.</p>
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide opacity-70">Bosco, de Refugio en la Palabra</p>
          <Link
            href="/tienda/belen-completo"
            className={`${BOTON} mt-8 self-start border-2 border-current hover:bg-[#3A2A10] hover:text-[#F1BC45] focus-visible:outline-[#3A2A10]`}
          >
            Encargar el belén entero
          </Link>
        </div>
        <div className="relative order-1 aspect-[4/3] lg:order-2 lg:aspect-auto lg:min-h-[640px]">
          <Foto foto={AMBIENTE.belen} sizes="(min-width: 1024px) 50vw, 100vw" className="absolute inset-0 h-full w-full p-[6%]" />
        </div>
      </section>

      {/* ─── Devoción ─── */}
      <section aria-labelledby="devocion">
        <div className="px-4 pb-8 pt-14 sm:px-8 sm:pt-20 lg:px-10" style={{ backgroundColor: TONOS.morado.fondo, color: TONOS.morado.tinta }}>
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 id="devocion" className="tienda-titular scroll-mt-32 text-[19vw] sm:text-[8.5rem]">
              Devoción
            </h2>
            <p className="max-w-sm text-[17px] leading-snug text-white lg:pb-3">
              Escapularios que cose Aida, rosarios que monta ella misma y lo que nos piden para casa.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-3 gap-y-10 px-4 py-10 sm:gap-x-5 sm:px-8 lg:grid-cols-3 lg:px-10 lg:py-14">
          {devocion.map((p) => (
            <Tarjeta key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* ─── Ropa: el polar en grande ─── */}
      <section aria-labelledby="ropa" className="border-t-4 border-azul">
        <div className="grid lg:grid-cols-2">
          <div className="p-[7%] lg:p-14" style={{ backgroundColor: celeste.panel }}>
            <Foto foto={polar.fotos[0]} sizes="(min-width: 1024px) 45vw, 90vw" className="aspect-[4/5] w-full" />
          </div>
          <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-14">
            <p id="ropa" className="scroll-mt-32 text-sm font-bold uppercase tracking-[0.12em] text-azul">
              Ropa · Preventa
            </p>
            <h2 className="tienda-titular mt-3 text-[18vw] text-azul sm:text-8xl lg:text-[7vw]">
              Polar
              <br />
              Inmaculada
            </h2>
            <p className="mt-4 text-2xl font-semibold tabular-nums text-texto">{euros(polar.precio)}</p>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-texto/80">
              Media cremallera en color crudo, con la cruz de Refugio bordada en azul. Se bordan solo los que se reservan, en un taller de Sevilla, y llegan antes de Reyes.
            </p>
            {preventa && (
              <div className="mt-6 max-w-md text-azul">
                <BarraPreventa total={preventa.total} reservadas={preventa.reservadas} cierra={preventa.cierra} />
              </div>
            )}
            <Link href={`/tienda/${polar.slug}`} className={`${BOTON} mt-8 self-start bg-azul text-white hover:bg-azul-800 focus-visible:outline-azul`}>
              Elegir talla y reservar
            </Link>
          </div>
        </div>
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-3 gap-y-10 px-4 py-10 sm:gap-x-5 sm:px-8 lg:grid-cols-4 lg:px-10 lg:py-14">
          {otraRopa.map((p) => (
            <Tarjeta key={p.slug} p={p} />
          ))}
          <Link
            href="#encargos"
            className="group hidden flex-col justify-end p-6 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-azul lg:flex lg:aspect-[4/5]"
            style={{ backgroundColor: TONOS.verde.fondo }}
          >
            <span className="tienda-titular text-5xl sm:text-6xl">Sudaderas para tu grupo</span>
            <span className="mt-3 text-[15px] leading-snug text-white">Con el nombre bordado. Desde 20 prendas.</span>
            <span className="mt-5 text-sm font-semibold uppercase tracking-wide underline underline-offset-4 group-hover:no-underline">Pedir presupuesto</span>
          </Link>
        </div>
      </section>

      {/* ─── Encargos para grupos ─── */}
      <section aria-labelledby="encargos" style={{ backgroundColor: TONOS.verde.fondo }} className="text-white">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <div>
            <h2 id="encargos" className="tienda-titular scroll-mt-32 text-[15vw] sm:text-7xl lg:text-[5.6vw]">
              Para vuestro grupo
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white">
              Sudaderas y polares con el nombre bordado en un taller de Sevilla, para confirmaciones, hermandades, campamentos, colegios o la JMJ de Seúl.
            </p>
            <ul className="mt-6 max-w-md space-y-2 text-[15px] text-white">
              <li>Desde 20 prendas. Cuantas más, mejor precio.</li>
              <li>Os mandamos una prueba del diseño antes de hacerlas.</li>
              <li>Si lleva el escudo de una hermandad, hace falta su permiso por escrito.</li>
            </ul>
          </div>
          <FormEncargo />
        </div>
      </section>

      {/* ─── Antes de comprar ─── */}
      <section aria-label="Antes de comprar" className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8 lg:px-10">
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {INFO.map((a) => (
            <div key={a.titulo} className="border-t-2 border-azul pt-4">
              <dt className="text-sm font-bold uppercase tracking-wide text-azul">{a.titulo}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-texto/75">{a.texto}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
