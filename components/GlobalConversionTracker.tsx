"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent, trackMailClick, trackPhoneClick, trackWhatsAppClick } from "@/lib/tracking";

function getAbsoluteHref(href: string) {
  try {
    return new URL(href, window.location.origin);
  } catch {
    return null;
  }
}

export default function GlobalConversionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams?.toString();
    trackEvent("route_context", {
      page_path: pathname,
      page_query: search || undefined,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const source =
        anchor.getAttribute("data-conversion-source") ||
        anchor.getAttribute("data-track-source") ||
        pathname;
      const label =
        anchor.getAttribute("data-conversion-label") ||
        anchor.textContent?.trim() ||
        href;
      const city = anchor.getAttribute("data-conversion-city") || undefined;
      const service = anchor.getAttribute("data-conversion-service") || undefined;
      const productName = anchor.getAttribute("data-conversion-product") || undefined;

      if (href.startsWith("tel:")) {
        trackPhoneClick({
          page_path: pathname,
          source,
          label,
          city,
          service,
          product_name: productName,
          destination: href.replace("tel:", ""),
        });
        return;
      }

      if (href.startsWith("mailto:")) {
        trackMailClick({
          page_path: pathname,
          source,
          label,
          city,
          service,
          product_name: productName,
          destination: href.replace("mailto:", ""),
        });
        return;
      }

      if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
        const absolute = getAbsoluteHref(href);
        trackWhatsAppClick({
          page_path: pathname,
          source,
          label,
          city,
          service,
          product_name: productName,
          destination: absolute?.toString() || href,
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  return null;
}
