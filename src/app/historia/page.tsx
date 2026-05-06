import type { Metadata } from "next";
import Historia from "@/components/Historia";
import CTAFinal from "@/components/CTAFinal";
import NavPaginas from "@/components/NavPaginas";

export const metadata: Metadata = {
  title: "Nuestra Historia",
  description:
    "Cuatro amigos, una terraza en Caracas y más de cuatro años perfeccionando salsas picantes. Conoce el origen de DOSIS y nuestro proceso de fermentación natural.",
  alternates: { canonical: "/historia" },
};

export default function HistoriaPage() {
  return (
    <>
      <div className="pt-16" />
      <Historia />
      <CTAFinal />
      <NavPaginas
        anterior={{ href: "/salsas", label: "Las Salsas" }}
        siguiente={{ href: "/ciencia", label: "La Ciencia del Picor" }}
      />
    </>
  );
}
