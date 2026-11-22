// Foto de muestra servida por el CDN de Unsplash o de Pexels, ya recortada a
// la proporción pedida y en varios anchos.
import { srcSetFoto, urlFoto, type Foto as TFoto } from '@/lib/tienda/catalogo';

const ANCHOS = [320, 480, 640, 960, 1280, 1600];

export default function Foto({
  foto,
  sizes,
  proporcion = 1.25,
  prioridad = false,
  decorativa = false,
  inmediata = false,
  className = '',
}: {
  foto: TFoto;
  sizes: string;
  /** Alto entre ancho (1.25 = 4:5). */
  proporcion?: number;
  prioridad?: boolean;
  decorativa?: boolean;
  /** Cargar ya, sin esperar a que entre en pantalla (miniaturas pequeñas). */
  inmediata?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- los CDN de Unsplash y Pexels ya recortan y comprimen
    <img
      src={urlFoto(foto, 800, proporcion)}
      srcSet={srcSetFoto(foto, ANCHOS, proporcion)}
      sizes={sizes}
      alt={decorativa ? '' : foto.alt}
      width={800}
      height={Math.round(800 * proporcion)}
      loading={prioridad || inmediata ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={`${foto.fuente === 'dibujo' ? 'object-contain mix-blend-multiply' : 'object-cover'} ${className}`}
    />
  );
}
