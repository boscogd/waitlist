/**
 * Genera un código único para la waitlist
 * Formato: REFUGIO-XXXXX (donde X es un carácter alfanumérico)
 * Usa crypto.getRandomValues() para aleatoriedad criptográfica
 */
export function generateWaitlistCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomValues = new Uint8Array(5);
  crypto.getRandomValues(randomValues);

  let code = 'REFUGIO-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(randomValues[i] % chars.length);
  }

  return code;
}

/**
 * Valida un email con regex más estricta
 * Requiere al menos 2 caracteres después del último punto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}
