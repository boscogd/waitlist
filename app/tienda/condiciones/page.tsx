import type { Metadata } from 'next';
import Link from 'next/link';
import { TITULAR, faltanDelTitular } from '@/lib/tienda/titular';

export const metadata: Metadata = {
  title: 'Condiciones de venta',
  description:
    'Quién vende, precios, envíos, devoluciones en 14 días, garantía de 3 años y tus datos en las compras de la tienda de Refugio en la Palabra.',
  robots: { index: false, follow: false },
};

// Lo que de verdad se vende hoy. Si cambia, cambiar aquí y la fecha del pie.
const ENVIO = { coste: '4,90 €', gratisDesde: '75 €' };

const INDICE = [
  { ancla: 'vendedor', titulo: 'Quién vende' },
  { ancla: 'productos', titulo: 'Qué vendemos' },
  { ancla: 'precios', titulo: 'Precios y pago' },
  { ancla: 'pedido', titulo: 'Cómo se hace un pedido' },
  { ancla: 'envios', titulo: 'Envíos y plazos' },
  { ancla: 'desistimiento', titulo: 'Devoluciones: 14 días para desistir' },
  { ancla: 'formulario', titulo: 'Formulario de desistimiento' },
  { ancla: 'garantia', titulo: 'Garantía y prendas defectuosas' },
  { ancla: 'privacidad', titulo: 'Tus datos' },
  { ancla: 'reclamaciones', titulo: 'Reclamaciones y ley aplicable' },
];

const enlace = 'text-azul underline decoration-azul/30 underline-offset-2 hover:decoration-azul';

/** Hueco visible para un dato del titular que aún no está: nunca se rellena con nada inventado. */
function Dato({ valor }: { valor?: string }) {
  return valor ? <>{valor}</> : <span className="font-medium text-red-700">falta este dato</span>;
}

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-28 border-t border-black/[0.08] pt-10">
      <h2 id={`${id}-titulo`} className="tienda-titular text-3xl text-azul sm:text-4xl">
        {titulo}
      </h2>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

export default function CondicionesDeVenta() {
  const faltan = faltanDelTitular();
  const correo = TITULAR.correo;
  const mailto = (asunto: string) => `mailto:${correo}?subject=${encodeURIComponent(asunto)}`;

  return (
    <article className="mx-auto max-w-[65ch] px-4 pb-20 pt-10 text-base leading-[1.7] text-texto/85 sm:pt-14">
      {faltan.length > 0 && (
        <div role="alert" className="mb-10 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-[15px] text-red-900">
          <p className="font-semibold">Faltan los datos del titular: esta tienda aún no puede vender.</p>
          <p className="mt-1">Falta: {faltan.join(', ')}.</p>
        </div>
      )}

      <nav aria-label="Estás en" className="text-sm text-texto/55">
        <Link href="/tienda" className="hover:text-texto">
          Tienda
        </Link>
        <span aria-hidden="true"> / </span>
        Condiciones de venta
      </nav>
      <h1 className="tienda-titular mt-3 text-5xl text-azul sm:text-6xl">Condiciones de venta</h1>

      <p className="mt-6">
        Estas condiciones valen para lo que compres en la tienda de Refugio en la Palabra
        (refugioenlapalabra.com/tienda). Están escritas para que se entiendan; donde hace falta, citamos la ley. Para
        usar la web y la app siguen valiendo el{' '}
        <Link href="/legal" className={enlace}>
          aviso legal y los términos de uso
        </Link>{' '}
        y la{' '}
        <Link href="/privacidad" className={enlace}>
          política de privacidad
        </Link>
        ; para las compras de la tienda mandan estas.
      </p>

      <nav aria-label="En esta página" className="mt-8 rounded-lg bg-black/[0.03] px-5 py-4">
        <p className="text-sm font-semibold text-texto">En esta página</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px]">
          {INDICE.map((s) => (
            <li key={s.ancla}>
              <a href={`#${s.ancla}`} className={enlace}>
                {s.titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-12">
        <Seccion id="vendedor" titulo="Quién vende">
          <p>Te vende quien aparece aquí (art. 97.1 del TRLGDCU y art. 10 de la LSSI):</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-black/[0.08] px-5 py-4 text-[15px]">
            <dt className="text-texto/55">Titular</dt>
            <dd>
              <Dato valor={TITULAR.nombre} />
            </dd>
            <dt className="text-texto/55">NIF</dt>
            <dd>
              <Dato valor={TITULAR.nif} />
            </dd>
            <dt className="text-texto/55">Dirección</dt>
            <dd>
              <Dato valor={TITULAR.direccion} />
            </dd>
            {TITULAR.registro && (
              <>
                <dt className="text-texto/55">Registro</dt>
                <dd>{TITULAR.registro}</dd>
              </>
            )}
            <dt className="text-texto/55">Correo</dt>
            <dd>
              <a href={`mailto:${correo}`} className={enlace}>
                {correo}
              </a>
            </dd>
            {TITULAR.telefono && (
              <>
                <dt className="text-texto/55">Teléfono</dt>
                <dd>{TITULAR.telefono}</dd>
              </>
            )}
            <dt className="text-texto/55">Marca</dt>
            <dd>Refugio en la Palabra</dd>
          </dl>
          <p>
            Para cualquier duda sobre un pedido, escríbenos a{' '}
            <a href={`mailto:${correo}`} className={enlace}>
              {correo}
            </a>
            . Contestamos en días laborables.
          </p>
        </Seccion>

        <Seccion id="productos" titulo="Qué vendemos">
          <p>Por ahora solo vendemos dos prendas:</p>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="font-semibold text-texto">Camiseta.</strong> Modelo Stanley/Stella Creator 2.0, 100 %
              algodón orgánico. 25 €; en talla 2XL, 27 €.
            </li>
            <li>
              <strong className="font-semibold text-texto">Sudadera.</strong> Modelo SOL&apos;S Comet, 80 % algodón
              orgánico y 20 % poliéster reciclado. 39,90 €; en talla 2XL, 41,90 €.
            </li>
          </ul>
          <p>
            <strong className="font-semibold text-texto">Lo demás que ves en la tienda es de muestra</strong> (los belenes
            de ganchillo, los rosarios y el resto de piezas): todavía no está a la venta y no se puede pedir.
          </p>
          <p>
            Cada prenda se fabrica cuando la pides: la imprime Printful, nuestro proveedor, casi siempre en su taller de Barcelona (si una talla no está allí, en el de Letonia, y puede tardar algún día más). No
            tenemos almacén. Las tallas, medidas y colores están en la ficha de cada prenda. El color real puede variar un
            poco respecto a lo que ves en la pantalla.
          </p>
          <p>
            El diseño es de catálogo, el mismo para todos: no es una prenda personalizada para ti. Por eso puedes
            devolverla como cualquier otra compra (lo explicamos en{' '}
            <a href="#desistimiento" className={enlace}>
              devoluciones
            </a>
            ).
          </p>
        </Seccion>

        <Seccion id="precios" titulo="Precios y pago">
          <ul className="list-disc space-y-3 pl-5">
            <li>Los precios están en euros e incluyen el IVA (21 %).</li>
            <li>
              El envío se suma aparte: {ENVIO.coste} por pedido, y gratis si los productos suman {ENVIO.gratisDesde} o más.
            </li>
            <li>Antes de pagar ves el precio total, con impuestos y envío. No hay ningún cargo más.</li>
            <li>
              Pagas con tarjeta, Apple Pay o Google Pay a través de Stripe, que gestiona el cobro de forma segura. Nosotros
              no vemos ni guardamos el número de tu tarjeta. El cargo se hace en el momento del pedido.
            </li>
            <li>Vale el precio que aparece cuando haces el pedido, aunque después cambie.</li>
            <li>
              Si necesitas factura, pídenosla en{' '}
              <a href={mailto('Factura')} className={enlace}>
                {correo}
              </a>{' '}
              con tus datos fiscales.
            </li>
          </ul>
        </Seccion>

        <Seccion id="pedido" titulo="Cómo se hace un pedido">
          <ol className="list-decimal space-y-3 pl-5">
            <li>Eliges la prenda y la talla y la añades a la cesta.</li>
            <li>En la cesta revisas lo que llevas: puedes cambiar cantidades o quitar prendas.</li>
            <li>
              Pasas a la página de pago de Stripe, donde pones tu correo, nombre, dirección y teléfono. Antes de pagar
              puedes corregir cualquier dato o volver a la cesta.
            </li>
            <li>
              Pulsas <strong className="font-semibold text-texto">«Pagar»</strong>. Ese botón te obliga a pagar: al
              pulsarlo haces el pedido.
            </li>
            <li>
              Te mandamos un correo que confirma el pedido, con el resumen y el enlace a estas condiciones. Ese correo es
              tu justificante (art. 98.7 TRLGDCU y art. 28 LSSI). Guardamos un registro del pedido; si quieres una copia,
              pídenosla.
            </li>
          </ol>
          <p>El contrato se hace en español.</p>
        </Seccion>

        <Seccion id="envios" titulo="Envíos y plazos">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              Enviamos a la península y a Baleares. <strong className="font-semibold text-texto">No enviamos</strong> a
              Canarias, Ceuta, Melilla ni fuera de España. Si nos llega un pedido con dirección en esos sitios, lo
              cancelamos y te devolvemos todo lo que pagaste.
            </li>
            <li>
              Cuesta {ENVIO.coste} por pedido, y es gratis si los productos suman {ENVIO.gratisDesde} o más.
            </li>
            <li>
              Fabricar la prenda lleva de 2 a 5 días laborables. Con el transporte, el pedido suele llegarte en 5 a 10
              días laborables desde que lo haces. Cuando sale, te mandamos el número de seguimiento.
            </li>
            <li>
              Si se retrasa, escríbenos. Si tampoco podemos entregártelo en el plazo adicional que nos des, puedes
              cancelar el pedido y te devolvemos todo sin demora (art. 66 bis TRLGDCU).
            </li>
            <li>
              Hasta que lo recibes, el paquete viaja por nuestra cuenta (art. 66 ter TRLGDCU): si se pierde o llega
              dañado, te mandamos otro o te devolvemos el dinero.
            </li>
            <li>
              Revisa bien la dirección. Si el paquete vuelve porque la dirección estaba mal o incompleta, te avisamos para
              reenviarlo; ese segundo envío lo pagas tú.
            </li>
          </ul>
        </Seccion>

        <Seccion id="desistimiento" titulo="Devoluciones: 14 días para desistir">
          <p>
            Tienes <strong className="font-semibold text-texto">14 días naturales</strong> para echarte atrás y devolver
            la compra sin dar explicaciones (arts. 102 y siguientes del TRLGDCU). Los 14 días empiezan el día en que
            recibes la prenda, tú o quien tú digas. Si el pedido llega en varios paquetes, cuentan desde que recibes el
            último.
          </p>
          <h3 className="pt-2 text-lg font-semibold text-texto">Cómo hacerlo</h3>
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              Avísanos antes de que pasen los 14 días. Basta un correo a{' '}
              <a href={mailto('Desistimiento')} className={enlace}>
                {correo}
              </a>{' '}
              diciendo que quieres desistir, con tu número de pedido. Puedes usar el{' '}
              <a href="#formulario" className={enlace}>
                formulario de abajo
              </a>
              , pero no es obligatorio. Vale con que nos mandes el aviso dentro de plazo.
            </li>
            <li>
              Envíanos la prenda en los 14 días naturales siguientes a tu aviso, a la dirección que te indicaremos al
              contestarte.
            </li>
            <li>
              <strong className="font-semibold text-texto">El coste de enviarla de vuelta lo pagas tú</strong> (art.
              108.1 TRLGDCU). Es lo que cueste mandar un paquete pequeño por mensajería o correo dentro de España.
            </li>
          </ol>
          <h3 className="pt-2 text-lg font-semibold text-texto">El reembolso</h3>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              Te devolvemos lo que pagaste por las prendas en un máximo de 14 días naturales desde que nos avisas (art.
              107 TRLGDCU). Si devuelves el pedido entero, también el envío que pagaste.
            </li>
            <li>
              Podemos esperar a tener la prenda, o a que nos mandes el justificante de que la has enviado, antes de
              devolverte el dinero: lo que ocurra primero.
            </li>
            <li>Te lo devolvemos por el mismo medio con el que pagaste, sin ningún coste para ti.</li>
            <li>
              Puedes probarte la prenda como lo harías en una tienda. Si la has usado, lavado o estropeado más allá de
              eso, podemos descontar lo que haya perdido de valor (art. 108.4 TRLGDCU).
            </li>
          </ul>
          <p className="text-[15px] text-texto/70">
            Aunque cada prenda se fabrica cuando la pides, el diseño es de catálogo y no se hace a tu medida ni con tus
            datos. Por eso no se aplica la excepción para productos personalizados del art. 103.c del TRLGDCU y conservas
            este derecho.
          </p>
        </Seccion>

        <Seccion id="formulario" titulo="Formulario de desistimiento">
          <p>
            Es el modelo oficial (anexo B del TRLGDCU). Puedes copiarlo en un correo a{' '}
            <a href={mailto('Desistimiento')} className={enlace}>
              {correo}
            </a>{' '}
            o mandarlo en papel a la dirección del titular. Solo hace falta si quieres desistir.
          </p>
          <div className="space-y-3 rounded-lg border border-black/[0.12] bg-black/[0.02] px-5 py-5 text-[15px]">
            <p>
              A la atención de: <Dato valor={TITULAR.nombre} />, <Dato valor={TITULAR.direccion} />, {correo}.
            </p>
            <p>
              Por la presente le comunico/comunicamos (*) que desisto de mi/desistimos de nuestro (*) contrato de venta
              del siguiente bien:
            </p>
            <p>— Pedido el / recibido el (*):</p>
            <p>— Nombre del consumidor o de los consumidores:</p>
            <p>— Domicilio del consumidor o de los consumidores:</p>
            <p>— Firma del consumidor o de los consumidores (solo si el presente formulario se presenta en papel):</p>
            <p>— Fecha:</p>
            <p className="text-texto/60">(*) Táchese lo que no proceda.</p>
          </div>
        </Seccion>

        <Seccion id="garantia" titulo="Garantía y prendas defectuosas">
          <p>
            Si la prenda llega con un defecto (la impresión mal hecha, una costura rota, una mancha) o no es la que
            pediste (otra talla, otro color, otra prenda), te mandamos otra o te devolvemos el dinero, sin ningún coste
            para ti, envíos incluidos.
          </p>
          <p>
            Para eso, escríbenos a{' '}
            <a href={mailto('Prenda defectuosa')} className={enlace}>
              {correo}
            </a>{' '}
            con una foto del problema y tu número de pedido. Te pedimos que lo hagas mejor en los 30 días siguientes a
            recibirla, porque es el plazo en que podemos reclamárselo al fabricante. Eso no recorta tu garantía legal,
            que sigue siendo de 3 años.
          </p>
          <h3 className="pt-2 text-lg font-semibold text-texto">Garantía legal de 3 años</h3>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              Respondemos de cualquier falta de conformidad que aparezca en los 3 años siguientes a la entrega (art. 120
              TRLGDCU).
            </li>
            <li>
              Si el defecto aparece en los 2 primeros años, se da por hecho que ya venía así, salvo que se demuestre lo
              contrario (art. 121 TRLGDCU).
            </li>
            <li>
              Puedes pedir que se repare o se cambie la prenda; si no es posible, que se rebaje el precio o se te devuelva
              el dinero (arts. 118 y 119 TRLGDCU). Siempre gratis para ti.
            </li>
            <li>
              No es un defecto el desgaste normal por uso y lavado, ni el daño por no seguir las instrucciones de la
              etiqueta.
            </li>
          </ul>
        </Seccion>

        <Seccion id="privacidad" titulo="Tus datos">
          <p>
            Para atender tu pedido tratamos tu <strong className="font-semibold text-texto">nombre, correo, teléfono y
            dirección</strong>. El responsable es el titular de la tienda (ver{' '}
            <a href="#vendedor" className={enlace}>
              quién vende
            </a>
            ).
          </p>
          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong className="font-semibold text-texto">Para qué:</strong> cobrar, fabricar y enviar el pedido,
              avisarte de cómo va, atender devoluciones y garantías, y cumplir las obligaciones fiscales y contables.
            </li>
            <li>
              <strong className="font-semibold text-texto">Por qué podemos:</strong> porque hace falta para cumplir el
              contrato de compra (art. 6.1.b RGPD) y porque la ley nos obliga a guardar las facturas (art. 6.1.c RGPD).
            </li>
            <li>
              <strong className="font-semibold text-texto">Publicidad:</strong> comprar no te apunta a ningún boletín. No
              usamos estos datos para mandarte publicidad salvo que tú te apuntes.
            </li>
            <li>
              <strong className="font-semibold text-texto">Quién más los ve:</strong> Stripe, que cobra el pago, y
              Printful, que fabrica la prenda y la entrega a la empresa de transporte (que recibe tu nombre, dirección y
              teléfono). También los proveedores con los que alojamos la web y enviamos los correos. Todos tratan los
              datos por encargo nuestro y solo para esto.
            </li>
            <li>
              <strong className="font-semibold text-texto">Fuera de la UE:</strong> Printful es una empresa de Estados
              Unidos, aunque fabrica en centros de la UE, así que tus datos del pedido pueden tratarse en Estados Unidos.
              Stripe también puede tratarlos allí. Esas transferencias se hacen con las garantías que exige el RGPD
              (cláusulas contractuales tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU., según el
              caso).
            </li>
            <li>
              <strong className="font-semibold text-texto">Cuánto tiempo:</strong> mientras dure el pedido y su garantía,
              y después solo lo que exige la ley fiscal y mercantil (hasta 6 años, art. 30 del Código de Comercio).
            </li>
            <li>
              <strong className="font-semibold text-texto">Tus derechos:</strong> puedes pedir acceder a tus datos,
              corregirlos, borrarlos, limitar su uso, oponerte o llevártelos, escribiendo a{' '}
              <a href={mailto('Protección de datos')} className={enlace}>
                {correo}
              </a>
              . Si no te atendemos bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
            </li>
          </ul>
          <p>
            Lo demás sobre cómo tratamos los datos está en la{' '}
            <Link href="/privacidad" className={enlace}>
              política de privacidad
            </Link>{' '}
            del sitio.
          </p>
        </Seccion>

        <Seccion id="reclamaciones" titulo="Reclamaciones y ley aplicable">
          <ul className="list-disc space-y-3 pl-5">
            <li>
              Si algo va mal, escríbenos primero a{' '}
              <a href={mailto('Reclamación')} className={enlace}>
                {correo}
              </a>
              : casi todo se arregla así.
            </li>
            <li>
              Tenemos a tu disposición hojas oficiales de quejas y reclamaciones de la Junta de Andalucía. Pídenosla por
              correo y te la mandamos. También puedes acudir a la oficina de consumo de tu ayuntamiento (OMIC) o al
              servicio de consumo de tu comunidad autónoma.
            </li>
            <li>
              No estamos adheridos al Sistema Arbitral de Consumo ni a ninguna otra entidad de resolución alternativa de
              litigios (Ley 7/2017).
            </li>
            <li>
              La plataforma europea de resolución de litigios en línea (ODR) cerró el 20 de julio de 2025, así que no la
              enlazamos.
            </li>
            <li>
              Estas condiciones se rigen por la ley española. Como consumidor, puedes reclamar ante los juzgados de tu
              domicilio.
            </li>
            <li>
              Podemos cambiar estas condiciones. A tu pedido se le aplican las que estaban publicadas el día que lo
              hiciste.
            </li>
          </ul>
        </Seccion>
      </div>

      <p className="mt-14 border-t border-black/[0.08] pt-6 text-sm text-texto/60">
        Última actualización: 23 de noviembre de 2026.
      </p>
    </article>
  );
}
