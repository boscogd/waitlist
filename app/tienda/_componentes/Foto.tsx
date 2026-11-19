// Foto de producto servida por el CDN de Unsplash, ya recortada a la
// proporción pedida y en varios anchos (AVIF/WebP según el navegador).
import { srcSetFoto, urlFoto, type Foto as TFoto } from '@/lib/tienda/catalogo';

const ANCHOS = [320, 480, 640, 960, 1280, 1600];

export default function Foto({
  foto,
  sizes,
  proporcion = 1.25,
  prioridad = false,
  decorativa = false,
  className = '',
}: {
  foto: TFoto;
  sizes: string;
  /** Alto entre ancho (1.25 = 4:5). */
  proporcion?: number;
  prioridad?: boolean;
  decorativa?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- el CDN de Unsplash ya recorta y comprime
    <img
      src={urlFoto(foto.id, 800, proporcion, foto.foco)}
      srcSet={srcSetFoto(foto.id, ANCHOS, proporcion, foto.foco)}
      sizes={sizes}
      alt={decorativa ? '' : foto.alt}
      width={800}
      height={Math.round(800 * proporcion)}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
