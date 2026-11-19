'use client';

// Formulario de encargos para grupos (demo: no envía nada).
import { useState } from 'react';

const TIPOS = ['Grupo de confirmación', 'Hermandad o cofradía', 'Campamento o convivencia', 'Peregrinación o JMJ', 'Colegio o parroquia', 'Otro'];

export default function FormEncargo() {
  const [hecho, setHecho] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const err: Record<string, string> = {};
    if (!String(f.get('grupo') || '').trim()) err.grupo = 'Escribe el nombre del grupo.';
    const n = Number(f.get('unidades'));
    if (!Number.isInteger(n) || n < 20) err.unidades = 'Escribe un número entero de prendas, de 20 en adelante.';
    if (!/^\S+@\S+\.\S+$/.test(String(f.get('correo') || ''))) err.correo = 'Escribe un correo válido, por ejemplo nombre@parroquia.es.';
    setErrores(err);
    if (Object.keys(err).length) {
      const primero = Object.keys(err)[0];
      document.getElementById(`enc-${primero}`)?.focus();
      return;
    }
    setHecho(true);
  };

  if (hecho) {
    return (
      <div className="rounded-[4px] bg-white p-8 text-texto" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto/55">Demo</p>
        <p className="mt-2 text-xl font-semibold text-texto">Petición recibida</p>
        <p className="mt-3 text-sm leading-relaxed text-texto/75">
          En la tienda real, Bosco os escribiría en un día con el presupuesto por tramos y una prueba del diseño. En esta demo no se ha enviado nada.
        </p>
        <button type="button" onClick={() => setHecho(false)} className="mt-5 text-sm font-medium text-texto underline underline-offset-2 cursor-pointer">
          Hacer otra petición
        </button>
      </div>
    );
  }

  const campo = 'w-full rounded-[4px] border border-black/15 bg-white px-4 py-3 text-base text-texto focus:border-texto focus:outline-2 focus:outline-azul';
  const err = (k: string) =>
    errores[k] ? (
      <p id={`enc-${k}-err`} className="mt-1 text-sm text-[#9B2C2C]">
        {errores[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 rounded-[4px] bg-white p-6 text-texto sm:grid-cols-2 sm:p-8">
      <div className="sm:col-span-2">
        <label htmlFor="enc-grupo" className="mb-1.5 block text-sm font-medium">Nombre del grupo</label>
        <input id="enc-grupo" name="grupo" className={campo} aria-invalid={!!errores.grupo} aria-describedby={errores.grupo ? 'enc-grupo-err' : undefined} />
        {err('grupo')}
      </div>
      <div>
        <label htmlFor="enc-tipo" className="mb-1.5 block text-sm font-medium">Qué sois</label>
        <select id="enc-tipo" name="tipo" className={campo} defaultValue={TIPOS[0]}>
          {TIPOS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="enc-unidades" className="mb-1.5 block text-sm font-medium">Prendas, más o menos</label>
        <input id="enc-unidades" name="unidades" type="number" inputMode="numeric" min={20} placeholder="40" className={campo} aria-invalid={!!errores.unidades} aria-describedby={errores.unidades ? 'enc-unidades-err' : undefined} />
        {err('unidades')}
      </div>
      <div>
        <label htmlFor="enc-fecha" className="mb-1.5 block text-sm font-medium">Para cuándo</label>
        <input id="enc-fecha" name="fecha" type="month" className={campo} />
      </div>
      <div>
        <label htmlFor="enc-correo" className="mb-1.5 block text-sm font-medium">Correo</label>
        <input id="enc-correo" name="correo" type="email" autoComplete="email" className={campo} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'enc-correo-err' : undefined} />
        {err('correo')}
      </div>
      <button type="submit" className="mt-2 rounded-[4px] bg-azul py-3.5 text-base font-medium text-white hover:bg-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul sm:col-span-2 cursor-pointer">
        Pedir presupuesto
      </button>
    </form>
  );
}
