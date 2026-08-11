"use client";

import { useMemo, useState } from "react";

interface ProductVideoProps {
  videoUrl: string;
  productName: string;
}

export default function ProductVideo({ videoUrl, productName }: ProductVideoProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { type, embedUrl } = useMemo(() => {
    const url = videoUrl || "";
    const lower = url.toLowerCase();

    if (!url) return { type: "none", embedUrl: "" };

    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const id = match && match[2].length === 11 ? match[2] : null;
      if (id) {
        return {
          type: "youtube",
          embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1`,
        };
      }
    }

    if (lower.includes("vimeo.com")) {
      const parts = url.split("/");
      const last = parts[parts.length - 1].split("?")[0];
      if (last) {
        return {
          type: "vimeo",
          embedUrl: `https://player.vimeo.com/video/${last}?autoplay=1&muted=1&playsinline=1`,
        };
      }
    }

    return { type: "file", embedUrl: url };
  }, [videoUrl]);

  if (!videoUrl || type === "none") return null;

  if (hasError) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-100 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
        Não foi possível carregar o vídeo deste produto.
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs animate-pulse z-10">
          Carregando vídeo do produto...
        </div>
      )}

      {type === "youtube" || type === "vimeo" ? (
        <iframe
          src={embedUrl}
          title={productName}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        ></iframe>
      ) : (
        <video
          src={embedUrl}
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          controls
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}

