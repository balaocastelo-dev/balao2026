"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Model3DViewerProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  fallbackMessage?: string;
}

export default function Model3DViewer({ 
  fallbackMessage = "Seu navegador ou dispositivo não suporta a visualização 3D interativa.", 
  ...iframeProps 
}: Model3DViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // 1) Fallback check for WebGL
    const checkWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch (e) {
        return false;
      }
    };
    setHasWebGL(checkWebGL());

    // 2) Listen to Sketchfab ready messages (fires when 100% loaded inside iframe)
    const handleMessage = (event: MessageEvent) => {
      // O Sketchfab envia mensagens cross-origin. Quando o visualizador está pronto e o modelo carregado:
      if (
        (event.data && typeof event.data === 'string' && event.data.includes('viewerready')) ||
        (event.data && event.data.type === 'viewerready')
      ) {
        setIsLoaded(true);
      }
    };
    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    if (iframeProps.onLoad) iframeProps.onLoad(e);
    
    // Fallback de segurança: remove o loading após 4 segundos
    // se por algum motivo a API de mensagem do Sketchfab for bloqueada.
    setTimeout(() => setIsLoaded(true), 4000);
  };

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/90 p-8 text-center border border-zinc-800 rounded-3xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">WebGL não suportado</h3>
        <p className="text-zinc-400 text-sm">{fallbackMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* 
        Overlay de Loading: 
        - Ocupa exatamente a div container pai que tem o "aspect-[4/3] e overflow-hidden" 
        - pointer-events-none para não bloquear nada acidentalmente após sumir
        - fade-out de 300ms 
      */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-white animate-pulse">
          {/* Ícone giratório */}
          <RefreshCw className="w-10 h-10 md:w-12 md:h-12 animate-[spin_3s_linear_infinite] text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          
          {/* Texto "Arraste e gire" */}
          <span className="text-xl md:text-2xl font-black uppercase tracking-widest text-center drop-shadow-lg">
            Arraste e gire
          </span>
        </div>
      </div>

      {/* Iframe 3D (Sketchfab) com atributos passados da página */}
      <iframe {...iframeProps} onLoad={handleLoad} />
    </>
  );
}
