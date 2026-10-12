"use client";

// O estado do caixa no navegador: a fita (itens), o cliente, os pagamentos.
// Fica guardado no navegador do balcão: se a página recarregar no meio da
// venda, a fita volta como estava.

import { useEffect, useReducer } from "react";
import { centavos, precoNaTabela, tabelaPelosPagamentos } from "@/lib/pdv/calculos";
import { CLIENTE_VAZIO, type ClienteDaVenda, type Desconto, type Pagamento, type ProdutoDoPdv, type Tabela } from "@/lib/pdv/tipos";

export interface ItemNoTicket {
  produtoId: string;
  nome: string;
  foto: string | null;
  quantidade: number;
  precoVista: number;
  precoCartao: number | null;
  valor: number;
  /** O vendedor mudou o preço à mão: trocar de tabela não mexe mais nele. */
  editado: boolean;
}

export interface EstadoDoCaixa {
  itens: ItemNoTicket[];
  tabela: Tabela;
  desconto: Desconto | null;
  cliente: ClienteDaVenda;
  pagamentos: Pagamento[];
  pedirNota: boolean;
  observacao: string;
  ultimo: string | null;
}

export const CAIXA_VAZIO: EstadoDoCaixa = {
  itens: [],
  tabela: "vista",
  desconto: null,
  cliente: { ...CLIENTE_VAZIO },
  pagamentos: [],
  pedirNota: false,
  observacao: "",
  ultimo: null,
};

export type Acao =
  | { tipo: "adicionar"; produto: ProdutoDoPdv }
  | { tipo: "avulso"; nome: string; valor: number }
  | { tipo: "quantidade"; id: string; quantidade: number }
  | { tipo: "valor"; id: string; valor: number }
  | { tipo: "remover"; id: string }
  | { tipo: "tabela"; tabela: Tabela }
  | { tipo: "desconto"; desconto: Desconto | null }
  | { tipo: "cliente"; cliente: Partial<ClienteDaVenda> }
  | { tipo: "pagamentos"; pagamentos: Pagamento[] }
  | { tipo: "nota"; pedir: boolean }
  | { tipo: "observacao"; texto: string }
  | { tipo: "restaurar"; estado: EstadoDoCaixa }
  | { tipo: "limpar" };

function reprecificar(itens: ItemNoTicket[], tabela: Tabela): ItemNoTicket[] {
  return itens.map((i) => (i.editado ? i : { ...i, valor: precoNaTabela(i, tabela) }));
}

export function caixa(estado: EstadoDoCaixa, a: Acao): EstadoDoCaixa {
  switch (a.tipo) {
    case "adicionar": {
      const p = a.produto;
      const ja = estado.itens.find((i) => i.produtoId === p.id);
      if (ja) {
        return {
          ...estado,
          ultimo: p.id,
          itens: estado.itens.map((i) => (i.produtoId === p.id ? { ...i, quantidade: i.quantidade + 1 } : i)),
        };
      }
      const item: ItemNoTicket = {
        produtoId: p.id,
        nome: p.nome,
        foto: p.foto,
        quantidade: 1,
        precoVista: p.precoVista,
        precoCartao: p.precoCartao,
        valor: precoNaTabela(p, estado.tabela),
        editado: false,
      };
      return { ...estado, ultimo: p.id, itens: [...estado.itens, item] };
    }
    case "avulso": {
      const id = `avulso-${Date.now().toString(36)}`;
      const valor = centavos(a.valor);
      return {
        ...estado,
        ultimo: id,
        itens: [...estado.itens, { produtoId: id, nome: a.nome, foto: null, quantidade: 1, precoVista: valor, precoCartao: null, valor, editado: true }],
      };
    }
    case "quantidade":
      return {
        ...estado,
        itens: estado.itens.map((i) => (i.produtoId === a.id ? { ...i, quantidade: Math.max(1, Math.min(999, Math.trunc(a.quantidade) || 1)) } : i)),
      };
    case "valor":
      return { ...estado, itens: estado.itens.map((i) => (i.produtoId === a.id ? { ...i, valor: centavos(Math.max(0, a.valor)), editado: true } : i)) };
    case "remover":
      return { ...estado, itens: estado.itens.filter((i) => i.produtoId !== a.id) };
    case "tabela":
      return { ...estado, tabela: a.tabela, itens: reprecificar(estado.itens, a.tabela) };
    case "desconto":
      return { ...estado, desconto: a.desconto };
    case "cliente":
      return { ...estado, cliente: { ...estado.cliente, ...a.cliente } };
    case "pagamentos": {
      // Crédito no meio puxa a tabela do cartão; saiu o crédito, volta à vista.
      const tabela = tabelaPelosPagamentos(a.pagamentos);
      return tabela === estado.tabela
        ? { ...estado, pagamentos: a.pagamentos }
        : { ...estado, pagamentos: a.pagamentos, tabela, itens: reprecificar(estado.itens, tabela) };
    }
    case "nota":
      return { ...estado, pedirNota: a.pedir };
    case "observacao":
      return { ...estado, observacao: a.texto.slice(0, 500) };
    case "restaurar":
      return { ...CAIXA_VAZIO, ...a.estado, cliente: { ...CLIENTE_VAZIO, ...a.estado.cliente }, ultimo: null };
    case "limpar":
      return { ...CAIXA_VAZIO, cliente: { ...CLIENTE_VAZIO } };
  }
}

const GUARDADO = "pdv-balao-fita";

export function useCaixa() {
  const [estado, despachar] = useReducer(caixa, CAIXA_VAZIO);

  useEffect(() => {
    try {
      const t = localStorage.getItem(GUARDADO);
      if (t) despachar({ tipo: "restaurar", estado: JSON.parse(t) as EstadoDoCaixa });
    } catch {
      /* navegador sem armazenamento: a fita só não volta depois de recarregar */
    }
  }, []);

  useEffect(() => {
    try {
      if (estado.itens.length) localStorage.setItem(GUARDADO, JSON.stringify(estado));
      else localStorage.removeItem(GUARDADO);
    } catch {
      /* idem */
    }
  }, [estado]);

  return [estado, despachar] as const;
}

export function lerLocal<T>(chave: string, padrao: T): T {
  try {
    const t = localStorage.getItem(chave);
    return t ? (JSON.parse(t) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function gravarLocal(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento */
  }
}
