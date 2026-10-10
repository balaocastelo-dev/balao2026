"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MaquinaDeVitrine } from "@/lib/catalogo/vitrine-premium";
import LinhaDeMaquina from "./LinhaDeMaquina";

type Recorte = "todas" | "ram64" | "placa16" | "ia";

const RECORTES: { id: Recorte; rotulo: string; passa: (m: MaquinaDeVitrine) => boolean }[] = [
  { id: "todas", rotulo: "Todas", passa: () => true },
  { id: "ram64", rotulo: "64 GB de RAM ou mais", passa: (m) => !m.apple && (m.memoriaGb ?? 0) >= 64 },
  { id: "placa16", rotulo: "Placa de vídeo de 16 GB", passa: (m) => (m.vramGb ?? 0) >= 16 },
  { id: "ia", rotulo: "Prontas para IA local", passa: (m) => m.nivelDeIA != null },
];

/** Quantas máquinas aparecem antes do botão "Mostrar as outras". */
const DE_INICIO = 8;

/**
 * A lista do topo do catálogo, com um recorte por configuração.
 *
 * Todas as máquinas vão no HTML que sai do servidor; as que passam das oito
 * primeiras ficam recolhidas até a pessoa pedir. Assim a página não vira uma
 * rolagem de vinte e tantas fichas antes de chegar à parte de IA local.
 */
export default function ListaComFiltro({ maquinas }: { maquinas: MaquinaDeVitrine[] }) {
  const [recorte, setRecorte] = useState<Recorte>("todas");
  const [aberta, setAberta] = useState(false);

  const opcoes = useMemo(
    () => RECORTES.map((r) => ({ ...r, total: maquinas.filter(r.passa).length })).filter((r) => r.id === "todas" || r.total > 0),
    [maquinas]
  );
  const visiveis = useMemo(() => maquinas.filter(RECORTES.find((r) => r.id === recorte)!.passa), [maquinas, recorte]);
  const recolhidas = aberta ? 0 : Math.max(0, visiveis.length - DE_INICIO);

  // O botão some ao abrir a lista. Sem isto, quem navega pelo teclado perdia
  // o lugar: o foco vai para a primeira máquina que acabou de aparecer.
  const lista = useRef<HTMLOListElement>(null);
  const acabouDeAbrir = useRef(false);
  useEffect(() => {
    if (!aberta || !acabouDeAbrir.current) return;
    acabouDeAbrir.current = false;
    lista.current?.querySelector<HTMLAnchorElement>(`li:nth-child(${DE_INICIO + 1}) a`)?.focus();
  }, [aberta]);

  return (
    <>
      <ul className="prm-filtro" aria-label="Recortar a lista por configuração">
        {opcoes.map((opcao) => (
          <li key={opcao.id}>
            <button
              type="button"
              className="prm-filtro__opcao"
              aria-pressed={recorte === opcao.id}
              onClick={() => setRecorte(opcao.id)}
            >
              {opcao.rotulo}
              <span className="prm-filtro__total">{opcao.total}</span>
            </button>
          </li>
        ))}
      </ul>

      <ol id="lista-do-topo" ref={lista} className="prm-lista">
        {visiveis.map((maquina, i) => (
          <li key={maquina.id} hidden={!aberta && i >= DE_INICIO}>
            <LinhaDeMaquina maquina={maquina} />
          </li>
        ))}
      </ol>

      {recolhidas > 0 ? (
        <div className="prm-mais">
          <button
            type="button"
            className="prm-botao prm-botao--contorno"
            aria-controls="lista-do-topo"
            onClick={() => {
              acabouDeAbrir.current = true;
              setAberta(true);
            }}
          >
            {recolhidas === 1 ? "Mostrar mais 1 máquina" : `Mostrar mais ${recolhidas} máquinas`}
          </button>
        </div>
      ) : null}
    </>
  );
}
