import type { Metadata } from "next";
import Productos from "@/components/Productos";
import { TiendaSeccion } from "@/components/Tienda";
import CTAFinal from "@/components/CTAFinal";
import NavPaginas from "@/components/NavPaginas";

export const metadata: Metadata = {
  title: "Salsas Picantes Artesanales",
  description:
    "Tres fórmulas, un solo propósito. MICRODOSIS, AHUMADOSIS y SOBREDOSIS — salsas picantes fermentadas naturalmente en Caracas. Desde $5.",
  alternates: { canonical: "/salsas" },
};

export default function SalsasPage() {
  return (
    <>
      <div className="pt-16" />
      <Productos />
      <TiendaSeccion />
      <CTAFinal />
      <NavPaginas
        anterior={{ href: "/faq", label: "Preguntas Frecuentes" }}
        siguiente={{ href: "/historia", label: "Nuestra Historia" }}
      />
    </>
  );
}
