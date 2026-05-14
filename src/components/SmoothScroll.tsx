"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    const stopHandler = () => lenis.stop();
    const startHandler = () => lenis.start();
    window.addEventListener("lenis-stop", stopHandler);
    window.addEventListener("lenis-start", startHandler);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.removeEventListener("lenis-stop", stopHandler);
      window.removeEventListener("lenis-start", startHandler);
    };
  }, []);

  return <>{children}</>;
}
