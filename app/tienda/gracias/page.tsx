// /tienda/gracias?session_id=cs_…
// Stripe vuelve aquí tras el pago. Se lee la sesión en el servidor y se enseña
// el resumen. Si el id es falso o Stripe no responde, un mensaje genérico.
import type { Metadata } from 'next';
import Link from 'next/link';
import { cpSinEnvio, plazoPedido } from '@/lib/tienda/pagos/cesta';
import { idExterno, referenciaDe } from '@/lib/tienda/pagos/printful';
import { envioDeSesion, ID_SESION, leerLineas, leerSesion, stripeConfigurado, type LineaSesion, type SesionCheckout } from '@/lib/tienda/pagos/stripe';
import VaciarRopa from './VaciarRopa';
import { estadoReserva } from '@/lib/tienda/existencias';

export const metadata: Metadata = { title: 'Gracias por tu pedido' };
export const dynamic = 'force-dynamic';

const CORREO = process.env.TIENDA_CORREO || 'info@refugioenlapalabra.com';

const eur = (cent: number) => (cent / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });

/** Suma días laborables (sin fines de semana; los festivos no se cuentan, por eso es «aproximado»). */
function masLaborables(desde: Date, dias: number) {
  const d = new Date(desde);
  let n = 0;
  while (n < dias) {
    d.setDate(d.getDate() + 1);
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) n++;
  }
  return d;
}

const fecha = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' });

async function leer(id: string): Promise<{ s: SesionCheckout; lineas: LineaSesion[] } | null> {
  if (!ID_SESION.test(id) || !stripeConfigurado()) return null;
  try {
    const s = await leerSesion(id);
    if (s.metadata?.tienda !== 'refugio') return null;
    return { s, lineas: await leerLineas(id) };
  } catch {
    return null;
  }
}

function Marco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="tienda-titular text-[12vw] text-azul sm:text-6xl">{titulo}</h1>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-texto/80">{children}</div>
      <Link href="/tienda" className="mt-10 inline-block border border-black/15 px-5 py-3 text-sm font-medium text-texto hover:border-texto">
        Volver a la tienda
      </Link>
    </section>
  );
}

export default async function Gracias({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
  const { session_id } = await searchParams;
  const datos = await leer(typeof session_id === 'string' ? session_id : '');

  if (!datos) {
    return (
      <Marco titulo="Gracias">
        <p>
          Si has terminado el pago, en unos minutos te llega un correo con el pedido. Si no te llega o tienes cualquier duda, escríbenos a{' '}
          <a href={`mailto:${CORREO}`} className="underline underline-offset-2">
            {CORREO}
          </a>
          .
        </p>
      </Marco>
    );
  }

  const { s, lineas } = datos;
  if (s.payment_status !== 'paid') {
    return (
      <Marco titulo="Pago sin terminar">
        <p>Todavía no nos consta el pago. Si lo has hecho con un método que tarda (como una transferencia), te escribimos en cuanto llegue.</p>
        <p>Si no lo has terminado, la cesta sigue guardada: puedes volver a intentarlo.</p>
      </Marco>
    );
  }

  const envio = envioDeSesion(s);
  const dir = envio?.address;
  const nombre = (envio?.name || s.customer_details?.name || '').split(' ')[0];
  const email = s.customer_details?.email;
  const referencia = referenciaDe(idExterno(s.id));
  const metas = lineas.map((l) => ({ l, m: l.price && typeof l.price.product === 'object' ? l.price.product.metadata : null }));
  // Los belenes no tienen talla: en la cesta van con talla ''.
  const pagadas = metas.flatMap(({ l, m }) => (m?.slug ? [{ slug: m.slug, talla: m.talla ?? '', cantidad: l.quantity }] : []));
  const plazo = plazoPedido(metas.map(({ m }) => (m?.tipo === 'mano' ? 'mano' : 'pod')));
  const hayMano = metas.some(({ m }) => m?.tipo === 'mano');

  if (cpSinEnvio(dir?.postal_code)) {
    return (
      <Marco titulo="No llegamos a tu dirección">
        {/* La cesta se queda: puede volver a pedirlo con otra dirección. */}
        <p>
          Lo sentimos{nombre ? `, ${nombre}` : ''}: por ahora solo enviamos a la península y Baleares, y el código postal {dir?.postal_code} es de
          Canarias, Ceuta o Melilla.
        </p>
        <p>
          Te devolvemos el pago completo ({eur(s.amount_total ?? 0)}) automáticamente y no se prepara nada. Te lo confirmamos por correo
          {email ? ` a ${email}` : ''}.
        </p>
      </Marco>
    );
  }

  // Si lo hecho a mano se agotó mientras pagaba, el webhook ya lo ha devuelto: no se enseña como «en marcha».
  if (hayMano && (await estadoReserva(s.id)) === 'faltan') {
    return (
      <Marco titulo="Se ha agotado mientras pagabas">
        <p>
          Lo sentimos{nombre ? `, ${nombre}` : ''}: mientras pagabas, alguien se ha llevado la última unidad de una de las figuras. Cada una se teje a
          mano y ahora mismo no hay más.
        </p>
        <p>
          No hemos preparado nada del pedido y te devolvemos el pago completo ({eur(s.amount_total ?? 0)}). Según tu banco, tarda de 5 a 10 días en verse.
          Te lo hemos explicado por correo{email ? ` a ${email}` : ''}.
        </p>
      </Marco>
    );
  }

  const creado = new Date(s.created * 1000);
  const envioCent = s.total_details?.amount_shipping ?? 0;

  return (
    <Marco titulo={nombre ? `Gracias, ${nombre}` : 'Gracias por tu pedido'}>
      <VaciarRopa sesion={s.id} pagadas={pagadas} />
      <p className="text-lg text-texto">
        Tu pedido <strong>{referencia}</strong> está en marcha. {plazo.texto}
      </p>
      {hayMano && (
        <p className="text-sm text-texto/65">
          Si justo mientras pagabas alguien se ha llevado la última figura, te avisamos por correo y te devolvemos todo el pago.
        </p>
      )}

      <div className="border-y border-black/[0.08] py-4">
        <ul className="space-y-2">
          {lineas.map((l) => (
            <li key={l.id} className="flex justify-between gap-4">
              <span>
                {l.quantity} × {l.description}
              </span>
              <span className="tabular-nums text-texto">{eur(l.amount_total)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-4 text-texto/65">
            <span>Envío</span>
            <span className="tabular-nums">{envioCent ? eur(envioCent) : 'Gratis'}</span>
          </li>
          <li className="flex justify-between gap-4 border-t border-black/[0.08] pt-2 font-semibold text-texto">
            <span>Total pagado (IVA incluido)</span>
            <span className="tabular-nums">{eur(s.amount_total ?? 0)}</span>
          </li>
        </ul>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {dir && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-texto/55">Se envía a</dt>
            <dd className="mt-1">
              {envio?.name && <span className="block">{envio.name}</span>}
              <span className="block">{dir.line1}</span>
              {dir.line2 && <span className="block">{dir.line2}</span>}
              <span className="block">
                {dir.postal_code} {dir.city}
              </span>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-texto/55">Cuándo llega</dt>
          <dd className="mt-1">
            Entre el {fecha(masLaborables(creado, plazo.min))} y el {fecha(masLaborables(creado, plazo.max))}, más o menos ({plazo.min} a{' '}
            {plazo.max} días laborables).
          </dd>
        </div>
      </dl>

      <p>
        {email ? `En unos minutos te llega la confirmación a ${email}. ` : ''}Cuando salga, te escribimos con el número de seguimiento. Cualquier duda,
        en{' '}
        <a href={`mailto:${CORREO}`} className="underline underline-offset-2">
          {CORREO}
        </a>
        .
      </p>
    </Marco>
  );
}
