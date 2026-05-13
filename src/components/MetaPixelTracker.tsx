"use client";

/**
 * MetaPixelTracker — dispara PageView en cada navegación SPA.
 * El PageView inicial ya va en el inline script del layout.
 * Este componente cubre las navegaciones siguientes (Next.js App Router).
 */

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaPixelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}
