import SiteHeader from './components/SiteHeader';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import HeroSection from './components/sections/HeroSection';
import ProblemSection from './components/sections/ProblemSection';
import FeaturesSection from './components/sections/FeaturesSection';
import HowItWorksSection from './components/sections/HowItWorksSection';
import DifferentiatorsSection from './components/sections/DifferentiatorsSection';
import CommunitySection from './components/sections/CommunitySection';
import AboutSection from './components/sections/AboutSection';
import TestimonialsSection from './components/sections/TestimonialsSection';
import DownloadCTASection from './components/sections/DownloadCTASection';
import FaqSection from './components/sections/FaqSection';
import FinalCTASection from './components/sections/FinalCTASection';
import SiteFooter from './components/sections/SiteFooter';
import { faqs } from '@/lib/content/faqs';

export default function Home() {
  // FAQ JSON-LD: se deriva del MISMO array `faqs` que alimenta la sección #faq
  // (fuente única). Se incluye aquí porque el FAQPage se retira del layout global.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-marfil flex flex-col">
      {/* Header + interacciones de navegación */}
      <ScrollProgress />
      <SiteHeader />
      <BackToTop />

      {/* Main Content */}
      <main id="main" className="flex-1 pt-20">

        {/* Hero Section */}
        <HeroSection />

        {/* Sección: Por qué Refugio */}
        <ProblemSection />

        {/* Características principales */}
        <FeaturesSection />

        {/* Cómo funciona */}
        <HowItWorksSection />

        {/* Diferenciadores */}
        <DifferentiatorsSection />

        {/* Sección Comunidad */}
        <CommunitySection />

        {/* Quiénes somos */}
        <AboutSection />

        {/* Testimonios */}
        <TestimonialsSection />

        {/* CTA Descarga */}
        <DownloadCTASection />

        {/* FAQ */}
        <FaqSection />
        {/* FAQ structured data (JSON-LD) para rich results en buscadores */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* CTA Final */}
        <FinalCTASection />

      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
