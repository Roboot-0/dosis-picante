import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Usos from "@/components/Usos";
import Productos from "@/components/Productos";
import Tienda from "@/components/Tienda";
import Historia from "@/components/Historia";
import Ciencia from "@/components/Ciencia";
import Intensidad from "@/components/Intensidad";
import FAQ from "@/components/FAQ";
import CTAFinal from "@/components/CTAFinal";
import Footer from "@/components/Footer";

/**
 * Arco narrativo de la página:
 *
 *  1. HERO         — Hook visual. El nombre. La promesa.
 *  2. USOS         — Las salsas en acción: imágenes de comida.
 *  3. PRODUCTOS    — Catálogo detallado: tres fórmulas, ingredientes, usos.
 *  4. TIENDA       — Checkout integrado (modal con pasos).
 *  5. HISTORIA     — Quiénes son, de dónde vienen, cómo lo hacen.
 *  6. CIENCIA      — La capsaicina explicada.
 *  7. INTENSIDAD   — Escala Scoville. Confirma la decisión.
 *  8. FAQ          — Preguntas frecuentes con schema.org.
 *  9. CTA FINAL    — "¿Listo para tu dosis?" + Hablemos (WhatsApp).
 */
export default function Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        <Hero />
        <Usos />
        <Productos />
        <Tienda />
        <Historia />
        <Ciencia />
        <Intensidad />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
