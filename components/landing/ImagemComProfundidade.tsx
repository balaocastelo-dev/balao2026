"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Foto de seção que anda um pouco mais devagar que a página (camada de trás). */
export default function ImagemComProfundidade({ src, alt }: { src: string; alt: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const parado = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: caixa, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], parado ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <div ref={caixa} className="cpt-imagem">
      <motion.div className="absolute inset-x-0 -inset-y-[9%]" style={{ y }}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
      </motion.div>
    </div>
  );
}
