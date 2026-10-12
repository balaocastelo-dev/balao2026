"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BatteryMedium, Cpu, HardDrive, MemoryStick, Monitor, ShieldCheck, X } from "lucide-react";
import FormularioDeLead from "./FormularioDeLead";
import { nomeDoAparelho } from "@/lib/seminovos/tipos";
import type { SeminovoPublico } from "@/lib/seminovos/vitrine";

const reais = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Fotos({ s, nome, prioridade }: { s: SeminovoPublico; nome: string; prioridade: boolean }) {
  const [i, setI] = useState(0);
  if (!s.fotos.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-[#0c1220] text-sm text-slate-500">Foto a caminho — peça no WhatsApp</div>
    );
  }
  return (
    <div className="relative aspect-[4/3] bg-[#0c1220]">
      <Image
        src={s.fotos[i]}
        alt={`${nome} seminovo — foto ${i + 1} de ${s.fotos.length}, tirada na loja`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        priority={prioridade && i === 0}
      />
      {s.fotos.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent pb-2.5 pt-6">
          {s.fotos.map((_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Ver foto ${n + 1}`}
              aria-current={n === i}
              className={`h-2.5 rounded-full transition-all ${n === i ? "w-6 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VitrineDeSeminovos({ itens }: { itens: SeminovoPublico[] }) {
  const [aberto, setAberto] = useState<SeminovoPublico | null>(null);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(null);
    window.addEventListener("keydown", fechar);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fechar);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((s, n) => {
          const nome = nomeDoAparelho(s);
          const reservado = s.situacao === "reservado";
          return (
            <li key={s.id} id={`aparelho-${s.id}`} className="flex scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#111827]">
              <div className="relative">
                <Fotos s={s} nome={nome} prioridade={n < 3} />
                {reservado && (
                  <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950">Reservado</span>
                )}
                {!reservado && s.destaque && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#E60012] px-3 py-1 text-xs font-black text-white">Escolha da loja</span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-lg font-extrabold leading-snug text-white">{nome}</h3>
                <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    <dt className="sr-only">Processador</dt>
                    <dd>{s.processador}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    <dt className="sr-only">Memória</dt>
                    <dd>{s.memoria}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                    <dt className="sr-only">Armazenamento</dt>
                    <dd>{s.armazenamento}</dd>
                  </div>
                  {s.tela && (
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                      <dt className="sr-only">Tela</dt>
                      <dd>
                        {s.tela}
                        {s.placaDeVideo ? `, ${s.placaDeVideo}` : ""}
                      </dd>
                    </div>
                  )}
                  {s.bateria && (
                    <div className="flex items-center gap-2">
                      <BatteryMedium className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                      <dt className="sr-only">Bateria</dt>
                      <dd>Bateria: {s.bateria}</dd>
                    </div>
                  )}
                </dl>

                <p className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-200">Grau {s.grau}</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-slate-200">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    {s.garantiaMeses} meses de garantia
                  </span>
                  {s.sistema && <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-200">{s.sistema}</span>}
                </p>
                {s.observacoes && <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.observacoes}</p>}

                <div className="mt-auto pt-5">
                  <p className="text-2xl font-black tracking-tight text-white">
                    {reais(s.precoVista)} <span className="text-sm font-semibold text-slate-400">à vista</span>
                  </p>
                  {s.precoCartao && (
                    <p className="text-sm text-slate-400">
                      ou {reais(s.precoCartao)} no cartão
                      {s.parcelas ? ` em até ${s.parcelas}x de ${reais(s.precoCartao / s.parcelas)}` : ""}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setAberto(s)}
                    className={`mt-4 w-full rounded-2xl px-5 py-3.5 font-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      reservado ? "border border-slate-600 text-slate-200 hover:border-slate-400" : "bg-[#E60012] text-white hover:bg-red-700"
                    }`}
                  >
                    {reservado ? "Avise se ele voltar" : "Reservar este"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {aberto && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6" onClick={() => setAberto(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reserva-titulo"
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#111827] p-6 sm:rounded-3xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAberto(null)} aria-label="Fechar" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h2 id="reserva-titulo" className="pr-8 text-xl font-black text-white">
              {aberto.situacao === "reservado" ? "Avisar se voltar" : "Reservar"} {nomeDoAparelho(aberto)}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {aberto.situacao === "reservado"
                ? "Se a reserva cair, você é o primeiro a saber."
                : "Para você ver e testar na loja antes de fechar. O vendedor confirma a reserva e combina o horário pelo WhatsApp."}
            </p>
            <div className="mt-5">
              <FormularioDeLead
                interesse={aberto.situacao === "reservado" ? "lista" : "reservar"}
                bloco="vitrine"
                botao={aberto.situacao === "reservado" ? "Me avise no WhatsApp" : "Reservar pelo WhatsApp"}
                aparelho={{ id: aberto.id, nome: nomeDoAparelho(aberto) }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
