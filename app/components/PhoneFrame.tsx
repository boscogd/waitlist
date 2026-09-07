import Image from 'next/image';
import type { ReactNode } from 'react';

interface PhoneFrameProps {
  /** Captura de pantalla (recortada, sin barras del sistema). */
  src?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  /** Clases del marco exterior (aquí va el ancho: w-44, w-64...). */
  className?: string;
  /** Clases extra de la pantalla interior. */
  screenClassName?: string;
  /** Contenido alternativo a `src` (capas de imágenes, un vídeo...). */
  children?: ReactNode;
}

/**
 * Marco de móvil propio: bisel oscuro y botones laterales (sin notch, para
 * que la cabecera de la app se vea entera).
 * Sustituye a las capturas "pegadas" con barra de estado y barra de navegación
 * del sistema. La pantalla conserva la proporción de las capturas recortadas
 * de /public/app (720×1415), así ninguna imagen se deforma.
 */
export default function PhoneFrame({
  src,
  alt = '',
  priority = false,
  sizes = '(max-width: 640px) 60vw, 288px',
  className = '',
  screenClassName = '',
  children,
}: PhoneFrameProps) {
  return (
    <div
      className={`relative rounded-[2.6rem] bg-[#0e1726] p-[7px] shadow-2xl ring-1 ring-white/10 ${className}`}
    >
      {/* Botones laterales (decorativos) */}
      <span aria-hidden="true" className="absolute -left-[3px] top-[17%] h-8 w-[3px] rounded-l-sm bg-[#0e1726]" />
      <span aria-hidden="true" className="absolute -left-[3px] top-[27%] h-12 w-[3px] rounded-l-sm bg-[#0e1726]" />
      <span aria-hidden="true" className="absolute -right-[3px] top-[22%] h-14 w-[3px] rounded-r-sm bg-[#0e1726]" />

      <div
        className={`relative aspect-[720/1415] overflow-hidden rounded-[2.15rem] bg-marfil ${screenClassName}`}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            draggable={false}
            className="object-cover pointer-events-none select-none"
          />
        ) : (
          children
        )}
        {/* Sin isla dinámica ni notch: tapaban la cabecera de la app. */}
      </div>
    </div>
  );
}
