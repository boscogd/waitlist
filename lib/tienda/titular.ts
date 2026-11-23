// Quién vende en la tienda (art. 97.1 TRLGDCU y art. 10 LSSI-CE).
//
// Aún no está decidido si se vende como sociedad o como autónomo, así que los datos
// se leen de variables de entorno y NO hay valores de relleno: si falta algo, la tienda
// no puede vender y las condiciones lo avisan arriba.
//
// Solo para el servidor: en un componente de cliente process.env llega vacío.
// Si cambian las variables en Vercel, hay que volver a desplegar (las páginas se generan al construir).

function leer(nombre: string): string | undefined {
  const valor = process.env[nombre]?.trim();
  return valor ? valor : undefined;
}

export type Titular = {
  /** Nombre y apellidos (autónomo) o denominación social (sociedad). */
  nombre?: string;
  /** NIF del autónomo o CIF de la sociedad. */
  nif?: string;
  /** Dirección postal completa. */
  direccion?: string;
  /** Correo de atención al cliente. */
  correo: string;
  /** Teléfono de atención al cliente (opcional por ahora). */
  telefono?: string;
  /** Solo sociedades: datos de inscripción en el Registro Mercantil. */
  registro?: string;
};

export const TITULAR: Titular = {
  nombre: leer('TIENDA_TITULAR_NOMBRE'),
  nif: leer('TIENDA_TITULAR_NIF'),
  direccion: leer('TIENDA_TITULAR_DIRECCION'),
  correo: leer('TIENDA_CORREO') ?? 'info@refugioenlapalabra.com',
  telefono: leer('TIENDA_TITULAR_TELEFONO'),
  registro: leer('TIENDA_TITULAR_REGISTRO'),
};

/** Qué datos obligatorios del titular faltan (vacío si están todos). */
export function faltanDelTitular(): string[] {
  const faltan: string[] = [];
  if (!TITULAR.nombre) faltan.push('nombre o razón social');
  if (!TITULAR.nif) faltan.push('NIF');
  if (!TITULAR.direccion) faltan.push('dirección');
  return faltan;
}

/** true si están todos los datos sin los que no se puede vender. */
export function titularCompleto(): boolean {
  return faltanDelTitular().length === 0;
}
