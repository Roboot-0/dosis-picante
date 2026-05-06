import type { Metadata } from "next";
import FAQ from "@/components/FAQ";
import CTAFinal from "@/components/CTAFinal";
import NavPaginas from "@/components/NavPaginas";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description:
    "Todo lo que necesitas saber sobre DOSIS: envíos, métodos de pago, refrigeración, niveles de picante, ingredientes y más.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <div className="pt-16" />
      <FAQ />
      <CTAFinal />
      <NavPaginas
        anterior={{ href: "/ciencia", label: "La Ciencia del Picor" }}
        siguiente={{ href: "/salsas", label: "Las Salsas" }}
      />
    </>
  );
}
