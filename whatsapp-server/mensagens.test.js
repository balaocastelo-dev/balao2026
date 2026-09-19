// Teste da identidade das mensagens (buildMessageFingerprint + mergeMessages).
//
// O caso real: cada mensagem enviada aparecia TRÊS vezes no painel — uma por
// etapa de entrega (✓, ✓✓, ✓✓) — enquanto no celular havia só uma.
//
//   node mensagens.test.js
//
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const fonte = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");

function extrair(nome) {
  const inicio = fonte.indexOf(`function ${nome}(`);
  assert.ok(inicio >= 0, `função ${nome} não encontrada`);
  let nivel = 0;
  const i = fonte.indexOf("{", inicio);
  for (let j = i; j < fonte.length; j++) {
    if (fonte[j] === "{") nivel++;
    else if (fonte[j] === "}") {
      nivel--;
      if (nivel === 0) return fonte.slice(inicio, j + 1);
    }
  }
  throw new Error(`não consegui delimitar ${nome}`);
}

const { buildMessageFingerprint } = (function () {
  const mod = {};
  // eslint-disable-next-line no-new-func
  new Function(
    `${extrair("buildMessageFingerprint")}; this.buildMessageFingerprint = buildMessageFingerprint;`
  ).call(mod);
  return mod;
})();

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

console.log("\nidentidade da mensagem");

const ID_REAL = "true_5519987510267@c.us_3EB0A1B2C3";

teste("mesma mensagem com timestamp diferente conta como UMA", () => {
  // Foi exatamente isto que duplicava: a mensagem chegava pelo evento de envio
  // e depois pela leitura do histórico, com o horário levemente diferente.
  const doEnvio = {
    id: ID_REAL,
    chatId: "5519991112222@c.us",
    direction: "out",
    timestamp: 1757300000000,
    body: "3950,00 da pra fazer",
  };
  const doHistorico = { ...doEnvio, timestamp: 1757300000999 };

  assert.strictEqual(
    buildMessageFingerprint(doEnvio),
    buildMessageFingerprint(doHistorico),
    "o mesmo id tem que dar a mesma identidade"
  );
});

teste("mudança de status não cria mensagem nova", () => {
  const enviada = {
    id: ID_REAL,
    chatId: "5519991112222@c.us",
    direction: "out",
    timestamp: 1757300000000,
    body: "no momento tenho apenas novo",
    status: "sent",
  };
  const entregue = { ...enviada, status: "delivered" };
  const lida = { ...enviada, status: "read" };

  const ids = new Set([enviada, entregue, lida].map(buildMessageFingerprint));
  assert.strictEqual(ids.size, 1, "✓, ✓✓ e ✓✓ são a MESMA mensagem");
});

teste("mensagens diferentes continuam diferentes", () => {
  const a = { id: `${ID_REAL}_A`, chatId: "5519991112222@c.us", direction: "out", timestamp: 1, body: "oi" };
  const b = { id: `${ID_REAL}_B`, chatId: "5519991112222@c.us", direction: "out", timestamp: 1, body: "oi" };
  assert.notStrictEqual(buildMessageFingerprint(a), buildMessageFingerprint(b));
});

teste("sem id, distingue pelo conteúdo da conversa", () => {
  const base = { chatId: "5519991112222@c.us", direction: "out", timestamp: 1757300000000 };
  const uma = { ...base, body: "Qual valor ?" };
  const outra = { ...base, body: "3999" };

  assert.notStrictEqual(buildMessageFingerprint(uma), buildMessageFingerprint(outra));
  assert.strictEqual(
    buildMessageFingerprint(uma),
    buildMessageFingerprint({ ...uma }),
    "a mesma mensagem sem id tem que casar consigo mesma"
  );
});

teste("entrada e saída com o mesmo texto não se confundem", () => {
  const base = { chatId: "5519991112222@c.us", timestamp: 1757300000000, body: "Boa noite" };
  assert.notStrictEqual(
    buildMessageFingerprint({ ...base, direction: "in" }),
    buildMessageFingerprint({ ...base, direction: "out" })
  );
});

console.log(
  falhas === 0 ? "\nTODOS OS TESTES PASSARAM\n" : `\n${falhas} FALHA(S)\n`
);
process.exit(falhas === 0 ? 0 : 1);
