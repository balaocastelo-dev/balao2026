"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/tracking";

/**
 * O topo das páginas de captação: a foto do serviço num plano em perspectiva
 * que deita para trás conforme a pessoa rola, e os produtos da própria
 * vitrine flutuando em profundidades diferentes (cada um anda numa
 * velocidade). É o único efeito de rolagem da página; o resto fica parado.
 *
 * Com "reduzir movimento" ligado no aparelho, tudo fica no lugar.
 */

type Flutuante = { src: string; alt: string };

// Onde cada produto flutua em volta da foto e quanto ele anda na rolagem.
const POSICOES = [
  { top: "-12%", left: "-4%", y: -170, giro: -8 },
  { top: "28%", left: "89%", y: -300, giro: 5 },
  { top: "-16%", left: "70%", y: -240, giro: 9 },
  { top: "52%", left: "-6%", y: -120, giro: 6 },
];

function Flutua({ item, ordem, progresso, parado }: { item: Flutuante; ordem: number; progresso: MotionValue<number>; parado: boolean }) {
  const p = POSICOES[ordem % POSICOES.length];
  const y = useTransform(progresso, [0, 1], [0, parado ? 0 : p.y]);
  const rotate = useTransform(progresso, [0, 1], [p.giro, parado ? p.giro : p.giro * -1.6]);
  return (
    <motion.div
      className="cpt-flutua"
      data-ordem={ordem}
      style={{ top: p.top, left: p.left, y, rotate, z: 60 + ordem * 30 }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt=""
        loading="lazy"
        decoding="async"
        // Foto de fornecedor que não abre: o cartão some em vez de mostrar o ícone quebrado.
        onError={(e) => {
          const cartao = e.currentTarget.parentElement;
          if (cartao) cartao.style.display = "none";
        }}
      />
    </motion.div>
  );
}

export default function PalcoDoTopo({
  contexto,
  titulo,
  texto,
  imagem,
  linkDoWhats,
  botao,
  secundario,
  fatos,
  flutuantes,
  origem,
  assistente,
}: {
  contexto: string;
  titulo: string;
  texto: string;
  imagem: { src: string; alt: string };
  linkDoWhats: string;
  botao: string;
  secundario?: { rotulo: string; href: string };
  fatos?: { valor: string; rotulo: string }[];
  flutuantes: Flutuante[];
  /** Página, para o registro do clique. */
  origem: string;
  /** O assistente de orçamento, que fica sobre a foto no computador. */
  assistente?: ReactNode;
}) {
  const palco = useRef<HTMLElement>(null);
  const parado = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: palco, offset: ["start start", "end start"] });
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const girarX = useTransform(progresso, [0, 1], parado ? [4, 4] : [4, 26]);
  const girarY = useTransform(progresso, [0, 1], parado ? [-8, -8] : [-8, -2]);
  const descer = useTransform(progresso, [0, 1], parado ? [0, 0] : [0, -90]);
  const escala = useTransform(progresso, [0, 1], parado ? [1, 1] : [1, 0.92]);
  const fotoY = useTransform(progresso, [0, 1], parado ? ["0%", "0%"] : ["0%", "12%"]);
  const textoY = useTransform(progresso, [0, 1], parado ? [0, 0] : [0, 40]);

  return (
    <section ref={palco} className="cpt-palco" aria-labelledby="cpt-titulo">
      <div className="cpt-miolo w-full">
        <div className="cpt-palco__grade">
          <motion.div style={{ y: textoY }} className="relative z-[3]">
            <p className="cpt-contexto">
              <span className="cpt-contexto__ponto" aria-hidden />
              {contexto}
            </p>
            <h1 id="cpt-titulo" className="cpt-titulo mt-5 text-[2.125rem] sm:text-[2.75rem] lg:text-[3.25rem]">
              {titulo}
            </h1>
            <p className="cpt-lead mt-6 lg:max-w-[34rem]">{texto}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={linkDoWhats}
                target="_blank"
                rel="noopener noreferrer"
                className="cpt-botao cpt-botao--acao"
                onClick={() =>
                  trackWhatsAppClick({ page_path: `/${origem}`, source: `topo_${origem}`, label: botao })
                }
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {botao}
              </a>
              {secundario ? (
                <a href={secundario.href} className="cpt-botao cpt-botao--linha">
                  {secundario.rotulo}
                </a>
              ) : null}
            </div>

            {fatos?.length ? (
              <dl className="cpt-fatos">
                {fatos.slice(0, 4).map((f) => (
                  <div key={f.rotulo}>
                    <dt>{f.valor}</dt>
                    <dd>{f.rotulo}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </motion.div>

          <div className="cpt-palco__cena">
            <div className="relative [transform-style:preserve-3d]">
              <div className="cpt-palco__luz" aria-hidden />
              <motion.div
                className="cpt-palco__plano"
                style={{ rotateX: girarX, rotateY: girarY, y: descer, scale: escala, transformPerspective: 1400 }}
              >
                <motion.div className="absolute inset-x-0 -inset-y-[8%]" style={{ y: fotoY }}>
                  <Image
                    src={imagem.src}
                    alt={imagem.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 46vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>

              {flutuantes.slice(0, POSICOES.length).map((item, i) => (
                <Flutua key={`${item.src}-${i}`} item={item} ordem={i} progresso={progresso} parado={parado} />
              ))}
            </div>

            {assistente ? <div className="relative z-[4] mt-6 lg:mt-0">{assistente}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
