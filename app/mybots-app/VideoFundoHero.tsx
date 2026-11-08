"use client";

import { useEffect, useRef, useState } from "react";
import estilos from "./estilos.module.css";

type Props = {
  mp4?: string;
  webm?: string;
  poster?: string;
  disponivel: boolean;
};

/**
 * Fundo do hero: 00_hero_loop, mudo, em loop, playsinline.
 * O poster (00_hero_poster.jpg) fica por baixo. Quem prefere menos movimento
 * vê só o poster, ou o quadro desenhado enquanto o arquivo não chega.
 */
export default function VideoFundoHero({ mp4, webm, poster, disponivel }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduzido, setReduzido] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ler = () => setReduzido(mq.matches);
    ler();
    setPronto(true);
    mq.addEventListener("change", ler);
    return () => mq.removeEventListener("change", ler);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const el = caixa.current;
    if (!video || !el || !disponivel || reduzido) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const obs = new IntersectionObserver(([entrada]) => {
      if (entrada?.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [disponivel, reduzido, mp4, webm]);

  const toca = disponivel && pronto && !reduzido;

  return (
    <div ref={caixa} className={estilos.fundoHero} aria-hidden>
      {poster ? (
        <img className={estilos.posterHero} src={poster} alt="" />
      ) : (
        <div className={estilos.fundoReserva} />
      )}
      {toca ? (
        <video
          ref={videoRef}
          className={estilos.videoHero}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={poster}
          tabIndex={-1}
        >
          {webm ? <source src={webm} type="video/webm" /> : null}
          {mp4 ? <source src={mp4} type="video/mp4" /> : null}
        </video>
      ) : null}
      <div className={estilos.veu} />
    </div>
  );
}
