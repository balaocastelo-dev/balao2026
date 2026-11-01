"use client";

import { useEffect, useRef } from "react";
import estilos from "./estilos.module.css";

type VideoRepetivel = {
  muted: boolean;
  defaultMuted: boolean;
  loop: boolean;
  currentTime: number;
  play: () => Promise<void>;
};

/**
 * A primeira passagem toca com som, do jeito que a pessoa deu play.
 * Quando acaba, a repetição entra muda e em loop — o celular aceita
 * seguir sozinho porque o áudio já foi desligado.
 */
export function repetirSemSom(video: VideoRepetivel) {
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.currentTime = 0;
  return video.play();
}

export default function PlayerDoComercial({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const repetindo = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // playsinline em minúsculas: é o atributo que o iOS e o Android leem
    // para o vídeo ficar na página, em vez de abrir em tela cheia.
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
  }, []);

  function aoTerminar() {
    const video = videoRef.current;
    if (!video || repetindo.current) return;
    repetindo.current = true;
    const tocar = () => {
      void repetirSemSom(video).catch(() => {
        window.setTimeout(() => {
          void repetirSemSom(video).catch(() => {});
        }, 80);
      });
    };
    tocar();
  }

  return (
    <video
      ref={videoRef}
      className={estilos.video}
      controls
      playsInline
      preload="metadata"
      poster={poster}
      onEnded={aoTerminar}
      aria-label="Comercial dos bots MyBots. A primeira vez sai com som. Depois, repete sem som."
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
