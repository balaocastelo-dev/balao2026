// node --test transcricao.test.js
const test = require("node:test");
const assert = require("node:assert");
const { criarTranscricao, urlDoEndpoint } = require("./transcricao");

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const AUDIO = Buffer.from("OggS-de-mentira");

/** fetch falso: anota cada chamada e responde conforme `respostas[host]`. */
function fetchFalso(respostas) {
  const chamadas = [];
  let simultaneas = 0;
  let maxSimultaneas = 0;
  const buscar = async (url, init) => {
    simultaneas++;
    maxSimultaneas = Math.max(maxSimultaneas, simultaneas);
    const campos = {};
    for (const [k, v] of init.body.entries()) campos[k] = typeof v === "string" ? v : `<arquivo ${v.type} ${v.size}>`;
    chamadas.push({ url, auth: init.headers.authorization || null, campos });
    await esperar(15);
    simultaneas--;
    const host = new URL(url).host;
    const r = respostas[host] || { status: 500, json: { error: { message: "fora" } } };
    return { ok: r.status < 400, status: r.status, json: async () => r.json };
  };
  return { buscar, chamadas, max: () => maxSimultaneas };
}

function montar(opcoes, respostas) {
  const f = fetchFalso(respostas);
  const textos = [];
  const t = criarTranscricao({
    obterAudio: async () => ({ buffer: AUDIO, mimetype: "audio/ogg; codecs=opus" }),
    aoTranscrever: async (id, texto, { provedor }) => textos.push({ id, texto, provedor }),
    buscar: f.buscar,
    registrar: () => {},
    ...opcoes,
  });
  return { t, f, textos };
}

test("endpoint no formato da OpenAI", () => {
  assert.strictEqual(urlDoEndpoint("http://pc:8000"), "http://pc:8000/v1/audio/transcriptions");
  assert.strictEqual(urlDoEndpoint("http://pc:8000/v1/audio/transcriptions/"), "http://pc:8000/v1/audio/transcriptions");
  assert.strictEqual(urlDoEndpoint(""), "");
});

test("sem provedor nenhum: desligado, nada entra na fila", () => {
  const { t } = montar({}, {});
  assert.strictEqual(t.ativo, false);
  assert.strictEqual(t.enfileirar({ id: "A" }), false);
  assert.strictEqual(t.estado().enfileirados, 0);
});

test("servidor local primeiro, em português, um por vez", async () => {
  const { t, f, textos } = montar(
    { url: "http://pc:8000", chaveGroq: "gsk_teste" },
    { "pc:8000": { status: 200, json: { text: " quanto custa a fonte? " } } }
  );
  assert.strictEqual(t.ativo, true);
  t.enfileirar({ id: "A1", chatId: "1@c.us" });
  t.enfileirar({ id: "A2", chatId: "1@c.us" });
  t.enfileirar({ id: "A1", chatId: "1@c.us" }); // repetido: ignora
  await esperar(120);
  assert.deepStrictEqual(textos.map((x) => [x.id, x.texto, x.provedor]), [
    ["A1", "quanto custa a fonte?", "local"],
    ["A2", "quanto custa a fonte?", "local"],
  ]);
  assert.strictEqual(f.max(), 1, "um por vez");
  assert.strictEqual(f.chamadas[0].url, "http://pc:8000/v1/audio/transcriptions");
  assert.strictEqual(f.chamadas[0].campos.language, "pt");
  assert.match(f.chamadas[0].campos.file, /^<arquivo audio\/ogg \d+>$/);
  assert.strictEqual(t.enfileirar({ id: "A1" }), false, "já transcrito não volta para a fila");
});

test("local fora do ar -> Groq (whisper-large-v3-turbo)", async () => {
  const { t, f, textos } = montar(
    { url: "http://pc:8000", chaveGroq: "gsk_teste" },
    { "api.groq.com": { status: 200, json: { text: "oi" } } }
  );
  t.enfileirar({ id: "B1" });
  await esperar(80);
  assert.deepStrictEqual(textos.map((x) => x.provedor), ["groq"]);
  const groq = f.chamadas.find((c) => c.url.includes("groq"));
  assert.strictEqual(groq.auth, "Bearer gsk_teste");
  assert.strictEqual(groq.campos.model, "whisper-large-v3-turbo");
  assert.match(t.estado().ultimoErro, /^local:/);
});

test("modo puxado: o trabalhador pega o áudio e devolve o texto", async () => {
  let relogio = 1_000_000;
  const { t, textos } = montar({ puxada: true, agora: () => relogio, reofertaMs: 60_000 }, {});
  assert.strictEqual(t.ativo, true);
  t.enfileirar({ id: "C1", chatId: "2@c.us" });
  await esperar(10);
  const p = await t.pendentes();
  assert.strictEqual(p.length, 1);
  assert.strictEqual(p[0].id, "C1");
  assert.strictEqual(Buffer.from(p[0].audioBase64, "base64").toString(), AUDIO.toString());
  // Entregue e não devolvido: não é oferecido de novo antes do prazo...
  assert.strictEqual((await t.pendentes()).length, 0);
  relogio += 61_000;
  // ...e é oferecido de novo depois (o trabalhador pode ter caído).
  assert.strictEqual((await t.pendentes()).length, 1);
  assert.strictEqual(await t.resultado({ id: "C1", texto: "pode separar pra mim" }), true);
  assert.deepStrictEqual(textos, [{ id: "C1", texto: "pode separar pra mim", provedor: "trabalhador" }]);
  assert.strictEqual(await t.resultado({ id: "C1", texto: "de novo" }), false, "resultado repetido é ignorado");
});

test("todos os provedores falham: com modo puxado, vai para o trabalhador", async () => {
  const { t, textos } = montar({ url: "http://pc:8000", puxada: true }, {});
  t.enfileirar({ id: "D1" });
  await esperar(60);
  assert.strictEqual(textos.length, 0);
  assert.strictEqual(t.estado().esperandoTrabalhador, 1);
});
