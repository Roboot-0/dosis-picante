import type { Metadata } from "next";
import Ciencia from "@/components/Ciencia";
import Intensidad from "@/components/Intensidad";
import CTAFinal from "@/components/CTAFinal";
import NavPaginas from "@/components/NavPaginas";

export const metadata: Metadata = {
  title: "La Ciencia del Picante",
  description:
    "Capsaicina (C₁₈H₂₇NO₃): la molécula que engaña a tu cerebro. Escala Scoville comparativa, la ciencia detrás de DOSIS y por qué el picante es adictivo.",
  alternates: { canonical: "/ciencia" },
};

export default function CienciaPage() {
  return (
    <>
      <div className="pt-16" />
      <Ciencia />
      <Intensidad />
      <CTAFinal />
      <NavPaginas
        anterior={{ href: "/historia", label: "Nuestra Historia" }}
        siguiente={{ href: "/faq", label: "Preguntas Frecuentes" }}
      />
    </>
  );
}
