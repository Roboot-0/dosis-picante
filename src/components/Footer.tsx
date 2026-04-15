"use client";

export default function Footer() {
  return (
    <footer className="bg-carbon border-t border-carbon-medio py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo texto */}
          <div>
            <p className="font-bebas text-2xl tracking-[0.3em] text-crema">
              DOSIS
            </p>
            <p className="text-xs text-crema/30 font-mono tracking-widest mt-1">
              Experimenta El Picor
            </p>
          </div>

          {/* Links */}
          <nav className="flex gap-8">
            {[
                  { label: "Historia", href: "#historia" },
                  { label: "Salsas", href: "#productos" },
                  { label: "Intensidad", href: "#intensidad" },
                  { label: "Contacto", href: "#contacto" },
                ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs text-crema/40 hover:text-rojo transition-colors font-sans tracking-widest uppercase"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Fórmula */}
          <p className="text-xs text-crema/20 font-sans tracking-widest">
            C18H27NO3
          </p>
        </div>

        <div className="linea-fuego my-8" />

        <div className="flex justify-center gap-8 mb-6">
          <a href="https://instagram.com/dosis_ve" target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-[0.3em] text-crema/30 hover:text-rojo transition-colors uppercase">
            @dosis_ve
          </a>
          <a href="https://wa.me/584142624078" target="_blank" rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-[0.3em] text-crema/30 hover:text-rojo transition-colors uppercase">
            WhatsApp
          </a>
        </div>

        <p className="text-center text-xs text-crema/20 font-sans">
          © 2026 DOSIS · Todos los derechos reservados · Hecho en Caracas
        </p>
      </div>
    </footer>
  );
}
