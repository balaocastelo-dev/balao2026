"use client";

import type { RegraRecorrencia } from "./tipos";
import { DIAS_CURTOS, hojeLocal } from "./util";

const OPCOES: { tipo: RegraRecorrencia["tipo"]; rotulo: string; dica: string }[] = [
  { tipo: "unica", rotulo: "Publicação única", dica: "Sai uma vez, na data e hora escolhidas." },
  { tipo: "diaria", rotulo: "Todos os dias", dica: "Republica todo dia no(s) horário(s)." },
  { tipo: "dias_uteis", rotulo: "Dias úteis", dica: "De segunda a sexta." },
  { tipo: "semanal", rotulo: "Semanal", dica: "Escolha os dias da semana." },
];

export default function EditorRecorrencia({
  valor,
  onChange,
  idBase,
}: {
  valor: RegraRecorrencia;
  onChange: (r: RegraRecorrencia) => void;
  idBase: string;
}) {
  const horarios = valor.tipo === "unica" ? [] : valor.horarios;

  const trocarTipo = (tipo: RegraRecorrencia["tipo"]) => {
    if (tipo === valor.tipo) return;
    const hora = valor.tipo === "unica" ? valor.hora : valor.horarios[0] || "09:00";
    if (tipo === "unica") onChange({ tipo, data: hojeLocal(), hora });
    else if (tipo === "semanal") onChange({ tipo, dias: [1], horarios: horarios.length ? horarios : [hora] });
    else onChange({ tipo, horarios: horarios.length ? horarios : [hora] });
  };

  const mudarHorario = (i: number, h: string) => {
    if (valor.tipo === "unica") return;
    const lista = [...valor.horarios];
    lista[i] = h;
    onChange({ ...valor, horarios: lista });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Recorrência">
        {OPCOES.map((o) => (
          <button
            key={o.tipo}
            type="button"
            role="radio"
            aria-checked={valor.tipo === o.tipo}
            onClick={() => trocarTipo(o.tipo)}
            title={o.dica}
            className={`rounded-lg border px-2 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
              valor.tipo === o.tipo
                ? "border-[#0f9d58] bg-[#e7f6ec] text-[#0a6e3d]"
                : "border-[#e3e3e3] bg-white text-[#3c4043] hover:border-[#0f9d58]"
            }`}
          >
            {o.rotulo}
            <span className="block font-normal text-[10px] text-[#5f6368] mt-0.5">{o.dica}</span>
          </button>
        ))}
      </div>

      {valor.tipo === "unica" ? (
        <div className="flex flex-wrap gap-3">
          <label className="text-xs text-[#3c4043]">
            Data
            <input
              id={`${idBase}-data`}
              type="date"
              min={hojeLocal()}
              value={valor.data}
              onChange={(e) => onChange({ ...valor, data: e.target.value })}
              className="block mt-1 border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-[#3c4043]">
            Hora
            <input
              id={`${idBase}-hora`}
              type="time"
              value={valor.hora}
              onChange={(e) => onChange({ ...valor, hora: e.target.value })}
              className="block mt-1 border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {valor.tipo === "semanal" && (
            <div>
              <div className="text-xs text-[#3c4043] mb-1">Dias da semana</div>
              <div className="flex flex-wrap gap-1.5">
                {DIAS_CURTOS.map((d, i) => {
                  const ativo = valor.dias.includes(i);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() =>
                        onChange({
                          ...valor,
                          dias: ativo ? valor.dias.filter((x) => x !== i) : [...valor.dias, i].sort(),
                        })
                      }
                      className={`w-11 rounded-full border py-1 text-xs font-semibold cursor-pointer ${
                        ativo ? "bg-[#0f9d58] border-[#0f9d58] text-white" : "bg-white border-[#e3e3e3] text-[#3c4043]"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-[#3c4043] mb-1">Horários</div>
            <div className="flex flex-wrap items-center gap-2">
              {valor.horarios.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <input
                    id={`${idBase}-h${i}`}
                    type="time"
                    value={h}
                    onChange={(e) => mudarHorario(i, e.target.value)}
                    className="border border-[#e3e3e3] rounded-md px-2 py-1 text-sm"
                  />
                  {valor.horarios.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remover horário ${h}`}
                      onClick={() => onChange({ ...valor, horarios: valor.horarios.filter((_, j) => j !== i) })}
                      className="text-[#9aa0a6] hover:text-[#d93025] text-sm px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
              {valor.horarios.length < 12 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...valor, horarios: [...valor.horarios, "18:00"] })}
                  className="text-xs font-semibold text-[#0a6e3d] border border-dashed border-[#0f9d58] rounded-md px-2 py-1 cursor-pointer"
                >
                  + horário
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs text-[#3c4043]">
              Começa em <span className="text-[#9aa0a6]">(opcional)</span>
              <input
                id={`${idBase}-inicio`}
                type="date"
                value={valor.inicio || ""}
                onChange={(e) => onChange({ ...valor, inicio: e.target.value || undefined })}
                className="block mt-1 border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-[#3c4043]">
              Termina em <span className="text-[#9aa0a6]">(opcional)</span>
              <input
                id={`${idBase}-fim`}
                type="date"
                value={valor.fim || ""}
                onChange={(e) => onChange({ ...valor, fim: e.target.value || undefined })}
                className="block mt-1 border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
