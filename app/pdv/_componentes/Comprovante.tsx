"use client";

// O comprovante da venda, nos dois tamanhos que o balcão escolhe ao fechar:
// cupom de 80 mm (impressora térmica) e folha A4. Não é documento fiscal — a
// nota, quando emitida, sai pelo DANFE do /sistema (o QR do cupom abre ele).

import { QRCodeSVG } from "qrcode.react";
import { formatarDocumento, reais } from "@/lib/pdv/calculos";
import { LOJA } from "@/lib/pdv/loja";
import type { DadosDoComprovante } from "@/lib/pdv/vendas";

export type Formato = "80mm" | "a4";

function quando(c: DadosDoComprovante) {
  const d = new Date(c.dataHora);
  const opcoes: Intl.DateTimeFormatOptions = c.soData
    ? { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }
    : { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Intl.DateTimeFormat("pt-BR", opcoes).format(d);
}

function enderecoDoCliente(c: DadosDoComprovante["cliente"]) {
  const rua = [c.endereco, c.numero].filter(Boolean).join(", ");
  return [rua, c.complemento, c.bairro, [c.cidade, c.uf].filter(Boolean).join("/"), c.cep ? `CEP ${c.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}` : ""]
    .filter(Boolean)
    .join(" - ");
}

function identificacao(c: DadosDoComprovante) {
  const numero = c.numeroSistema ? (c.numeroSistema.startsWith("Bling") ? `Pedido ${c.numeroSistema}` : `Venda nº ${c.numeroSistema}`) : null;
  return [numero, c.pdvId].filter(Boolean).join(" / ");
}

export function Cupom80({ c }: { c: DadosDoComprovante }) {
  const nota = c.nota && c.nota.estado === "autorizada" ? c.nota : null;
  return (
    <div className="cupom-80">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{LOJA.nomeFantasia}</div>
        <div>{LOJA.razaoSocial}</div>
        <div>CNPJ {LOJA.cnpj}</div>
        <div>{LOJA.endereco}</div>
        <div>
          Tel {LOJA.telefone} / WhatsApp {LOJA.whatsapp}
        </div>
        <div>{LOJA.site}</div>
      </div>
      <div className="tracejado" />
      <div style={{ textAlign: "center", fontWeight: 700 }}>COMPROVANTE DE VENDA</div>
      <div style={{ textAlign: "center" }}>não é documento fiscal</div>
      <div className="tracejado" />
      <div>{identificacao(c)}</div>
      <div>{quando(c)}</div>
      {c.vendedor && <div>Vendedor: {c.vendedor}</div>}
      <div>Cliente: {c.cliente.nome || "Consumidor final"}</div>
      {c.cliente.documento && <div>CPF/CNPJ: {formatarDocumento(c.cliente.documento)}</div>}
      <div className="tracejado" />
      {c.itens.map((i, n) => (
        <div key={n} style={{ marginBottom: 3 }}>
          <div>{i.nome}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              {i.quantidade} x {reais(i.valor)}
            </span>
            <span>{reais(i.quantidade * i.valor)}</span>
          </div>
        </div>
      ))}
      <div className="tracejado" />
      <Linha a="Subtotal" b={reais(c.subtotal)} />
      {c.desconto > 0 && <Linha a="Desconto" b={`- ${reais(c.desconto)}`} />}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, margin: "3px 0" }}>
        <span>TOTAL</span>
        <span>{reais(c.total)}</span>
      </div>
      {c.pagamentos.map((p, n) => (
        <Linha key={n} a={`${p.nome}${p.detalhe ? ` (${p.detalhe})` : ""}`} b={reais(p.valor)} />
      ))}
      {c.troco > 0 && <Linha a="Troco" b={reais(c.troco)} />}
      {c.observacao && (
        <>
          <div className="tracejado" />
          <div>{c.observacao}</div>
        </>
      )}
      {nota && (
        <>
          <div className="tracejado" />
          <div style={{ textAlign: "center" }}>
            NF-e nº {nota.numero}
            {nota.serie ? ` série ${nota.serie}` : ""} autorizada
          </div>
          {nota.chave && <div style={{ textAlign: "center", wordBreak: "break-all", fontSize: 9 }}>{nota.chave.replace(/(\d{4})/g, "$1 ").trim()}</div>}
          {nota.linkDanfe && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <QRCodeSVG value={nota.linkDanfe} size={110} level="M" />
            </div>
          )}
          <div style={{ textAlign: "center", fontSize: 9 }}>Aponte a câmera para abrir a nota</div>
        </>
      )}
      <div className="tracejado" />
      <div style={{ textAlign: "center" }}>Obrigado pela preferência!</div>
      <div style={{ textAlign: "center" }}>Garantia e suporte na loja do Cambuí</div>
      <div style={{ height: 18 }} />
    </div>
  );
}

function Linha({ a, b }: { a: string; b: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span>{a}</span>
      <span style={{ whiteSpace: "nowrap" }}>{b}</span>
    </div>
  );
}

export function FolhaA4({ c }: { c: DadosDoComprovante }) {
  const nota = c.nota && c.nota.estado === "autorizada" ? c.nota : null;
  const endereco = enderecoDoCliente(c.cliente);
  const celula: React.CSSProperties = { padding: "7px 8px", borderBottom: "1px solid #e5e7eb", verticalAlign: "top" };
  return (
    <div className="folha-a4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #e60012", paddingBottom: 12 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" style={{ height: 52, width: "auto" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{LOJA.nomeFantasia}</div>
            <div>
              {LOJA.razaoSocial} - CNPJ {LOJA.cnpj}
            </div>
            <div>{LOJA.endereco}</div>
            <div>
              Tel {LOJA.telefone} - WhatsApp {LOJA.whatsapp} - {LOJA.site}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Comprovante de venda</div>
          <div>{identificacao(c)}</div>
          <div>{quando(c)}</div>
          {c.vendedor && <div>Vendedor: {c.vendedor}</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Cliente</div>
          <div>{c.cliente.nome || "Consumidor final"}</div>
          {c.cliente.documento && <div>CPF/CNPJ {formatarDocumento(c.cliente.documento)}</div>}
          {c.cliente.telefone && <div>Telefone {c.cliente.telefone}</div>}
          {c.cliente.email && <div>{c.cliente.email}</div>}
          {endereco && <div>{endereco}</div>}
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Pagamento</div>
          {c.pagamentos.map((p, n) => (
            <div key={n}>
              {p.nome}
              {p.detalhe ? ` (${p.detalhe})` : ""}: {reais(p.valor)}
            </div>
          ))}
          {c.troco > 0 && <div>Troco: {reais(c.troco)}</div>}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={celula}>Produto</th>
            <th style={{ ...celula, textAlign: "right", width: 60 }}>Qtd.</th>
            <th style={{ ...celula, textAlign: "right", width: 110 }}>Unitário</th>
            <th style={{ ...celula, textAlign: "right", width: 120 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {c.itens.map((i, n) => (
            <tr key={n}>
              <td style={celula}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {i.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.foto} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
                  )}
                  <span>{i.nome}</span>
                </div>
              </td>
              <td style={{ ...celula, textAlign: "right" }}>{i.quantidade}</td>
              <td style={{ ...celula, textAlign: "right" }}>{reais(i.valor)}</td>
              <td style={{ ...celula, textAlign: "right" }}>{reais(i.valor * i.quantidade)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, gap: 24 }}>
        <div style={{ flex: 1 }}>
          {c.observacao && (
            <>
              <div style={{ fontWeight: 700 }}>Observação</div>
              <div>{c.observacao}</div>
            </>
          )}
          {nota && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
              {nota.linkDanfe && <QRCodeSVG value={nota.linkDanfe} size={92} level="M" />}
              <div>
                <div style={{ fontWeight: 700 }}>
                  NF-e nº {nota.numero}
                  {nota.serie ? ` série ${nota.serie}` : ""} autorizada
                </div>
                {nota.chave && <div style={{ fontSize: 10, wordBreak: "break-all" }}>Chave {nota.chave}</div>}
                <div style={{ fontSize: 10 }}>O QR abre o DANFE da nota.</div>
              </div>
            </div>
          )}
        </div>
        <div style={{ width: 260 }}>
          <Linha a="Subtotal" b={reais(c.subtotal)} />
          {c.desconto > 0 && <Linha a="Desconto" b={`- ${reais(c.desconto)}`} />}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, borderTop: "2px solid #111", marginTop: 6, paddingTop: 6 }}>
            <span>Total</span>
            <span>{reais(c.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div style={{ borderTop: "1px solid #111", paddingTop: 4, textAlign: "center" }}>Assinatura do cliente</div>
        <div style={{ borderTop: "1px solid #111", paddingTop: 4, textAlign: "center" }}>{LOJA.nomeFantasia}</div>
      </div>
      <div style={{ marginTop: 24, fontSize: 10, color: "#555", textAlign: "center" }}>
        Este comprovante não é documento fiscal. Garantia, trocas e suporte na loja: {LOJA.endereco}.
      </div>
    </div>
  );
}

export function Comprovante({ c, formato }: { c: DadosDoComprovante; formato: Formato }) {
  return formato === "80mm" ? <Cupom80 c={c} /> : <FolhaA4 c={c} />;
}
