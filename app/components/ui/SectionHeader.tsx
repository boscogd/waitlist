// Cabecera de sección reutilizable: eyebrow (opcional) + título + subtítulo
// (opcional). Las clases se pasan por props para reproducir EXACTAMENTE las
// variaciones que había inline (color del eyebrow, márgenes del h2, color del
// subtítulo, etc.). No introduce ningún cambio visual.

import type { ReactNode } from 'react';

interface SectionHeaderProps {
  /** Texto del eyebrow (la línea pequeña en mayúsculas). Omitir para no renderizarlo. */
  eyebrow?: string;
  /** Clases del <span> del eyebrow (varía: text-[#8a6d1f] o text-albero). */
  eyebrowClassName?: string;
  /** Contenido del <h2> (permite <span> internos, p. ej. en el hero del nosotros). */
  title: ReactNode;
  /** Clases del <h2>. */
  titleClassName: string;
  /** Texto del subtítulo. Omitir para no renderizarlo. */
  subtitle?: string;
  /** Clases del <p> del subtítulo. */
  subtitleClassName?: string;
}

export default function SectionHeader({
  eyebrow,
  eyebrowClassName,
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <>
      {eyebrow ? <span className={eyebrowClassName}>{eyebrow}</span> : null}
      <h2 className={titleClassName}>{title}</h2>
      {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
    </>
  );
}
