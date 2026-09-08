// Garante que o texto da oferta é o MESMO no servidor e no painel.
//
// Eles já saíram de sincronia uma vez: o painel dizia "Oferta Balão da
// Informática:" e "Para garantir a reserva", o servidor dizia "Oferta Balão da
// Informática" e "Para reservar". Como o painel mostrava o próprio texto e o
// cliente recebia o do servidor, a mesma oferta virava duas mensagens na tela
// do vendedor. Este teste é o que impede isso de voltar.
//
//   node template-produto.test.js
//
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const servidor = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");
const painelPath = path.join(
  __dirname,
  "..",
  "components",
  "crm",
  "CrmWhatsAppClient.tsx"
);
const painel = fs.readFileSync(painelPath, "utf8");

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

// As frases que compõem a mensagem. Se mudarem em um lado e não no outro, a
// oferta volta a aparecer duplicada.
const PEDACOS = [
  "⚡ *Oferta Balão da Informática*",
  "💵 *Preço Especial:* *R$ ",
  "📍 Pronta entrega na loja do Castelo Campinas!",
  "Para reservar ou tirar dúvidas, é só responder aqui! 🎈",
];

console.log("\ntexto da oferta (servidor x painel)");

for (const pedaco of PEDACOS) {
  teste(`ambos usam: ${pedaco.slice(0, 42)}…`, () => {
    assert.ok(servidor.includes(pedaco), "faltou no whatsapp-server/server.js");
    assert.ok(painel.includes(pedaco), "faltou no painel (CrmWhatsAppClient.tsx)");
  });
}

teste("o texto antigo do painel não voltou", () => {
  // Estas eram as versões divergentes que causaram o problema.
  assert.ok(
    !painel.includes("*Oferta Balão da Informática:*"),
    'o painel voltou a usar "Oferta Balão da Informática:" (com dois-pontos)'
  );
  assert.ok(
    !painel.includes("Para garantir a reserva ou tirar dúvidas"),
    'o painel voltou a usar "Para garantir a reserva"'
  );
});

teste("o servidor monta o texto num lugar só", () => {
  const ocorrencias = servidor.split("⚡ *Oferta Balão da Informática*").length - 1;
  assert.strictEqual(
    ocorrencias,
    1,
    `o texto aparece ${ocorrencias}x no servidor — deve estar só dentro de montarTextoDoProduto`
  );
});

console.log(
  falhas === 0 ? "\nTODOS OS TESTES PASSARAM\n" : `\n${falhas} FALHA(S)\n`
);
process.exit(falhas === 0 ? 0 : 1);
