// Testes do vigia de recebimento.
//
// A regra de ouro desta bancada: o teste que importa é o do apagão REAL —
// 29/09/2026 18:08 até 01/10/2026 07:28, com a loja "conectada" o tempo todo.
// Se o vigia não acusar esse, ele não serve para nada. E o teste que impede o
// vigia de virar um despertador é o inverso: madrugada e domingo têm de passar
// em silêncio.

import { criarVigia, avaliar, fatiaDoRelogio } from "./vigia.js";

let passou = 0;
let falhou = 0;
function confere(nome, condicao, extra = "") {
  if (condicao) {
    passou++;
    console.log(`  ok   ${nome}`);
  } else {
    falhou++;
    console.log(`  FALHA ${nome} ${extra}`);
  }
}

// Ritmo típico da loja, aprendido do próprio histórico:
// seg-sex 8h-18h cheio, sábado 8h-13h, domingo e madrugada zerados.
const base = {};
for (let dow = 0; dow <= 6; dow++) {
  for (let hora = 0; hora <= 23; hora++) {
    let normal = 0;
    if (dow >= 1 && dow <= 5 && hora >= 8 && hora <= 18) normal = hora === 12 ? 6 : 14;
    else if (dow === 6 && hora >= 8 && hora <= 13) normal = 9;
    else if (dow >= 1 && dow <= 5 && (hora === 7 || hora === 19)) normal = 3;
    base[`${dow}:${hora}`] = normal;
  }
}

const SP = (txt) => new Date(`${txt}-03:00`).getTime();

console.log("\n== 1. O apagão de verdade ==");
{
  const ultimaEntrada = SP("2026-09-29T18:08:00"); // terça, 18:08
  // Quarta de manhã, 9h: a loja está "conectada", mas nada entra há 15 horas.
  const p = avaliar({ agora: SP("2026-09-30T09:00:00"), ultimaEntradaEm: ultimaEntrada, base });
  confere("quarta 9h, 15h sem nada -> surdo", p.estado === "surdo", JSON.stringify(p));

  // Quarta à tarde: no meio do expediente, com 21h de silêncio. Acusa.
  const p2 = avaliar({ agora: SP("2026-09-30T15:00:00"), ultimaEntradaEm: ultimaEntrada, base });
  confere("quarta 15h, 21h sem nada -> surdo", p2.estado === "surdo", JSON.stringify(p2));
  confere("o parecer diz quantos minutos", p2.silencioMin > 1200, String(p2.silencioMin));

  // Quinta 7h28: o alarme já está de pé desde ontem. Às 7h28 a loja ainda não
  // tem movimento, então o parecer SOLTO diria "silêncio esperado" — mas o
  // vigia não pode "desalarmar" só porque virou madrugada. Esta é a diferença
  // entre consultar o parecer e ser o vigia.
  const solto = avaliar({ agora: SP("2026-10-01T07:28:00"), ultimaEntradaEm: ultimaEntrada, base });
  confere("parecer solto as 7h28: hora parada", solto.estado === "ok", JSON.stringify(solto));
}

console.log("\n== 2. Silêncio que NÃO é notícia ==");
{
  const p = avaliar({ agora: SP("2026-09-30T04:00:00"), ultimaEntradaEm: SP("2026-09-29T22:00:00"), base });
  confere("madrugada de quarta nao alarma", p.estado === "ok", JSON.stringify(p));

  const p2 = avaliar({ agora: SP("2026-10-04T11:00:00"), ultimaEntradaEm: SP("2026-10-03T12:30:00"), base });
  confere("domingo de manha nao alarma", p2.estado === "ok", JSON.stringify(p2));

  const p3 = avaliar({ agora: SP("2026-09-30T21:00:00"), ultimaEntradaEm: SP("2026-09-30T18:40:00"), base });
  confere("loja fechada (21h) nao alarma", p3.estado === "ok", JSON.stringify(p3));

  const p4 = avaliar({ agora: SP("2026-10-03T16:00:00"), ultimaEntradaEm: SP("2026-10-03T12:50:00"), base });
  confere("sabado a tarde (fechado) nao alarma", p4.estado === "ok", JSON.stringify(p4));
}

console.log("\n== 3. A escada: suspeita antes de alarme ==");
{
  const ultima = SP("2026-09-30T14:00:00"); // quarta, hora cheia
  const meia = avaliar({ agora: SP("2026-09-30T14:30:00"), ultimaEntradaEm: ultima, base });
  confere("30 min -> ainda ok", meia.estado === "ok", JSON.stringify(meia));

  const umaHora = avaliar({ agora: SP("2026-09-30T15:00:00"), ultimaEntradaEm: ultima, base });
  confere("60 min -> suspeita", umaHora.estado === "suspeita", JSON.stringify(umaHora));

  const duas = avaliar({ agora: SP("2026-09-30T15:40:00"), ultimaEntradaEm: ultima, base });
  confere("100 min -> surdo", duas.estado === "surdo", JSON.stringify(duas));
}

console.log("\n== 4. Sem base aprendida, cala a boca ==");
{
  const p = avaliar({ agora: SP("2026-09-30T15:00:00"), ultimaEntradaEm: SP("2026-09-28T15:00:00"), base: null });
  confere("sem base -> sem-base, nunca alarme", p.estado === "sem-base", JSON.stringify(p));
}

console.log("\n== 5. Servidor recem-ligado nao inventa apagao ==");
{
  let t = SP("2026-09-30T14:00:00");
  const v = criarVigia({ relogio: () => t, avisar: async () => {}, tentarCurar: async () => {}, registrar: () => {} });
  v.aprender(base);
  t = SP("2026-09-30T14:20:00");
  const p = await v.olhar(0); // nunca entrou nada desde o boot
  confere("20 min de vida, sem mensagem -> ok", p.estado === "ok", JSON.stringify(p));
}

console.log("\n== 6. O vigia age: cura calada, depois grita ==");
{
  let t = SP("2026-09-30T13:00:00");
  const curas = [];
  const avisos = [];
  const v = criarVigia({
    relogio: () => t,
    tentarCurar: async (p) => curas.push(p.estado),
    avisar: async (a) => avisos.push(a.tipo),
    registrar: () => {},
  });
  v.aprender(base);
  const ultima = SP("2026-09-30T13:00:00");

  t = SP("2026-09-30T13:30:00");
  await v.olhar(ultima);
  confere("meia hora: nao curou nem avisou", curas.length === 0 && avisos.length === 0);

  t = SP("2026-09-30T14:00:00");
  await v.olhar(ultima);
  confere("1h: tentou curar, ninguem foi acordado", curas.length === 1 && avisos.length === 0, JSON.stringify({ curas, avisos }));

  t = SP("2026-09-30T14:40:00");
  await v.olhar(ultima);
  confere("1h40: gritou uma vez", avisos.filter((a) => a === "surdo").length === 1, JSON.stringify(avisos));

  t = SP("2026-09-30T14:50:00");
  await v.olhar(ultima);
  t = SP("2026-09-30T15:10:00");
  await v.olhar(ultima);
  confere("nao repete o grito a cada ciclo", avisos.filter((a) => a === "surdo").length === 1, JSON.stringify(avisos));

  t = SP("2026-09-30T16:00:00");
  await v.olhar(ultima); // ainda surdo, mas ja passou 1h do ultimo grito
  confere("repete depois de 1h", avisos.filter((a) => a === "surdo").length === 2, JSON.stringify(avisos));

  // Entrou mensagem: tem de avisar que voltou.
  t = SP("2026-09-30T16:05:00");
  await v.olhar(SP("2026-09-30T16:04:00"));
  confere("avisa quando volta", avisos.includes("voltou"), JSON.stringify(avisos));
  confere("volta para ok", v.estado.estado === "ok", JSON.stringify(v.estado));
}

console.log("\n== 6b. Alarme nao se desarma sozinho quando a loja fecha ==");
{
  let t = SP("2026-09-30T14:00:00");
  const avisos = [];
  const v = criarVigia({ relogio: () => t, avisar: async (a) => avisos.push(a.tipo), tentarCurar: async () => {}, registrar: () => {} });
  v.aprender(base);
  const ultima = SP("2026-09-30T13:50:00");

  t = SP("2026-09-30T15:40:00");
  await v.olhar(ultima);
  confere("acusou surdez as 15h40", v.estado.estado === "surdo", JSON.stringify(v.estado));

  // Chega a noite. A fatia fica parada. Se o vigia confiasse so no parecer,
  // mandaria um "voltou a funcionar" com o sistema ainda surdo.
  t = SP("2026-09-30T21:00:00");
  await v.olhar(ultima);
  confere("21h, loja fechada: CONTINUA surdo", v.estado.estado === "surdo", JSON.stringify(v.estado));
  confere("e nao mandou 'voltou' mentiroso", !avisos.includes("voltou"), JSON.stringify(avisos));

  // Madrugada, idem.
  t = SP("2026-10-01T03:00:00");
  await v.olhar(ultima);
  confere("3h da manha: continua surdo", v.estado.estado === "surdo", JSON.stringify(v.estado));

  // Chegou mensagem de verdade. AGORA sim.
  t = SP("2026-10-01T07:28:00");
  await v.olhar(SP("2026-10-01T07:28:00"));
  confere("entrou mensagem -> ok", v.estado.estado === "ok", JSON.stringify(v.estado));
  confere("e so agora mandou 'voltou'", avisos.filter((a) => a === "voltou").length === 1, JSON.stringify(avisos));
}

console.log("\n== 7. Fuso de Sao Paulo, nao UTC ==");
{
  // 2026-09-30T23:30-03:00 e 02:30 UTC do dia seguinte. Se o vigia usasse UTC,
  // acharia que e quinta de madrugada em vez de quarta a noite.
  const f = fatiaDoRelogio(SP("2026-09-30T23:30:00"));
  confere("23h30 de quarta continua quarta", f.dow === 3 && f.hora === 23, JSON.stringify(f));
}

console.log(`\n${passou} passaram, ${falhou} falharam\n`);
process.exit(falhou ? 1 : 0);
