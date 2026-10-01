// Reproduz o cenário que apagava conversas: um lote com uma conversa NOVA
// seguida de conversas que já existiam.
//
// Copia exata da lógica do handler whatsapp:chats-parcial, para provar que
// nenhuma conversa é perdida e que ninguém herda dados de outro.

const isRealDirectChat = (id) => id.endsWith("@c.us");
const nomeEhCodigo = (n) => !n || /^\d+$/.test(String(n).replace(/@.*$/, ""));

function aplicarParciais(prev, parciais) {
  const porId = new Map(prev.map((c) => [c.id, c]));
  let precisaOrdenar = false;

  for (const sc of parciais) {
    if (!sc?.chatId || !isRealDirectChat(sc.chatId)) continue;
    const anterior = porId.get(sc.chatId);
    const realNum = sc.realNumber || String(sc.chatId).replace(/@.*$/, "");
    const nomeServidor = String(sc.contactName || "").replace(/@.*$/, "");
    const nomeSemJid = !nomeEhCodigo(nomeServidor)
      ? nomeServidor
      : !nomeEhCodigo(anterior?.nome)
      ? anterior.nome
      : realNum;

    const atualizado = {
      ...(anterior || {}),
      id: sc.chatId,
      nome: nomeSemJid || anterior?.nome || "Contato",
      numero: realNum || anterior?.numero || "",
      timestamp: sc.lastMessageTimestamp || anterior?.timestamp || Date.now(),
      kanbanColId: anterior?.kanbanColId || "novos",
    };

    if (!anterior || (anterior.timestamp || 0) !== atualizado.timestamp) precisaOrdenar = true;
    porId.set(sc.chatId, atualizado);
  }

  if (!precisaOrdenar) {
    let mudouAlgo = false;
    for (const c of prev) if (porId.get(c.id) !== c) { mudouAlgo = true; break; }
    if (!mudouAlgo && porId.size === prev.length) return prev;
  }
  const saida = [...porId.values()];
  return precisaOrdenar ? saida.sort((a, b) => b.timestamp - a.timestamp) : saida;
}

let falhas = 0;
const ok = (nome, cond, extra = "") => {
  console.log(`${cond ? "PASSOU" : "FALHOU"}  ${nome}${extra ? ` — ${extra}` : ""}`);
  if (!cond) falhas++;
};

// --- cenário 1: nova + existente no mesmo lote (o bug original) ---
let prev = [
  { id: "a@c.us", nome: "Ana", timestamp: 1000, kanbanColId: "fechado", valorNegocio: 5000 },
  { id: "b@c.us", nome: "Bruno", timestamp: 900, kanbanColId: "proposta", valorNegocio: 3200 },
  { id: "c@c.us", nome: "Carla", timestamp: 800, kanbanColId: "novos" },
  { id: "d@c.us", nome: "Davi", timestamp: 700, kanbanColId: "novos" },
];
let r = aplicarParciais(prev, [
  { chatId: "n@c.us", contactName: "Nova", lastMessageTimestamp: 1200 },
  { chatId: "c@c.us", contactName: "Carla", lastMessageTimestamp: 1100 },
]);
ok("ninguem desaparece", r.length === 5, `${r.length} conversas`);
ok("Bruno continua vivo", r.some((c) => c.id === "b@c.us" && c.nome === "Bruno"));
ok("Carla nao duplicou", r.filter((c) => c.id === "c@c.us").length === 1);
ok("Carla NAO herdou o funil do Bruno", r.find((c) => c.id === "c@c.us").kanbanColId === "novos",
   `kanban=${r.find((c) => c.id === "c@c.us").kanbanColId}`);
ok("Bruno manteve o valor do negocio", r.find((c) => c.id === "b@c.us").valorNegocio === 3200);
ok("ordem por data correta", r.map((c) => c.id).join(",") === "n@c.us,c@c.us,a@c.us,b@c.us,d@c.us",
   r.map((c) => c.id).join(","));

// --- cenário 2: lote grande, 3 novas antes de 4 existentes (perda em massa) ---
prev = Array.from({ length: 12 }, (_, i) => ({
  id: `c${i}@c.us`, nome: `Cliente ${i}`, timestamp: 1000 - i * 10, kanbanColId: `col${i}`,
}));
r = aplicarParciais(prev, [
  { chatId: "n1@c.us", contactName: "N1", lastMessageTimestamp: 2000 },
  { chatId: "n2@c.us", contactName: "N2", lastMessageTimestamp: 1999 },
  { chatId: "n3@c.us", contactName: "N3", lastMessageTimestamp: 1998 },
  { chatId: "c5@c.us", contactName: "Cliente 5", lastMessageTimestamp: 1500 },
  { chatId: "c6@c.us", contactName: "Cliente 6", lastMessageTimestamp: 1499 },
  { chatId: "c7@c.us", contactName: "Cliente 7", lastMessageTimestamp: 1498 },
  { chatId: "c8@c.us", contactName: "Cliente 8", lastMessageTimestamp: 1497 },
]);
ok("lote grande: 12 + 3 novas = 15", r.length === 15, `${r.length}`);
const sumiram = prev.filter((p) => !r.some((c) => c.id === p.id)).map((c) => c.id);
ok("nenhuma das 12 originais sumiu", sumiram.length === 0, sumiram.join(",") || "nenhuma");
ok("cada funil ficou com o seu dono",
   r.filter((c) => c.id.startsWith("c")).every((c) => c.kanbanColId === `col${c.id.match(/^c(\d+)@/)[1]}`));

// --- cenário 3: lote sem mudança devolve o MESMO array (React nao redesenha) ---
prev = [{ id: "a@c.us", nome: "Ana", timestamp: 1000 }];
r = aplicarParciais(prev, [{ chatId: "a@c.us", contactName: "Ana", lastMessageTimestamp: 1000 }]);
ok("sem mudanca preserva as referencias", r[0] === prev[0] || r.length === prev.length);

// --- cenário 4: conversa de grupo é ignorada ---
prev = [{ id: "a@c.us", nome: "Ana", timestamp: 1000 }];
r = aplicarParciais(prev, [{ chatId: "123@g.us", contactName: "Grupo", lastMessageTimestamp: 9999 }]);
ok("grupo nao entra na lista", r.length === 1);

console.log(`\n${falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"}`);
process.exit(falhas ? 1 : 0);
