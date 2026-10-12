// ============================================================
// Entregas por motoboy — a conversa com a 99.
//
// Dois modos, escolhidos pela variável ENTREGA99_TOKEN na Vercel:
//
//  - sem token → "simulado": a cotação sai da tabela de lib/entregas/regras.ts
//    e a corrida é de mentira (id "sim_…"). Nada é enviado para a 99.
//  - com token → "real": fala com a API da 99 Empresas.
//
// O modo real ainda NÃO está escrito: a 99 só manda a documentação (endereços,
// formato dos campos, webhooks) junto com o token. Quando ela chegar, preencha
// as três funções de `provedorReal` e o tradutor do webhook
// (situacaoDaParceira, em regras.ts). Até lá, ter o token sem o código dá erro
// claro em vez de cobrar corrida errada.
// ============================================================

import { randomBytes } from "crypto";
import { cotacaoSimulada, distanciaKm, ORIGEM, somenteDigitos } from "./regras";
import type { Cotacao, Endereco, ModoDaEntrega, PedidoDeCotacao, ProvedorDeEntrega } from "./tipos";

export function modoAtual(): ModoDaEntrega {
  return process.env.ENTREGA99_TOKEN ? "real" : "simulado";
}

// ---------------------------------------------------------------- coordenadas do CEP

const cacheDeCoordenadas = new Map<string, { lat: number; lng: number } | null>();

/**
 * Coordenada aproximada do CEP pela BrasilAPI (v2). Muitos CEPs vêm sem
 * coordenada; aí devolve null e a cotação simulada usa a distância padrão.
 */
export async function coordenadasDoCep(cep: string): Promise<{ lat: number; lng: number } | null> {
  const d = somenteDigitos(cep);
  if (d.length !== 8) return null;
  if (cacheDeCoordenadas.has(d)) return cacheDeCoordenadas.get(d)!;
  let achada: { lat: number; lng: number } | null = null;
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cep/v2/${d}`, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 60 * 60 * 24 * 30 },
    } as RequestInit);
    if (r.ok) {
      const j = (await r.json()) as { location?: { coordinates?: { latitude?: string; longitude?: string } } };
      const lat = Number(j.location?.coordinates?.latitude);
      const lng = Number(j.location?.coordinates?.longitude);
      // Coordenada fora do Brasil ou zerada é lixo comum nessa base.
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat < 6 && lat > -34 && lng < -34 && lng > -74 && lat !== 0) {
        achada = { lat, lng };
      }
    }
  } catch {
    // Sem rede ou BrasilAPI fora: segue sem coordenada.
  }
  cacheDeCoordenadas.set(d, achada);
  return achada;
}

export async function distanciaAteACasa(destino: Endereco): Promise<number | null> {
  const c = await coordenadasDoCep(destino.cep);
  return c ? distanciaKm(ORIGEM, c) : null;
}

// ---------------------------------------------------------------- simulado

const provedorSimulado: ProvedorDeEntrega = {
  modo: "simulado",
  async cotar(pedido: PedidoDeCotacao): Promise<Cotacao> {
    return cotacaoSimulada(pedido.veiculo ?? "moto", await distanciaAteACasa(pedido.destino));
  },
  async criar(dados) {
    const cot = cotacaoSimulada(dados.veiculo, await distanciaAteACasa(dados.destino));
    return {
      idNaParceira: `sim_${randomBytes(6).toString("hex")}`,
      preco: cot.preco,
      codigoDeVerificacao: String(1000 + Math.floor(Math.random() * 9000)),
    };
  },
  async cancelar() {
    // Corrida de mentira: nada para cancelar na 99.
  },
};

// ---------------------------------------------------------------- real (a escrever)

const FALTA_DOCUMENTACAO =
  "A integração real com a 99 ainda não foi escrita: falta a documentação da API, que a 99 envia junto com o token. " +
  "Tire a variável ENTREGA99_TOKEN da Vercel para voltar ao modo simulado.";

const provedorReal: ProvedorDeEntrega = {
  modo: "real",
  async cotar() {
    // TODO(99): POST de cotação com origem = ORIGEM e destino, veículo moto.
    throw new Error(FALTA_DOCUMENTACAO);
  },
  async criar() {
    // TODO(99): criar a corrida; guardar id, código de verificação e link.
    throw new Error(FALTA_DOCUMENTACAO);
  },
  async cancelar() {
    // TODO(99): cancelar pelo id da corrida.
    throw new Error(FALTA_DOCUMENTACAO);
  },
};

export function provedor(): ProvedorDeEntrega {
  return modoAtual() === "real" ? provedorReal : provedorSimulado;
}
