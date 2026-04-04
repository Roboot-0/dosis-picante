import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Usos from "@/components/Usos";
import Productos from "@/components/Productos";
import Tienda from "@/components/Tienda";
import Historia from "@/components/Historia";
import Ciencia from "@/components/Ciencia";
import Intensidad from "@/components/Intensidad";
import CTAFinal from "@/components/CTAFinal";
import Footer from "@/components/Footer";

/**
 * Arco narrativo de la página:
 *
 * 1. HERO       — Hook visual. El nombre. La promesa.
 * 2. USOS       — Las salsas en acción: imágenes de comida. El abre boca.
 *                 El visitante ve el producto usándose antes de ver la botella.
 * 3. PRODUCTOS  — Catálogo detallado: las tres fórmulas, ingredientes, usos.
 * 4. TIENDA     — Pedidos por WhatsApp por producto + Kit completo.
 * 5. HISTORIA   — Quiénes son, de dónde vienen, cómo lo hacen.
 * 6. CIENCIA    — La capsaicina explicada. Ya viste el producto, ahora entiendes por qué.
 * 7. INTENSIDAD — Escala Scoville. Confirma la decisión.
 * 8. CTA FINAL  — "¿Listo para tu dosis?"
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
        <CTAFinal />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
