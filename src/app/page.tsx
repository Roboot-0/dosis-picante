import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import SelectorDosis from "@/components/SelectorDosis";
import Usos from "@/components/Usos";
import ProcesoGaleria from "@/components/ProcesoGaleria";
import Testimonios from "@/components/Testimonios";
import EmailCapture from "@/components/EmailCapture";
import CTAFinal from "@/components/CTAFinal";
import NavSeccionesHome from "@/components/NavSeccionesHome";

export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeStrip direction="left" speed={30} />
      <SelectorDosis />
      <Usos />
      <ProcesoGaleria />
      <MarqueeStrip direction="right" speed={24} />
      <Testimonios />
      <EmailCapture fuente="home" />
      <CTAFinal />
      <NavSeccionesHome />
    </>
  );
}
