"use client";

import { useEffect, useRef, useState } from "react";
import estilos from "./estilos.module.css";

type Props = {
  titulo: string;
  mp4?: string;
  webm?: string;
  poster?: string;
  disponivel: boolean;
};

/**
 * Vídeo de seção: mp4 e/ou webm, mudo, playsinline, preload none.
 * A fonte só entra quando o quadro chega perto da tela. Sem arquivo,
 * fica o quadro com o poster (se já existir) ou o desenho de espera.
 */
export default function VideoLeve({ titulo, mp4, webm, poster, disponivel }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visivel, setVisivel] = useState(false);
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ler = () => setReduzido(mq.matches);
    ler();
    mq.addEventListener("change", ler);
    return () => mq.removeEventListener("change", ler);
  }, []);

  useEffect(() => {
    if (!disponivel) return;
    const el = caixa.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        const naTela = entradas.some((entrada) => entrada.isIntersecting);
        if (naTela) setVisivel(true);
        const video = videoRef.current;
        if (!video || reduzido) return;
        if (naTela) void video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "240px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [disponivel, reduzido]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
  }, [visivel]);

  if (!disponivel) {
    return (
      <div className={estilos.vazio} role="img" aria-label={`${titulo}. Vídeo em preparação.`}>
        {poster ? <img className={estilos.posterVazio} src={poster} alt="" /> : null}
        <div className={estilos.vazioMiolo}>
          <span className={estilos.vazioPlay} aria-hidden />
          <p className={estilos.vazioTitulo}>{titulo}</p>
          <p className={estilos.vazioNota}>Vídeo em preparação</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={caixa} className={estilos.molduraVideo}>
      <video
        ref={videoRef}
        className={estilos.videoLeve}
        muted
        playsInline
        preload="none"
        poster={poster}
        controls
        aria-label={titulo}
      >
        {visivel && webm ? <source src={webm} type="video/webm" /> : null}
        {visivel && mp4 ? <source src={mp4} type="video/mp4" /> : null}
      </video>
    </div>
  );
}
