#!/usr/bin/env node
// =====================================================
// Registra el webhook de Printful para la tienda (una sola vez).
// =====================================================
// Uso (desde la raíz del proyecto, con las variables en .env.local):
//
//   node --env-file=.env.local scripts/tienda-printful-webhook.mjs            → registra
//   node --env-file=.env.local scripts/tienda-printful-webhook.mjs --ver      → solo enseña lo que hay
//   node --env-file=.env.local scripts/tienda-printful-webhook.mjs --base https://otra-url.vercel.app
//
// Lee PRINTFUL_API_TOKEN, PRINTFUL_STORE_ID (opcional) y PRINTFUL_WEBHOOK_TOKEN.
// Ojo: en la API v1 cada tienda tiene UNA configuración de webhook; registrar
// otra sustituye a la anterior.

const API = 'https://api.printful.com';
const EVENTOS = ['package_shipped', 'order_failed', 'order_canceled', 'order_put_hold'];

const args = process.argv.slice(2);
const soloVer = args.includes('--ver');
const iBase = args.indexOf('--base');
const base = (iBase >= 0 ? args[iBase + 1] : process.env.TIENDA_URL_PUBLICA || 'https://www.refugioenlapalabra.com').replace(/\/+$/, '');

const token = process.env.PRINTFUL_API_TOKEN;
const tienda = process.env.PRINTFUL_STORE_ID;
const secreto = process.env.PRINTFUL_WEBHOOK_TOKEN;

function salir(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!token) salir('Falta PRINTFUL_API_TOKEN en el entorno (¿has pasado --env-file=.env.local?).');
if (!soloVer && (!secreto || secreto.length < 16)) {
  salir('Falta PRINTFUL_WEBHOOK_TOKEN (o tiene menos de 16 caracteres). Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(24).toString(\'hex\'))"');
}
if (!/^https:\/\//.test(base)) salir(`La URL base tiene que ser https (Printful no llama a localhost): ${base}`);

async function llamar(metodo, ruta, cuerpo) {
  const res = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(tienda ? { 'X-PF-Store-Id': tienda } : {}),
      ...(cuerpo ? { 'Content-Type': 'application/json' } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) salir(`Printful respondió ${res.status}: ${json?.error?.message || json?.result || ''}`);
  return json.result;
}

// No se enseña el token entero en pantalla.
const ocultar = (url) => String(url ?? '').replace(/token=[^&]+/, 'token=…');

const actual = await llamar('GET', '/webhooks');
console.log('Webhook actual:', actual?.url ? `${ocultar(actual.url)} (${(actual.types || []).join(', ')})` : 'ninguno');
if (soloVer) process.exit(0);

const url = `${base}/api/tienda/printful-webhook?token=${encodeURIComponent(secreto)}`;
const nuevo = await llamar('POST', '/webhooks', { url, types: EVENTOS });
console.log(`\n✓ Registrado: ${ocultar(nuevo?.url)}\n  Eventos: ${(nuevo?.types || []).join(', ')}\n`);
