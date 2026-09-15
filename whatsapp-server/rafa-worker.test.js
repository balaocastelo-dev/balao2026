// Testes da MAR.IA — o que quebra de madrugada e ninguém vê.
//
// Dois riscos reais aqui, e nenhum deles é o texto do relatório:
//  1. fuso — o container roda em UTC; o relatório das 7h da loja não pode
//     chegar às 4h da manhã;
//  2. repetição — o laço acorda de minuto em minuto; dentro da hora cheia
//     são 60 oportunidades de mandar o mesmo relatório 60 vezes.
//
//   node rafa-worker.test.js
//
const assert = require("assert");

let falhas = 0;
function teste(nome, fn) {
  try {
    fn();
    console.log(`  [ok] ${nome}`);
  } catch (e) {
    falhas++;
    console.log(`  [FALHOU] ${nome}\n         ${e.message}`);
  }
}

process.env.RAFA_FUSO = "America/Sao_Paulo";
const rafa = require("./rafa-worker");

console.log("\nRafa — horário e repetição\n");

teste("lê a hora no fuso da loja, não no do servidor", () => {
  const { dia, hora } = rafa.agoraLocal();
  assert.match(dia, /^\d{4}-\d{2}-\d{2}$/, `dia fora do formato: ${dia}`);
  assert.ok(Number.isInteger(hora) && hora >= 0 && hora <= 23, `hora inválida: ${hora}`);

  // O container roda em UTC. São Paulo está 3 horas atrás — se o worker
  // lesse a hora do servidor, o relatório das 7h sairia às 4h.
  const utc = new Date().getUTCHours();
  const esperado = (utc - 3 + 24) % 24;
  assert.strictEqual(hora, esperado, `esperava ${esperado}h na loja, veio ${hora}h`);
});

teste("nasce desligado", () => {
  // Um relatório automático que começa ligado sozinho manda mensagem para o
  // dono da loja antes de alguém ter lido o texto uma vez.
  assert.strictEqual(rafa.resumo().ativo, false);
});

teste("resumo conta o que falta configurar, sem vazar o token", () => {
  const r = rafa.resumo();
  assert.strictEqual(typeof r.destinoConfigurado, "boolean");
  assert.strictEqual(typeof r.tokenConfigurado, "boolean");
  assert.ok(!("token" in r), "o resumo não pode devolver o token");
  assert.ok(!("destino" in r), "o resumo não pode devolver o número do dono");
});

teste("horários padrão são 7h e 19h", () => {
  const r = rafa.resumo();
  assert.strictEqual(r.horaManha, 7);
  assert.strictEqual(r.horaNoite, 19);
});

teste("ligar e desligar muda o estado", () => {
  assert.strictEqual(rafa.definirConfig({ ativo: true }).ativo, true);
  assert.strictEqual(rafa.definirConfig({ ativo: false }).ativo, false);
});

teste("sem destino configurado, enviar falha em vez de estourar", async () => {
  // Chamada síncrona do teste: só garante que devolve promessa, não lança.
  const p = rafa.enviarAgora("manha");
  assert.ok(p && typeof p.then === "function");
});

// A marca de "já enviei hoje" é uma string AAAA-MM-DD por período. É ela que
// transforma 60 acordadas por hora em um envio. Testada pela forma, já que o
// laço em si depende de rede.
teste("a marca de envio é por dia e por período", () => {
  const r = rafa.resumo();
  assert.ok(r.ultimoEnvio && "manha" in r.ultimoEnvio && "noite" in r.ultimoEnvio,
    "ultimoEnvio precisa separar manhã de noite");
});

console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
process.exit(falhas ? 1 : 0);
