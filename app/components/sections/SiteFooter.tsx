import Image from 'next/image';
import Link from 'next/link';
import { IconInstagram } from '../icons';
import { INSTAGRAM_URL } from '@/lib/constants';

export default function SiteFooter() {
  return (
    <footer className="bg-azul text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo y descripción */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-512-1.png"
                alt="Refugio en la Palabra"
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="font-[family-name:var(--font-lora)] text-xl font-semibold">
                Refugio en la Palabra
              </span>
            </div>
            <p className="text-white/70 text-sm max-w-md">
              Tu espacio diario para orar, comprender y avanzar con sentido. Una herramienta católica diseñada para fortalecer tu fe y acompañarte en tu camino espiritual.
            </p>
            <div className="flex gap-4 pt-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="Instagram">
                <IconInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navegación</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#caracteristicas" className="hover:text-white transition-colors">Características</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a></li>
              <li><a href="#nosotros" className="hover:text-white transition-colors">Quiénes somos</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Preguntas frecuentes</a></li>
              <li><Link href="/descargar" className="hover:text-white transition-colors">Instalar la app</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/legal#cookies" className="hover:text-white transition-colors">Política de Cookies</Link></li>
              <li><Link href="/feedback" className="hover:text-white transition-colors">Enviar Feedback</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <p>© {new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            en España
          </p>
        </div>
      </div>
    </footer>
  );
}
