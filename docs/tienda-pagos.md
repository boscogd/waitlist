# Tienda: venta real de la ropa (Stripe + Printful)

Solo la ropa bajo demanda se vende de verdad: **Camiseta «Fiat»**, **Camiseta del Belén** y **Sudadera Refugio**. La cobra Stripe Checkout y la fabrica y envía Printful (centro de Barcelona). Lo demás de `/tienda` (belenes, devoción y el polar) sigue siendo de muestra.

Mientras `NEXT_PUBLIC_TIENDA_PAGOS` no valga `1`, la tienda entera sigue siendo la demo de siempre y no se cobra nada.

## Cómo funciona

1. La cesta manda a `POST /api/tienda/checkout` solo slug, talla y cantidad. El servidor pone los precios desde `lib/tienda/catalogo.ts` (la 2XL vale 2 € más), calcula el envío (4,90 €, gratis desde 75 €) y abre Stripe Checkout. Máximo 9 por línea y 20 prendas por pedido.
2. Stripe avisa a `POST /api/tienda/stripe-webhook` (`checkout.session.completed`). Se comprueba la firma, se vuelve a leer la sesión y:
   - si el código postal es de Canarias, Ceuta o Melilla (35, 38, 51, 52), se devuelve todo el pago y se escribe al cliente;
   - si no, se crea el pedido en Printful con `external_id = rp-` + 24 hex de sha256(id de la sesión). Si Stripe repite el aviso, no se duplica.
   - Correo al cliente con el resumen y aviso a `TIENDA_AVISOS_EMAIL`. Si Printful falla, responde 500 (Stripe lo reintenta durante 3 días) y avisa.
3. Printful avisa a `POST /api/tienda/printful-webhook?token=…`. Se vuelve a leer el pedido de la API y, si ha salido, se manda al cliente el correo con el seguimiento; si falla, se cancela o se retiene, aviso interno.
4. Stripe vuelve a `/tienda/gracias?session_id=…`, que enseña el resumen y quita la ropa pagada de la cesta.

**Por defecto los pedidos se crean en Printful en BORRADOR** (no se cobra ni se fabrica). Solo con `PRINTFUL_CONFIRMAR=1` se confirman solos.

## Variables de entorno

| Variable | Qué es |
| --- | --- |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (`sk_test_…` en pruebas, `sk_live_…` en real). |
| `STRIPE_WEBHOOK_SECRET` | Secreto del endpoint del webhook (`whsec_…`). Es distinto en modo prueba y en real. |
| `PRINTFUL_API_TOKEN` | Token privado de la API de Printful (Developers → Private tokens), con permiso de pedidos y webhooks. |
| `PRINTFUL_STORE_ID` | Opcional. Id de la tienda de Printful si el token sirve para varias. |
| `PRINTFUL_WEBHOOK_TOKEN` | Cadena aleatoria larga (mín. 16) que va en la URL del webhook de Printful. |
| `PRINTFUL_CONFIRMAR` | `1` para que los pedidos se confirmen solos (se cobran y fabrican). Sin ella, borrador. |
| `TIENDA_AVISOS_EMAIL` | Correo que recibe los avisos internos (pedidos nuevos y problemas). |
| `NEXT_PUBLIC_TIENDA_PAGOS` | `1` para activar el cobro real de la ropa. Se fija al construir: tras cambiarla, hay que volver a desplegar. |
| `TIENDA_URL_PUBLICA` | Opcional. De dónde descarga Printful los PNG de impresión y la URL del webhook. Por defecto `https://www.refugioenlapalabra.com`. |
| `TIENDA_CORREO` | Opcional. Correo de atención (responder a, albarán). Por defecto `info@refugioenlapalabra.com`. |

Además, el checkout no se abre si faltan los datos del vendedor (`TIENDA_TITULAR_NOMBRE`, `TIENDA_TITULAR_NIF`, `TIENDA_TITULAR_DIRECCION`, ver `lib/tienda/titular.ts`): sin vendedor identificado no se puede vender. Los correos salen con `RESEND_API_KEY` y `RESEND_FROM_EMAIL`, como los demás.

## Puesta en marcha

### 1. Cuentas
1. **Stripe**: crea la cuenta (empresa o autónomo, con los mismos datos que `TIENDA_TITULAR_*`). Deja el panel en **modo de prueba**.
2. En Stripe → Configuración → Métodos de pago, deja activos tarjeta, Apple Pay y Google Pay (Checkout enseña los que estén activos).
3. **Printful**: crea la cuenta y una tienda de tipo «Manual order platform / API». Añade un método de pago (solo se usa al confirmar pedidos).
4. En Printful → Developers, crea un **token privado** con acceso a pedidos y webhooks.

### 2. Claves de prueba en Vercel (Preview) o en `.env.local`
```
STRIPE_SECRET_KEY=sk_test_…
PRINTFUL_API_TOKEN=…
PRINTFUL_WEBHOOK_TOKEN=<node -e "console.log(require('crypto').randomBytes(24).toString('hex'))">
TIENDA_AVISOS_EMAIL=…
NEXT_PUBLIC_TIENDA_PAGOS=1
# PRINTFUL_CONFIRMAR sin poner: pedidos en borrador
```

### 3. Webhook de Stripe
1. Stripe → Desarrolladores → Webhooks → **Añadir endpoint**.
2. URL: `https://<dominio>/api/tienda/stripe-webhook`.
3. Eventos: `checkout.session.completed` y `refund.failed` (avisa si falla un reembolso automático); si activas métodos de pago diferidos, también `checkout.session.async_payment_succeeded`.
4. Copia el **secreto de firma** (`whsec_…`) a `STRIPE_WEBHOOK_SECRET` y vuelve a desplegar.

Para probar en local sin dominio: `stripe listen --forward-to localhost:3000/api/tienda/stripe-webhook` (Stripe CLI) te da un `whsec_…` temporal.

### 4. Webhook de Printful (una vez)
Con `PRINTFUL_API_TOKEN` y `PRINTFUL_WEBHOOK_TOKEN` en `.env.local`:
```
node --env-file=.env.local scripts/tienda-printful-webhook.mjs --ver     # ver el que hay
node --env-file=.env.local scripts/tienda-printful-webhook.mjs           # registrar (producción)
node --env-file=.env.local scripts/tienda-printful-webhook.mjs --base https://<preview>.vercel.app
```
Cada tienda de Printful tiene un solo webhook: registrar otro sustituye al anterior. El `PRINTFUL_WEBHOOK_TOKEN` del entorno de Vercel tiene que ser el mismo que se registró.

### 5. Archivos de impresión
Printful descarga los PNG de `https://<TIENDA_URL_PUBLICA>/tienda/impresion/*.png`: **tienen que estar publicados** antes del primer pedido (en local no los alcanza). El lienzo del PNG debe tener la proporción del área de impresión del frente (Printful lo encaja entero en ella): el diseño pequeño en el pecho se consigue dejando transparente el resto del lienzo. Compruébalo en el primer pedido en borrador con la vista previa de Printful.

### 6. Prueba completa (sin gastar)
1. Mete en la cesta una camiseta y la sudadera en 2XL → **Ir a pagar**.
2. En Stripe Checkout: tarjeta `4242 4242 4242 4242`, cualquier fecha futura y CVC, una dirección de Madrid (CP 28001).
3. Comprueba: vuelves a `/tienda/gracias` con el resumen; la ropa sale de la cesta; llega el correo al cliente y el aviso a `TIENDA_AVISOS_EMAIL`; en Printful → Pedidos hay un **borrador** con las tallas y el PNG bien colocado.
4. Repite con CP 35001 (Las Palmas): el pago aparece reembolsado en Stripe, llega el correo de devolución y en Printful no hay pedido.
5. Borra los borradores de prueba en Printful.

### 7. Pasar a real
1. En Stripe, activa la cuenta (datos fiscales y bancarios) y crea en **modo real** el mismo webhook (sale otro `whsec_…`).
2. En Vercel (Production): `STRIPE_SECRET_KEY=sk_live_…`, el `STRIPE_WEBHOOK_SECRET` real, `NEXT_PUBLIC_TIENDA_PAGOS=1` y los `TIENDA_TITULAR_*`.
3. Primeros pedidos: deja `PRINTFUL_CONFIRMAR` sin poner y confirma a mano cada borrador en Printful tras revisarlo. Cuando te fíes, pon `PRINTFUL_CONFIRMAR=1`.
4. Vuelve a desplegar (las variables `NEXT_PUBLIC_*` se fijan al construir).

## Prendas y variantes de Printful (catálogo v1)

| Producto | Prenda | Color | S | M | L | XL | 2XL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Camiseta «Fiat» y del Belén | Stanley/Stella STTU169 (producto 456) | White | 11864 | 11865 | 11866 | 11867 | 11868 |
| Sudadera Refugio | SOL'S Comet 03574 (producto 506) | French Navy | 12709 | 12710 | 12711 | 12712 | 12713 |

La sudadera en 2XL (12713) no figura en stock en el centro de Barcelona (EU_ES), sí en el de Letonia (EU_LV): Printful la mandaría desde allí y podría tardar algún día más. Para revisar: `https://api.printful.com/products/506` (público).

## Qué no hace (todavía)
- No guarda los pedidos en una base de datos: la verdad está en Stripe y Printful.
- No emite factura: Stripe manda el recibo. Si hace falta factura completa, activar «Facturas tras el pago» en Checkout (`invoice_creation`) o hacerla aparte.
- Si el proceso se cae entre crear el pedido en Printful y mandar el correo de confirmación, el reintento de Stripe ve el pedido creado y no manda el correo (el aviso de envío con seguimiento sí llega).
