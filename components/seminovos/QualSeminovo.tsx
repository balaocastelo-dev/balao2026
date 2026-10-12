"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import FormularioDeLead from "./FormularioDeLead";
import { perfilRecomendado, resumoDoPerfil, type Prioridade, type Uso } from "@/lib/seminovos/perfil";
import { ORCAMENTOS } from "@/lib/seminovos/tipos";
import { trackLeadEvent } from "@/lib/tracking";

const USOS: { valor: Uso; rotulo: string; exemplo: string }[] = [
  { valor: "estudo", rotulo: "Estudar", exemplo: "aula, trabalho da faculdade, pesquisa" },
  { valor: "escritorio", rotulo: "Trabalhar", exemplo: "planilha, e-mail, reunião, sistema da empresa" },
  { valor: "programacao", rotulo: "Programar", exemplo: "IDE, Docker, máquina virtual" },
  { valor: "design", rotulo: "Criar", exemplo: "foto, vídeo, design, arquitetura" },
  { valor: "empresa", rotulo: "Equipar a empresa", exemplo: "vários iguais para a equipe" },
];

const PRIORIDADES: { valor: Prioridade; rotulo: string }[] = [
  { valor: "leveza", rotulo: "Leve e com boa bateria" },
  { valor: "desempenho", rotulo: "Rápido, sem travar" },
  { valor: "tela", rotulo: "Tela grande" },
  { valor: "preco", rotulo: "Gastar o mínimo" },
];

const opcao = (ativo: boolean) =>
  `w-full rounded-2xl border px-4 py-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E60012] ${
    ativo ? "border-[#E60012] bg-[#E60012]/10" : "border-slate-700 bg-[#0c1220] hover:border-slate-500"
  }`;

export default function QualSeminovo() {
  const [uso, setUso] = useState<Uso | null>(null);
  const [prioridade, setPrioridade] = useState<Prioridade | null>(null);
  const [orcamento, setOrcamento] = useState<string | null>(null);

  const passo = !uso ? 1 : !prioridade ? 2 : !orcamento ? 3 : 4;
  const perfil = uso && prioridade ? perfilRecomendado(uso, prioridade) : null;
  const usoDoFormulario = uso ?? "";

  const recomecar = () => {
    setUso(null);
    setPrioridade(null);
    setOrcamento(null);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 sm:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-400" aria-live="polite">
          {passo < 4 ? `Pergunta ${passo} de 3` : "Seu perfil"}
        </p>
        {passo > 1 && (
          <button type="button" onClick={recomecar} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Recomeçar
          </button>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800" aria-hidden>
        <div className="h-full rounded-full bg-[#E60012] transition-all duration-300" style={{ width: `${(Math.min(passo, 4) - 1) * 33.4}%` }} />
      </div>

      {passo === 1 && (
        <fieldset className="mt-6">
          <legend className="text-xl font-black text-white sm:text-2xl">Para que é o notebook?</legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {USOS.map((u) => (
              <button key={u.valor} type="button" className={opcao(false)} onClick={() => setUso(u.valor)}>
                <span className="block font-bold text-white">{u.rotulo}</span>
                <span className="block text-sm text-slate-400">{u.exemplo}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {passo === 2 && (
        <fieldset className="mt-6">
          <legend className="text-xl font-black text-white sm:text-2xl">O que pesa mais na escolha?</legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {PRIORIDADES.map((p) => (
              <button key={p.valor} type="button" className={opcao(false)} onClick={() => setPrioridade(p.valor)}>
                <span className="font-bold text-white">{p.rotulo}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {passo === 3 && (
        <fieldset className="mt-6">
          <legend className="text-xl font-black text-white sm:text-2xl">Quanto quer investir?</legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ORCAMENTOS.map((o) => (
              <button
                key={o.valor}
                type="button"
                className={opcao(false)}
                onClick={() => {
                  setOrcamento(o.valor);
                  trackLeadEvent("quiz_seminovos_concluido", { uso, prioridade, orcamento: o.valor });
                }}
              >
                <span className="font-bold text-white">{o.rotulo}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {passo === 4 && perfil && (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-black text-white">{perfil.titulo}</h3>
            <p className="mt-4 text-sm font-semibold text-slate-400">Configuração que recomendamos</p>
            <ul className="mt-2 space-y-2">
              {perfil.configuracao.map((c) => (
                <li key={c} className="flex gap-2.5 text-slate-200">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E60012]" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-slate-400">Linhas que costumam atender</p>
            <p className="mt-1 text-slate-200">{perfil.procurePor.join(", ")}</p>
            <p className="mt-5 rounded-2xl bg-[#0c1220] p-4 text-sm leading-relaxed text-slate-300">{perfil.dica}</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">Receba no WhatsApp os aparelhos da loja que batem com esse perfil</p>
            <p className="mb-5 mt-1 text-sm text-slate-400">O vendedor responde com fotos e preço do que tem hoje.</p>
            <FormularioDeLead
              interesse="comprar"
              bloco="quiz"
              botao="Ver o que tem na loja"
              usoInicial={usoDoFormulario}
              orcamentoInicial={orcamento ?? ""}
              anexo={resumoDoPerfil(perfil)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
