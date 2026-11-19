import Link from 'next/link';
import { AMBIENTE, ENVIO, euros, porLinea, producto, urlFoto } from '@/lib/tienda/catalogo';
import Foto from './_componentes/Foto';
import Tarjeta, { BarraPreventa } from './_componentes/Tarjeta';
import FormEncargo from './_componentes/FormEncargo';

export const metadata = {
  title: { absolute: 'Tienda | Refugio en la Palabra' },
  description: 'Belenes de ganchillo hechos a mano en Sevilla, escapularios, rosarios y ropa de Refugio en la Palabra.',
};

const INFO = [
  { titulo: 'Envío', texto: `${euros(ENVIO.coste)} a la península. Gratis desde ${euros(ENVIO.gratisDesde)}. Lo hecho a mano sale en 48 h; el plazo de la ropa va en cada ficha.` },
  { titulo: 'Devoluciones', texto: '14 días para devolverlo. Lo que se hace por encargo no se puede devolver.' },
  { titulo: 'Pago', texto: 'Tarjeta, Bizum, Apple Pay o Google Pay.' },
  { titulo: 'Sin bendecir', texto: 'Escapularios, rosarios y medallas van sin bendecir: llévalos a tu parroquia.' },
];

function Cabecera({ id, titulo, texto }: { id: string; titulo: string; texto?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="scroll-mt-32 text-2xl font-semibold tracking-tight text-texto sm:text-[1.75rem]">
        {titulo}
      </h2>
      {texto && <p className="mt-2 text-[15px] leading-relaxed text-texto/70">{texto}</p>}
    </div>
  );
}

const REJILLA = 'mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6';

export default function TiendaPage() {
  const belenes = porLinea('belenes').filter((p) => p.slug !== 'belen-completo');
  const devocion = porLinea('devocion');
  const ropa = porLinea('ropa');
  const completo = producto('belen-completo')!;
  const polar = producto('polar-inmaculada')!;
  const preventa = polar.entrega.tipo === 'preventa' ? polar.entrega : null;
  const portada = completo.fotos[0];

  return (
    <>
      {/* ─── Portada ─── */}
      {/* En el móvil el texto va debajo de la foto; en el ordenador, encima. */}
      <section className="relative isolate overflow-hidden bg-[#2B221B]">
        <picture>
          <source media="(min-width: 768px)" srcSet={`${urlFoto(portada.id, 1600, 0.5)} 1600w, ${urlFoto(portada.id, 2400, 0.5)} 2400w`} sizes="100vw" />
          {/* eslint-disable-next-line @next/next/no-img-element -- recorte distinto en móvil y ordenador */}
          <img
            src={urlFoto(portada.id, 800, 0.8)}
            srcSet={`${urlFoto(portada.id, 640, 0.8)} 640w, ${urlFoto(portada.id, 960, 0.8)} 960w`}
            sizes="100vw"
            alt={portada.alt}
            fetchPriority="high"
            className="aspect-[5/4] w-full object-cover md:aspect-[2/1] md:max-h-[680px]"
          />
        </picture>
        <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-black/20 to-transparent md:block" />
        <div className="md:absolute md:inset-0 md:flex md:items-center">
          <div className="mx-auto w-full max-w-7xl px-4 pb-9 pt-6 sm:px-6 md:py-0">
            <div className="max-w-md text-white">
              <p className="text-sm font-medium text-white/80">Navidad 2026</p>
              <h1 className="mt-2 text-[2.5rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl">Belenes de ganchillo</h1>
              <p className="mt-3 text-[17px] leading-relaxed text-white/90">
                Tejidos a mano por mi madre, en Sevilla. Para tenerlo en casa en Navidad, pídelo antes del 10 de diciembre.
              </p>
              <Link
                href="#belenes"
                className="mt-6 inline-block rounded-[4px] bg-white px-6 py-3.5 text-[15px] font-medium text-texto transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Ver los belenes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Belenes ─── */}
      <section aria-labelledby="belenes" className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-14 sm:px-6 sm:pt-20">
        <Cabecera id="belenes" titulo="Belenes de ganchillo" texto="Figuras de 9 a 12 cm, todas a la misma escala, para que el belén crezca cada año." />
        <div className={REJILLA}>
          {belenes.map((p, i) => (
            <Tarjeta key={p.slug} p={p} prioridad={i < 2} />
          ))}
        </div>
      </section>

      {/* ─── Quién los hace ─── */}
      <section className="mx-auto mt-16 grid max-w-7xl items-center gap-8 px-4 sm:mt-24 sm:px-6 md:grid-cols-[5fr_6fr] md:gap-16">
        <Foto foto={AMBIENTE.lana} sizes="(min-width: 768px) 600px, 100vw" className="aspect-[4/3] w-full bg-[#F2F1EE] md:aspect-square" proporcion={1} />
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight text-texto sm:text-[1.75rem]">Los teje mi madre</h2>
          <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-texto/80">
            <p>
              Cada figura lleva entre dos y cuatro horas de ganchillo. Mi madre las hace en casa, en los ratos que tiene, así que salen pocas: cuando
              se acaban, hay que esperar a la siguiente tanda.
            </p>
            <p>Si quieres un belén entero, con Reyes, pastores y animales, se puede encargar. Los de esta Navidad ya están cerrados.</p>
          </div>
          <p className="mt-4 text-[15px] text-texto/60">Bosco, de Refugio en la Palabra</p>
          <Link
            href={`/tienda/${completo.slug}`}
            className="mt-7 inline-block rounded-[4px] border border-texto px-6 py-3.5 text-[15px] font-medium text-texto transition-colors hover:bg-texto hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
          >
            Encargar un belén completo
          </Link>
        </div>
      </section>

      {/* ─── Devoción ─── */}
      <section aria-labelledby="devocion" className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-16 sm:px-6 sm:pt-24">
        <Cabecera id="devocion" titulo="Devoción" texto="Escapularios cosidos y rosarios montados a mano por Aida, y lo que nos piden para casa." />
        <div className={REJILLA}>
          {devocion.map((p) => (
            <Tarjeta key={p.slug} p={p} />
          ))}
        </div>
      </section>

      {/* ─── Ropa ─── */}
      <section aria-labelledby="ropa" className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-16 sm:px-6 sm:pt-24">
        <Cabecera id="ropa" titulo="Ropa" />
        {preventa && (
          <div className="mt-5 grid gap-4 rounded-[4px] bg-[#F5F4F1] p-5 sm:grid-cols-[1fr_minmax(0,22rem)] sm:items-center sm:gap-10">
            <p className="text-[15px] leading-relaxed text-texto/80">
              <strong className="font-semibold text-texto">El polar Inmaculada va en preventa.</strong> Se bordan solo los que se reservan, en un
              taller de Sevilla, y llegan antes de Reyes.
            </p>
            <BarraPreventa total={preventa.total} reservadas={preventa.reservadas} cierra={preventa.cierra} />
          </div>
        )}
        <div className={REJILLA}>
          {ropa.map((p) => (
            <Tarjeta key={p.slug} p={p} />
          ))}
          <Link
            href="#encargos"
            className="group relative flex aspect-[4/5] flex-col justify-end bg-azul p-5 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-azul"
          >
            <span className="text-xl font-semibold leading-snug tracking-tight">Sudaderas para tu grupo</span>
            <span className="mt-2 text-sm leading-relaxed text-white/80">Con el nombre bordado. Desde 20 prendas.</span>
            <span className="mt-4 text-sm font-medium underline underline-offset-4 group-hover:no-underline">Pedir presupuesto</span>
          </Link>
        </div>
      </section>

      {/* ─── Encargos para grupos ─── */}
      <section aria-labelledby="encargos" className="mt-20 scroll-mt-32 bg-[#F5F4F1] sm:mt-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-md">
            <h2 id="encargos" className="scroll-mt-32 text-2xl font-semibold tracking-tight text-texto sm:text-[1.75rem]">
              Sudaderas y polares para grupos
            </h2>
            <p className="mt-3 text-[17px] leading-relaxed text-texto/80">
              Para confirmaciones, hermandades, campamentos, colegios o la JMJ de Seúl. Con el nombre del grupo bordado en un taller de Sevilla.
            </p>
            <ul className="mt-6 space-y-2 text-[15px] text-texto/80">
              <li>Desde 20 prendas. Cuantas más, mejor precio.</li>
              <li>Os mandamos una prueba del diseño antes de hacerlas.</li>
              <li>Si lleva el escudo de una hermandad, hace falta su permiso por escrito.</li>
            </ul>
          </div>
          <FormEncargo />
        </div>
      </section>

      {/* ─── Antes de comprar ─── */}
      <section aria-label="Antes de comprar" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {INFO.map((a) => (
            <div key={a.titulo}>
              <dt className="text-[15px] font-semibold text-texto">{a.titulo}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-texto/70">{a.texto}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
