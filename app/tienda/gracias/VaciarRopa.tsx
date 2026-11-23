'use client';

// Tras un pago correcto, descuenta de la cesta lo que se ha pagado en esa sesión
// (una sola vez: volver a este justificante más tarde no quita nada nuevo).
// Espera a que la cesta guardada se haya leído: si no, la lectura la volvería a poner.
import { useEffect } from 'react';
import { useCesta } from '../_componentes/Cesta';

export default function VaciarRopa({ sesion, pagadas }: { sesion: string; pagadas: { slug: string; talla: string; cantidad: number }[] }) {
  const { cargada, quitarPagadas } = useCesta();
  useEffect(() => {
    if (cargada) quitarPagadas(sesion, pagadas);
  }, [cargada, quitarPagadas, sesion, pagadas]);
  return null;
}
