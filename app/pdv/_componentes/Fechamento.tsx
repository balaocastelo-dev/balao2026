"use client";

// Fechar a venda: pagamento, cliente (o /sistema preenche quem já é cliente) e nota.

import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Banknote, CreditCard, FileText, Landmark, QrCode, Receipt, ScanLine, Split, X } from "lucide-react";
import { generatePixPayload } from "@/lib/pix";
import { SITE_CONFIG } from "@/lib/config";
import { centavos, conferirVenda, documentoValido, formatarDocumento, reais, soDigitos, totaisDa } from "@/lib/pdv/calculos";
import { NOMES_DAS_FORMAS, type ClienteDaVenda, type FormaDePagamento, type Pagamento } from "@/lib/pdv/tipos";
import type { Acao, EstadoDoCaixa } from "./estado";

const FORMAS: { forma: FormaDePagamento; icone: typeof QrCode }[] = [
  { forma: "pix", icone: QrCode },
  { forma: "dinheiro", icone: Banknote },
  { forma: "credito", icone: CreditCard },
  { forma: "debito", icone: ScanLine },
  { forma: "boleto", icone: Landmark },
];

const lerValor = (s: string) => {
  const n = Number(String(s).replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const mostrarValor = (n: number | null | undefined) => (n ? n.toFixed(2).replace(".", ",") : "");

interface Props {
  estado: EstadoDoCaixa;
  despachar: React.Dispatch<Acao>;
  vendedor: { id: string; nome: string } | null;
  sistemaLigado: boolean;
  enviando: boolean;
  erro: string | null;
  aoVoltar: () => void;
  aoFinalizar: () => void;
}

export default function Fechamento({ estado, despachar, vendedor, sistemaLigado, enviando, erro, aoVoltar, aoFinalizar }: Props) {
  const t = totaisDa(estado);
  const [dividir, setDividir] = useState(estado.pagamentos.length > 1);
  const pagamentos = estado.pagamentos;
  const pagar = (p: Pagamento[]) => despachar({ tipo: "pagamentos", pagamentos: p });

  // Pagamento único acompanha o total (o crédito muda a tabela e o total junto).
  useEffect(() => {
    if (!dividir && pagamentos.length === 1 && Math.abs(pagamentos[0].valor - t.total) > 0.004) {
      pagar([{ ...pagamentos[0], valor: t.total }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.total, dividir]);

  function escolherForma(forma: FormaDePagamento) {
    if (!dividir) {
      pagar([{ forma, valor: t.total, recebido: null, parcelas: forma === "credito" ? 1 : null }]);
      return;
    }
    const resto = centavos(Math.max(0, t.total - t.pago));
    if (resto <= 0) return; // já está tudo lançado: ajuste os valores antes de pôr outra forma
    pagar([...pagamentos, { forma, valor: resto, recebido: null, parcelas: forma === "credito" ? 1 : null }]);
  }

  const problemas = conferirVenda({ ...estado, vendedor } as never).filter((p) => p.campo !== "itens" || estado.itens.length === 0);
  const semVendedor = !vendedor;
  const pode = !problemas.length && !semVendedor && !enviando;
  const pix = pagamentos.find((p) => p.forma === "pix");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--linha)] px-5 py-4 lg:px-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Fechar a venda</h2>
          <p className="text-sm text-[var(--texto-suave)]">
            {estado.itens.reduce((s, i) => s + i.quantidade, 0)} itens, vendedor {vendedor?.nome ?? "não escolhido"}
          </p>
        </div>
        <button onClick={aoVoltar} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[var(--texto-suave)] hover:bg-white/5 hover:text-white">
          <X className="h-5 w-5" aria-hidden /> Voltar à venda
        </button>
      </div>

      <div className="pdv-rolagem grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:p-8">
        {/* ---------------- pagamento */}
        <section aria-labelledby="titulo-pagamento" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 id="titulo-pagamento" className="text-lg font-bold">
              Pagamento
            </h3>
            <button
              onClick={() => {
                setDividir(!dividir);
                if (dividir && pagamentos.length > 1) pagar([{ ...pagamentos[0], valor: t.total }]);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-[var(--texto-suave)] hover:text-white"
            >
              <Split className="h-4 w-4" aria-hidden /> {dividir ? "Uma forma só" : "Dividir em duas formas"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {FORMAS.map(({ forma, icone: Icone }) => {
              const ativa = !dividir && pagamentos[0]?.forma === forma;
              return (
                <button
                  key={forma}
                  onClick={() => escolherForma(forma)}
                  aria-pressed={ativa}
                  className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-sm font-semibold transition ${
                    ativa ? "border-[var(--vermelho)] bg-[var(--vermelho)]/10 text-white" : "border-[var(--linha)] bg-[var(--superficie)] text-slate-200 hover:border-slate-500"
                  }`}
                >
                  <Icone className="h-6 w-6" aria-hidden />
                  {forma === "credito" ? "Crédito" : forma === "debito" ? "Débito" : NOMES_DAS_FORMAS[forma]}
                </button>
              );
            })}
          </div>

          {pagamentos.length > 0 && (
            <ul className="space-y-2">
              {pagamentos.map((p, n) => (
                <li key={n} className="rounded-2xl border border-[var(--linha)] bg-[var(--painel)] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="min-w-[8rem] font-semibold">{NOMES_DAS_FORMAS[p.forma]}</span>
                    {dividir ? (
                      <input
                        inputMode="decimal"
                        aria-label={`Valor em ${NOMES_DAS_FORMAS[p.forma]}`}
                        defaultValue={mostrarValor(p.valor)}
                        onBlur={(e) => pagar(pagamentos.map((x, i) => (i === n ? { ...x, valor: centavos(lerValor(e.target.value)) } : x)))}
                        className="pdv-numeros w-32 rounded-xl border border-[var(--linha)] bg-[var(--carvao)] px-3 py-2 text-right outline-none focus:border-[var(--vermelho)]"
                      />
                    ) : (
                      <span className="pdv-numeros text-lg font-black">{reais(p.valor)}</span>
                    )}
                    {p.forma === "credito" && (
                      <select
                        value={p.parcelas ?? 1}
                        onChange={(e) => pagar(pagamentos.map((x, i) => (i === n ? { ...x, parcelas: Number(e.target.value) } : x)))}
                        aria-label="Parcelas"
                        className="rounded-xl border border-[var(--linha)] bg-[var(--carvao)] px-3 py-2"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((k) => (
                          <option key={k} value={k}>
                            {k === 1 ? "à vista" : `${k}x de ${reais(p.valor / k)}`}
                          </option>
                        ))}
                      </select>
                    )}
                    {p.forma === "dinheiro" && (
                      <label className="flex items-center gap-2 text-sm text-[var(--texto-suave)]">
                        Recebido
                        <input
                          inputMode="decimal"
                          defaultValue={mostrarValor(p.recebido)}
                          onChange={(e) => pagar(pagamentos.map((x, i) => (i === n ? { ...x, recebido: centavos(lerValor(e.target.value)) || null } : x)))}
                          className="pdv-numeros w-28 rounded-xl border border-[var(--linha)] bg-[var(--carvao)] px-3 py-2 text-right text-white outline-none focus:border-[var(--vermelho)]"
                        />
                      </label>
                    )}
                    {dividir && (
                      <button
                        onClick={() => pagar(pagamentos.filter((_, i) => i !== n))}
                        className="ml-auto rounded-lg p-1.5 text-[var(--texto-suave)] hover:bg-white/5 hover:text-white"
                        aria-label={`Tirar ${NOMES_DAS_FORMAS[p.forma]}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {p.forma === "dinheiro" && p.recebido && p.recebido > p.valor ? (
                    <p className="pdv-numeros mt-3 text-2xl font-black">Troco {reais(p.recebido - p.valor)}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {dividir && t.falta > 0 && <p className="pdv-numeros text-sm text-[var(--texto-suave)]">Falta lançar {reais(t.falta)}. Escolha a outra forma acima.</p>}

          {pix && pix.valor > 0 && <PixNoBalcao valor={pix.valor} />}
        </section>

        {/* ---------------- cliente e nota */}
        <section aria-labelledby="titulo-cliente" className="space-y-4">
          <h3 id="titulo-cliente" className="text-lg font-bold">
            Cliente
          </h3>
          <Cliente cliente={estado.cliente} pedirNota={estado.pedirNota} sistemaLigado={sistemaLigado} mudar={(c) => despachar({ tipo: "cliente", cliente: c })} />

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
              estado.pedirNota ? "border-[var(--vermelho)] bg-[var(--vermelho)]/10" : "border-[var(--linha)] bg-[var(--painel)]"
            }`}
          >
            <input
              type="checkbox"
              checked={estado.pedirNota}
              onChange={(e) => despachar({ tipo: "nota", pedir: e.target.checked })}
              className="mt-1 h-5 w-5 accent-[#e60012]"
            />
            <span>
              <span className="flex items-center gap-2 font-bold">
                <FileText className="h-5 w-5" aria-hidden /> Emitir nota fiscal (NF-e)
              </span>
              <span className="mt-1 block text-sm text-[var(--texto-suave)]">
                O sistema gera a nota pela venda e manda para a Sefaz na hora. Precisa de CPF/CNPJ e endereço completo; se faltar algo, ele diz o quê.
                {estado.cliente.email ? " O cliente recebe a nota no e-mail." : ""}
              </span>
            </span>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Observação (sai no comprovante e no pedido)</span>
            <textarea
              rows={2}
              value={estado.observacao}
              onChange={(e) => despachar({ tipo: "observacao", texto: e.target.value })}
              placeholder="Garantia de 90 dias na instalação"
              className="w-full rounded-xl border border-[var(--linha)] bg-[var(--carvao)] px-3 py-2.5 outline-none focus:border-[var(--vermelho)]"
            />
          </label>
        </section>
      </div>

      <div className="border-t border-[var(--linha)] bg-[var(--painel)] px-5 py-4 lg:px-8">
        {(problemas.length > 0 || semVendedor || erro) && (
          <ul className="mb-3 space-y-1 text-sm">
            {semVendedor && <li className="text-red-200">Escolha o vendedor no alto da tela: a venda entra no sistema com o nome dele (é dele a comissão).</li>}
            {problemas.slice(0, 3).map((p, i) => (
              <li key={i} className="text-red-200">
                {p.mensagem}
              </li>
            ))}
            {erro && <li className="font-semibold text-red-200">{erro}</li>}
          </ul>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="pdv-numeros">
            <div className="text-sm text-[var(--texto-suave)]">
              Total {t.desconto > 0 ? `com ${reais(t.desconto)} de desconto` : ""}
            </div>
            <div className="text-3xl font-black tracking-tight">{reais(t.total)}</div>
          </div>
          <div className="flex items-center gap-3">
            {!sistemaLigado && <span className="max-w-[16rem] text-xs text-[var(--texto-suave)]">Sistema fora agora: a venda fica gravada e entra sozinha quando ele voltar.</span>}
            <button
              onClick={aoFinalizar}
              disabled={!pode}
              className="flex items-center gap-2 rounded-2xl bg-[var(--vermelho)] px-8 py-4 text-lg font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Receipt className="h-5 w-5" aria-hidden />
              {enviando ? (estado.pedirNota ? "Lançando e emitindo a nota…" : "Lançando no sistema…") : estado.pedirNota ? "Finalizar e emitir nota" : "Finalizar venda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PixNoBalcao({ valor }: { valor: number }) {
  const payload = useMemo(
    () => generatePixPayload({ key: SITE_CONFIG.pix.cnpj, name: SITE_CONFIG.pix.name, city: SITE_CONFIG.pix.city, amount: valor, txid: "PDVBALAO" }),
    [valor]
  );
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-[var(--linha)] bg-[var(--painel)] p-4">
      <div className="rounded-xl bg-white p-2">
        <QRCodeSVG value={payload} size={132} level="M" />
      </div>
      <div className="min-w-0 space-y-2">
        <p className="font-semibold">Pix para o CNPJ da loja</p>
        <p className="pdv-numeros text-2xl font-black">{reais(valor)}</p>
        <p className="text-sm text-[var(--texto-suave)]">Vire a tela para o cliente ou copie o código. Confira o recebimento antes de finalizar.</p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(payload).then(() => {
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            });
          }}
          className="rounded-lg border border-[var(--linha)] px-3 py-1.5 text-sm hover:border-slate-500"
        >
          {copiado ? "Código copiado" : "Copiar Pix copia e cola"}
        </button>
      </div>
    </div>
  );
}

export function Cliente({
  cliente,
  pedirNota,
  sistemaLigado,
  mudar,
}: {
  cliente: ClienteDaVenda;
  pedirNota: boolean;
  sistemaLigado: boolean;
  mudar: (c: Partial<ClienteDaVenda>) => void;
}) {
  const [busca, setBusca] = useState<"" | "procurando" | "achado" | "novo" | "sem-sistema">("");
  const [cepBusca, setCepBusca] = useState("");
  const [enderecoAberto, setEnderecoAberto] = useState(Boolean(cliente.cep));
  const ultimoDoc = useRef("");
  const ultimoCep = useRef("");
  const doc = soDigitos(cliente.documento);

  // CPF/CNPJ válido: procura no /sistema e preenche o que ele já sabe.
  useEffect(() => {
    if (!documentoValido(doc) || ultimoDoc.current === doc) return;
    ultimoDoc.current = doc;
    if (!sistemaLigado) {
      setBusca("sem-sistema");
      return;
    }
    setBusca("procurando");
    fetch(`/api/pdv/clientes?documento=${doc}`)
      .then((r) => r.json())
      .then((j: { cliente?: ClienteDaVenda | null }) => {
        if (j.cliente) {
          const c = j.cliente;
          mudar({
            sistemaId: c.sistemaId ?? null,
            nome: c.nome || cliente.nome,
            email: c.email || cliente.email,
            telefone: c.telefone || cliente.telefone,
            ...(c.cep ? { cep: c.cep, endereco: c.endereco, numero: c.numero, complemento: c.complemento, bairro: c.bairro, cidade: c.cidade, uf: c.uf } : {}),
          });
          if (c.cep) setEnderecoAberto(true);
          setBusca("achado");
        } else {
          mudar({ sistemaId: null });
          setBusca("novo");
        }
      })
      .catch(() => setBusca("sem-sistema"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, sistemaLigado]);

  // CEP completo: rua, bairro e cidade pelo ViaCEP.
  const cep = soDigitos(cliente.cep);
  useEffect(() => {
    if (cep.length !== 8 || ultimoCep.current === cep) return;
    ultimoCep.current = cep;
    setCepBusca("procurando");
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((r) => r.json())
      .then((j: { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => {
        if (j.erro) {
          setCepBusca("CEP não encontrado");
          return;
        }
        mudar({ endereco: j.logradouro || cliente.endereco, bairro: j.bairro || cliente.bairro, cidade: j.localidade || "", uf: j.uf || "" });
        setCepBusca("");
      })
      .catch(() => setCepBusca(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep]);

  const mostrarEndereco = pedirNota || enderecoAberto;
  const campo = "w-full rounded-xl border border-[var(--linha)] bg-[var(--carvao)] px-3 py-2.5 outline-none focus:border-[var(--vermelho)]";

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--linha)] bg-[var(--painel)] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-[var(--texto-suave)]">CPF ou CNPJ</span>
          <input
            inputMode="numeric"
            value={doc.length === 11 || doc.length === 14 ? formatarDocumento(doc) : cliente.documento}
            onChange={(e) => mudar({ documento: soDigitos(e.target.value).slice(0, 14) })}
            placeholder="Vazio = consumidor final"
            className={`${campo} pdv-numeros`}
          />
          <span className="mt-1 block min-h-[1.25rem] text-xs text-[var(--texto-suave)]" aria-live="polite">
            {doc && !documentoValido(doc) && (doc.length === 11 || doc.length === 14)
              ? "Documento inválido."
              : busca === "procurando"
                ? "Procurando no sistema…"
                : busca === "achado"
                  ? "Cliente do sistema: dados preenchidos."
                  : busca === "novo"
                    ? "Cliente novo: será cadastrado no sistema."
                    : busca === "sem-sistema"
                      ? "Sem o sistema agora: preencha à mão."
                      : ""}
          </span>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--texto-suave)]">Nome</span>
          <input value={cliente.nome} onChange={(e) => mudar({ nome: e.target.value })} className={campo} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--texto-suave)]">Celular (WhatsApp)</span>
          <input inputMode="tel" value={cliente.telefone} onChange={(e) => mudar({ telefone: soDigitos(e.target.value).slice(0, 13) })} className={`${campo} pdv-numeros`} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--texto-suave)]">E-mail</span>
          <input type="email" value={cliente.email} onChange={(e) => mudar({ email: e.target.value })} className={campo} />
        </label>
      </div>

      {mostrarEndereco ? (
        <div className="grid grid-cols-6 gap-3 border-t border-[var(--linha)] pt-3">
          <label className="col-span-2 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">CEP</span>
            <input inputMode="numeric" value={cliente.cep} onChange={(e) => mudar({ cep: soDigitos(e.target.value).slice(0, 8) })} className={`${campo} pdv-numeros`} />
            {cepBusca && <span className="mt-1 block text-xs text-[var(--texto-suave)]">{cepBusca === "procurando" ? "Buscando o CEP…" : cepBusca}</span>}
          </label>
          <label className="col-span-4 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Rua</span>
            <input value={cliente.endereco} onChange={(e) => mudar({ endereco: e.target.value })} className={campo} />
          </label>
          <label className="col-span-2 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Número</span>
            <input value={cliente.numero} onChange={(e) => mudar({ numero: e.target.value })} className={campo} />
          </label>
          <label className="col-span-4 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Complemento</span>
            <input value={cliente.complemento} onChange={(e) => mudar({ complemento: e.target.value })} className={campo} />
          </label>
          <label className="col-span-3 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Bairro</span>
            <input value={cliente.bairro} onChange={(e) => mudar({ bairro: e.target.value })} className={campo} />
          </label>
          <label className="col-span-2 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Cidade</span>
            <input value={cliente.cidade} onChange={(e) => mudar({ cidade: e.target.value })} className={campo} />
          </label>
          <label className="col-span-1 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">UF</span>
            <input value={cliente.uf} maxLength={2} onChange={(e) => mudar({ uf: e.target.value.toUpperCase() })} className={campo} />
          </label>
        </div>
      ) : (
        <button onClick={() => setEnderecoAberto(true)} className="text-sm text-[var(--texto-suave)] underline underline-offset-2 hover:text-white">
          Pôr endereço (entrega ou cadastro)
        </button>
      )}
    </div>
  );
}
