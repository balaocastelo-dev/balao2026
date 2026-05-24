"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc: string;
  hoverPreviewEmbedUrl?: string | null;
  hoverPreviewTitle?: string;
}

function isAllowedEmbedUrl(url: string): boolean {
  const u = String(url || "").trim().toLowerCase();
  if (!u) return false;
  return (
    u.startsWith("https://www.youtube-nocookie.com/embed/") ||
    u.startsWith("https://www.youtube.com/embed/") ||
    u.startsWith("https://player.globo.com/") ||
    u.startsWith("https://globoplay.globo.com/")
  );
}

function buildHoverPreviewSrc(embedUrl: string): string {
  const base = String(embedUrl || "").trim();
  if (!base) return "";
  const lower = base.toLowerCase();
  if (lower.includes("youtube") && lower.includes("/embed/")) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&rel=0`;
  }
  return base;
}

export default function SafeImage({ src, fallbackSrc, alt, hoverPreviewEmbedUrl, hoverPreviewTitle, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const imageEl = (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
    />
  );

  if (hoverPreviewEmbedUrl && isAllowedEmbedUrl(hoverPreviewEmbedUrl)) {
    const title = hoverPreviewTitle || alt || "Vídeo";
    return (
      <div
        className="relative h-full w-full"
        onMouseEnter={() => {
          if (!previewVisible) setPreviewVisible(true);
          if (!previewSrc) setPreviewSrc(buildHoverPreviewSrc(hoverPreviewEmbedUrl));
        }}
        onMouseLeave={() => {
          setPreviewVisible(false);
          setPreviewSrc("");
        }}
      >
        {imageEl}
        {previewVisible && previewSrc ? (
          <div className="absolute inset-0">
            <iframe
              src={previewSrc}
              title={title}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : null}
      </div>
    );
  }

  return imageEl;
}
