"use client";

import { useMemo, useState } from "react";
import type React from "react";
import EditorRecorrencia from "./EditorRecorrencia";
import type { PonteStatus, RegraRecorrencia, StatusConteudo, StatusResumo } from "./tipos";
import { regraPadrao } from "./util";

type Quando = "agora" | "agendar" | "rascunho";

const LIMITE_TEXTO = 700;

// Fora do componente: definido dentro, cada tecla recriaria a seção e o
// campo perderia o foco.
function Secao({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#eef0ee] pb-4">
      <h3 className="text-sm font-bold text-[#202124] mb-2 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-[#0f9d58] text-white text-xs flex items-center justify-center">{n}</span>
        {titulo}
      </h3>
      {children}
    </section>
  );
}

/** Mesma montagem do servidor (status/servico.js → montarTexto), para a prévia. */
function montarTexto(texto: string, link: string, assinar: boolean, config: StatusResumo["config"]) {
  const partes = [texto.trim()];
  const l = link.trim();
  if (l && !partes[0].includes(l)) partes.push(`👉 ${l}`);
  if (assinar && config.assinatura.ativa) {
    const ass = config.assinatura.texto.trim();
    if (ass && !partes.join("\n").includes(ass)) partes.push(ass);
  }
  return partes.filter(Boolean).join("\n\n");
}

export default function EditorStatus({
  ponte,
  resumo,
  inicial,
  quandoInicial = "agendar",
  regraInicial,
  somenteBiblioteca = false,
  aoConcluir,
  aoCancelar,
}: {
  ponte: PonteStatus;
  resumo: StatusResumo;
  inicial?: StatusConteudo | null;
  quandoInicial?: Quando;
  regraInicial?: RegraRecorrencia;
  somenteBiblioteca?: boolean;
  aoConcluir: () => void;
  aoCancelar: () => void;
}) {
  const { config } = resumo;
  const [titulo, setTitulo] = useState(inicial?.titulo || "");
  const [texto, setTexto] = useState(inicial?.texto || "");
  const [link, setLink] = useState(inicial?.link || "");
  const [cor, setCor] = useState(inicial?.corFundo || resumo.cores[0]);
  const [categoria, setCategoria] = useState(inicial?.categoria || "");
  const [campanha, setCampanha] = useState(inicial?.campanha || "");
  const [assinar, setAssinar] = useState(inicial ? inicial.assinar : config.assinatura.ativa);
  const [selo, setSelo] = useState(inicial ? inicial.selo : true);
  const [midia, setMidia] = useState<{ dataUrl: string; mime: string; nome: string } | null>(null);
  const [removerMidia, setRemoverMidia] = useState(false);
  const [quando, setQuando] = useState<Quando>(somenteBiblioteca ? "rascunho" : quandoInicial);
  const [regra, setRegra] = useState<RegraRecorrencia>(regraInicial || regraPadrao());
  const [salvarNaBiblioteca, setSalvarNaBiblioteca] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const midiaExistente = !removerMidia && !midia && inicial?.midia ? inicial : null;
  const tipo: "texto" | "imagem" | "video" = midia
    ? midia.mime.startsWith("video/")
      ? "video"
      : "imagem"
    : midiaExistente
    ? (midiaExistente.tipo as "imagem" | "video")
    : "texto";
  const srcPrevia = midia ? midia.dataUrl : midiaExistente ? ponte.urlMidia(midiaExistente.midia) : null;
  const textoFinal = useMemo(() => montarTexto(texto, link, assinar, config), [texto, link, assinar, config]);

  const escolherArquivo = (arquivo: File | undefined) => {
    setErro(null);
    if (!arquivo) return;
    const video = arquivo.type.startsWith("video/");
    if (!video && !/^image\/(jpeg|png|webp)$/.test(arquivo.type)) {
      setErro("Use foto JPG, PNG ou WEBP, ou vídeo MP4.");
      return;
    }
    if (arquivo.size > (video ? 60 : 10) * 1024 * 1024) {
      setErro(video ? "Vídeo acima de 60 MB." : "Imagem acima de 10 MB.");
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => setMidia({ dataUrl: String(leitor.result), mime: arquivo.type, nome: arquivo.name });
    leitor.readAsDataURL(arquivo);
  };

  const confirmar = async () => {
    setErro(null);
    if (tipo === "texto" && !texto.trim()) {
      setErro("Escreva o texto do status ou escolha uma foto/vídeo.");
      return;
    }
    setEnviando(true);
    try {
      // Editar um status (ou um modelo, na biblioteca) atualiza o mesmo.
      // Usar um modelo para publicar trabalha numa CÓPIA (com a mídia dele),
      // e o modelo continua intacto na biblioteca.
      let idAlvo: string | undefined = inicial?.id;
      if (inicial?.modelo && !somenteBiblioteca) {
        const { conteudo: copia } = await ponte.chamar<{ conteudo: StatusConteudo }>(
          `/api/status/conteudos/${inicial.id}/duplicar`,
          { method: "POST", body: JSON.stringify({ comoModelo: false }) }
        );
        idAlvo = copia.id;
      }
      const { conteudo } = await ponte.chamar<{ conteudo: StatusConteudo }>("/api/status/conteudos", {
        method: "POST",
        body: JSON.stringify({
          id: idAlvo,
          titulo,
          texto,
          link,
          corFundo: cor,
          categoria: categoria || null,
          campanha,
          assinar,
          selo,
          modelo: somenteBiblioteca,
          midiaDataUrl: midia?.dataUrl,
          removerMidia,
        }),
      });

      const alvo = conteudo;

      if (salvarNaBiblioteca && !somenteBiblioteca) {
        await ponte.chamar(`/api/status/conteudos/${alvo.id}/duplicar`, {
          method: "POST",
          body: JSON.stringify({ comoModelo: true }),
        });
      }

      if (quando === "agora") {
        const { resultado } = await ponte.chamar<{ resultado: { situacao: string; erro: string | null } }>(
          `/api/status/conteudos/${alvo.id}/publicar`,
          { method: "POST", body: "{}" }
        );
        if (resultado.situacao === "publicado") ponte.avisar("✅ Status publicado.");
        else ponte.avisar(`⚠️ ${resultado.erro || "O status não foi publicado."} Veja em Falharam.`);
      } else if (quando === "agendar") {
        await ponte.chamar("/api/status/agendamentos", {
          method: "POST",
          body: JSON.stringify({ conteudoId: alvo.id, regra }),
        });
        ponte.avisar("🗓️ Status agendado.");
      } else {
        ponte.avisar(somenteBiblioteca ? "📚 Modelo salvo na biblioteca." : "Status salvo.");
      }
      aoConcluir();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-5">
      <div className="space-y-4 min-w-0">
        <Secao n={1} titulo="Conteúdo">
          <div className="space-y-2">
            <input
              id="status-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.slice(0, 80))}
              placeholder="Nome interno (ex.: Oferta da semana — notebooks)"
              className="w-full border border-[#e3e3e3] rounded-md px-3 py-2 text-sm"
            />
            <textarea
              id="status-texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, LIMITE_TEXTO))}
              rows={4}
              placeholder={tipo === "texto" ? "Texto do status…" : "Legenda (opcional)…"}
              className="w-full border border-[#e3e3e3] rounded-md px-3 py-2 text-sm resize-y"
            />
            <div className="text-[10px] text-right text-[#9aa0a6] -mt-1">
              {texto.length}/{LIMITE_TEXTO}
            </div>
            <input
              id="status-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link (opcional) — ex.: https://balao.info/notebooks"
              className="w-full border border-[#e3e3e3] rounded-md px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-[#0a6e3d] border border-[#0f9d58] rounded-md px-3 py-1.5 cursor-pointer hover:bg-[#e7f6ec]">
                📷 Foto ou vídeo
                <input
                  id="status-midia"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4"
                  className="hidden"
                  onChange={(e) => {
                    escolherArquivo(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {(midia || midiaExistente) && (
                <button
                  type="button"
                  onClick={() => {
                    setMidia(null);
                    setRemoverMidia(true);
                  }}
                  className="text-xs text-[#d93025] hover:underline cursor-pointer"
                >
                  Remover mídia (vira status de texto)
                </button>
              )}
              {tipo === "texto" && (
                <div className="flex items-center gap-1.5" aria-label="Cor de fundo">
                  {resumo.cores.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Cor ${c}`}
                      aria-pressed={cor === c}
                      onClick={() => setCor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer ${cor === c ? "ring-2 ring-offset-2 ring-[#0f9d58]" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                id="status-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Categoria…</option>
                {resumo.categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                id="status-campanha"
                value={campanha}
                onChange={(e) => setCampanha(e.target.value.slice(0, 60))}
                placeholder="Campanha (opcional) — ex.: Black Friday"
                className="flex-1 min-w-[180px] border border-[#e3e3e3] rounded-md px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </Secao>

        {!somenteBiblioteca && (
          <Secao n={2} titulo="Quando publicar?">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Quando publicar">
              {(
                [
                  ["agora", "Publicar agora"],
                  ["agendar", "Agendar"],
                  ["rascunho", "Só salvar"],
                ] as [Quando, string][]
              ).map(([v, r]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={quando === v}
                  onClick={() => setQuando(v)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold cursor-pointer ${
                    quando === v ? "bg-[#0f9d58] border-[#0f9d58] text-white" : "bg-white border-[#e3e3e3] text-[#3c4043]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Secao>
        )}

        {!somenteBiblioteca && quando === "agendar" && (
          <Secao n={3} titulo="Recorrência">
            <EditorRecorrencia valor={regra} onChange={setRegra} idBase="status-regra" />
          </Secao>
        )}

        <Secao n={somenteBiblioteca ? 2 : quando === "agendar" ? 4 : 3} titulo="Assinatura da loja">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input id="status-assinar" type="checkbox" checked={assinar} onChange={(e) => setAssinar(e.target.checked)} className="mt-1" />
            <span>
              Adicionar a assinatura no fim do {tipo === "texto" ? "texto" : "legenda"}
              {!config.assinatura.ativa && (
                <span className="block text-[11px] text-amber-700">
                  A assinatura automática está desligada nas Configurações.
                </span>
              )}
            </span>
          </label>
          {tipo === "imagem" && (
            <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
              <input id="status-selo" type="checkbox" checked={selo} onChange={(e) => setSelo(e.target.checked)} />
              Selo “balao.info” no canto da imagem (a foto original fica guardada sem o selo)
            </label>
          )}
          {tipo === "video" && (
            <p className="text-[11px] text-[#5f6368] mt-2">Vídeos levam a assinatura só na legenda, sem alterar o vídeo.</p>
          )}
        </Secao>

        {!somenteBiblioteca && (
          <label className="flex items-center gap-2 text-xs text-[#3c4043] cursor-pointer">
            <input id="status-biblioteca" type="checkbox" checked={salvarNaBiblioteca} onChange={(e) => setSalvarNaBiblioteca(e.target.checked)} />
            Guardar também como modelo na Biblioteca
          </label>
        )}

        {erro && (
          <p role="alert" className="text-sm text-[#b3261e] bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {erro}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" onClick={aoCancelar} className="px-4 py-2 text-sm rounded-lg text-[#3c4043] hover:bg-[#f0f2f5] cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={enviando}
            className="px-5 py-2 text-sm font-bold rounded-lg bg-[#0f9d58] hover:bg-[#0a6e3d] text-white disabled:opacity-60 cursor-pointer"
          >
            {enviando
              ? "Enviando…"
              : somenteBiblioteca
              ? "Salvar modelo"
              : quando === "agora"
              ? "Confirmar e publicar"
              : quando === "agendar"
              ? "Confirmar agendamento"
              : "Salvar"}
          </button>
        </div>
      </div>

      {/* Prévia aproximada, como no celular */}
      <aside aria-label="Prévia do status" className="lg:sticky lg:top-0 self-start">
        <div className="text-xs font-bold text-[#5f6368] mb-2">Prévia</div>
        <div className="mx-auto w-[260px] aspect-[9/16] rounded-[28px] bg-black p-2 shadow-lg">
          <div className="relative w-full h-full rounded-[22px] overflow-hidden flex flex-col" style={{ backgroundColor: tipo === "texto" ? cor : "#000" }}>
            <div className="absolute top-2 left-3 right-3 h-0.5 bg-white/40 rounded">
              <div className="h-full w-1/3 bg-white rounded" />
            </div>
            <div className="absolute top-4 left-3 flex items-center gap-2 text-white text-[11px] font-semibold z-10">
              <span className="w-6 h-6 rounded-full bg-[#0f9d58] flex items-center justify-center text-[10px]">B</span>
              Balão da Informática
            </div>
            {tipo === "texto" ? (
              <div className="flex-1 flex items-center justify-center px-5 text-center text-white text-[15px] leading-snug whitespace-pre-wrap break-words overflow-hidden">
                {textoFinal || "Seu texto aparece aqui"}
              </div>
            ) : (
              <>
                <div className="flex-1 relative flex items-center justify-center">
                  {tipo === "video" ? (
                    <video src={srcPrevia || undefined} className="max-h-full max-w-full" muted autoPlay loop playsInline />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={srcPrevia || ""} alt="" className="max-h-full max-w-full object-contain" />
                  )}
                  {tipo === "imagem" && selo && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-[#0a6e3d]/85 text-white text-[9px] font-bold px-2 py-0.5">
                      balao.info
                    </span>
                  )}
                </div>
                {textoFinal && (
                  <div className="bg-black/60 text-white text-[11px] leading-snug px-3 py-2 whitespace-pre-wrap max-h-[38%] overflow-y-auto">
                    {textoFinal}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <p className="text-[10px] text-[#9aa0a6] text-center mt-2">
          Aproximação. Aparece para quem tem o número da loja salvo.
        </p>
      </aside>
    </div>
  );
}
