import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad | Refugio en la Palabra',
  description: 'Política de privacidad y protección de datos de Refugio en la Palabra',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-marfil">
      {/* Header */}
      <header className="bg-white border-b border-azul/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-azul hover:text-azul-800 transition-colors"
          >
            <span>←</span>
            <span className="font-[family-name:var(--font-lora)] text-xl font-semibold">
              Refugio en la Palabra
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-lora)] text-4xl md:text-5xl font-semibold text-azul mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-lg max-w-none space-y-8 text-texto">
          <p className="text-lg">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              1. Información que recopilamos
            </h2>
            <p>
              En <strong>Refugio en la Palabra</strong>, recopilamos únicamente la información necesaria
              para proporcionarte acceso anticipado a nuestra aplicación:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Nombre:</strong> Para personalizar tu experiencia y comunicarnos contigo.</li>
              <li><strong>Correo electrónico:</strong> Para enviarte tu código de acceso anticipado y notificaciones importantes.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              2. Cómo usamos tu información
            </h2>
            <p>Utilizamos tu información únicamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enviarte tu código único de acceso anticipado</li>
              <li>Notificarte cuando la aplicación esté disponible</li>
              <li>Comunicarnos contigo sobre actualizaciones importantes del proyecto</li>
            </ul>
            <p className="font-semibold">
              Nunca compartiremos, venderemos ni alquilaremos tu información personal a terceros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              3. Almacenamiento de datos
            </h2>
            <p>
              Tus datos se almacenan de forma segura en servidores protegidos (Supabase) que cumplen
              con los estándares de seguridad internacionales. Implementamos medidas técnicas y
              organizativas apropiadas para proteger tu información personal contra acceso no autorizado,
              pérdida o destrucción.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              4. Tus derechos (RGPD)
            </h2>
            <p>
              De acuerdo con el Reglamento General de Protección de Datos (RGPD), tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos personales</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              5. Cookies
            </h2>
            <p>
              Este sitio web no utiliza cookies de seguimiento ni análisis. Solo usamos cookies
              técnicas estrictamente necesarias para el funcionamiento del formulario de registro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              6. Cancelación de suscripción
            </h2>
            <p>
              Puedes darte de baja de nuestra lista de espera en cualquier momento. Cada email que
              recibas incluirá un enlace para cancelar la suscripción, o puedes contactarnos
              directamente respondiendo a cualquier email.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              7. Cambios en esta política
            </h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos
              cualquier cambio significativo por correo electrónico o mediante un aviso destacado
              en nuestra página web.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-lora)] text-2xl font-semibold text-azul mt-12 mb-4">
              8. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos,
              por favor contáctanos respondiendo a cualquier email que hayas recibido de nosotros
              o a través del formulario de contacto en nuestra web.
            </p>
          </section>

          <div className="mt-16 p-6 bg-albero/10 border border-albero/30 rounded-lg">
            <p className="text-sm text-azul">
              <strong>Refugio en la Palabra</strong> se compromete a proteger tu privacidad y
              cumplir con todas las regulaciones aplicables de protección de datos, incluyendo
              el RGPD (UE) y otras leyes locales de privacidad.
            </p>
          </div>
        </div>

        {/* Back to home button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-azul rounded-lg hover:bg-azul-800 transition-all duration-200"
          >
            Volver al inicio
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-azul/10">
        <p className="text-xs text-texto/50">
          © {new Date().getFullYear()} Refugio en la Palabra. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
