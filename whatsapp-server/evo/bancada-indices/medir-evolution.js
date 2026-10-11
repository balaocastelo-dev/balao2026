// Mede as chamadas quentes que o servidor da loja faz à Evolution, pela API
// de verdade (que gera o SQL de verdade, pelo Prisma 6.19.0 dela).
//
// Roda DENTRO do container da Evolution de uma bancada local com carga falsa
// (carga-falsa.sql). Nunca na loja: aqui só existem números inventados.
//
//   docker cp medir-evolution.js <container>:/tmp/ && docker exec <container> node /tmp/medir-evolution.js
//
// Imprime só tempos (ms) e contagens.

const CHAVE = process.env.AUTHENTICATION_API_KEY;
const INSTANCIA = process.env.INSTANCIA || "loja";
const MOVIMENTADA = process.env.CONVERSA_MOVIMENTADA || "5500000000001@s.whatsapp.net";
const COMUM = process.env.CONVERSA_COMUM || "5500000006000@s.whatsapp.net";
const REPETIR = Number(process.env.REPETIR || 7);

async function chamar(rota, corpo) {
  const inicio = performance.now();
  const r = await fetch(`http://localhost:8080${rota}/${INSTANCIA}`, {
    method: "POST",
    headers: { apikey: CHAVE, "content-type": "application/json" },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(300_000),
  });
  const json = await r.json();
  return { ms: performance.now() - inicio, json, status: r.status };
}

const mediana = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

async function medir(nome, rota, corpo, resumir, vezes = REPETIR) {
  const tempos = [];
  let ultimo;
  for (let i = 0; i < vezes; i++) {
    ultimo = await chamar(rota, corpo);
    tempos.push(ultimo.ms);
  }
  console.log(
    `${nome.padEnd(46)} mediana ${mediana(tempos).toFixed(0).padStart(6)} ms  (min ${Math.min(...tempos).toFixed(0)}, máx ${Math.max(
      ...tempos
    ).toFixed(0)})  ${resumir(ultimo)}`
  );
}

(async () => {
  const agora = Date.now();
  const umaHora = { gte: new Date(agora - 3600_000).toISOString(), lte: new Date(agora + 60_000).toISOString() };
  const recs = (r) => r.json?.messages?.records || [];

  await medir("findMessages conversa movimentada (80)", "/chat/findMessages", { where: { key: { remoteJid: MOVIMENTADA } }, offset: 80, page: 1 }, (r) => `${recs(r).length} msgs de ${r.json?.messages?.total}`);
  await medir("findMessages conversa comum (80)", "/chat/findMessages", { where: { key: { remoteJid: COMUM } }, offset: 80, page: 1 }, (r) => `${recs(r).length} msgs de ${r.json?.messages?.total}`);
  await medir("findMessages varredura (40 mais recentes)", "/chat/findMessages", { where: {}, offset: 40, page: 1 }, (r) => `${recs(r).length} msgs`);
  await medir("findChats de uma conversa (remoteJid)", "/chat/findChats", { where: { remoteJid: COMUM } }, (r) => `${(r.json || []).length} conversa(s)`);
  await medir("findChats janela da última hora", "/chat/findChats", { where: { messageTimestamp: umaHora } }, (r) => `${(r.json || []).length} conversa(s)`);
  await medir("findChats lista inteira", "/chat/findChats", {}, (r) => `${(r.json || []).length} conversa(s)`, 3);

  // O filtro "remoteJidAlt" que o servidor antigo usava no histórico: a
  // Evolution 2.3.7 só conhece id/fromMe/remoteJid/participants em `key` e
  // IGNORA o resto — a consulta volta sem filtro nenhum.
  const alt = await chamar("/chat/findMessages", { where: { key: { remoteJidAlt: COMUM } }, offset: 40, page: 1 });
  const conversas = new Set(recs(alt).map((m) => m.key?.remoteJid));
  console.log(
    `findMessages com key.remoteJidAlt (ignorado?)        ${recs(alt).length} msgs de ${conversas.size} conversa(s) diferente(s); total=${alt.json?.messages?.total}`
  );
})();
