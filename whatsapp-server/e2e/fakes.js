// Site falso (verifica ingresso) + Evolution falsa (guarda mensagens).
const http = require("http");

const mensagens = []; // registros crus, mais novo primeiro quando ordenado desc

const site = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.url.startsWith("/api/painel/socket-ticket/verificar")) {
      const { ticket } = JSON.parse(body || "{}");
      const exp = Math.floor(Date.now() / 1000) + 3600;
      if (String(ticket || "").startsWith("v1.")) {
        res.writeHead(200, { "content-type": "application/json" });
        return res.end(JSON.stringify({ ok: true, papel: "admin", exp }));
      }
      res.writeHead(401).end("{}");
      return;
    }
    res.writeHead(404).end("{}");
  });
});
site.listen(4599, () => console.log("[site-falso] 4599"));

const evo = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    const json = (o, code = 200) => {
      res.writeHead(code, { "content-type": "application/json" });
      res.end(JSON.stringify(o));
    };
    const u = req.url.split("?")[0];
    if (u === "/instance/fetchInstances") return json([{ name: "loja", connectionStatus: "open", ownerJid: "553599990000@s.whatsapp.net" }]);
    if (u.startsWith("/webhook/set/")) return json({ ok: true });
    if (u.startsWith("/settings/set/")) return json({ ok: true });
    if (u.startsWith("/instance/connectionState/")) return json({ instance: { state: "open" } });
    if (u.startsWith("/chat/findChats/")) return json([]);
    if (u.startsWith("/chat/findMessages/")) { console.log("[evo-falsa] findMessages", body);
      const q = JSON.parse(body || "{}");
      const quantas = Number(q.offset) || 50;
      const ordenadas = [...mensagens].sort((a, b) => b.messageTimestamp - a.messageTimestamp);
      return json({ messages: { total: mensagens.length, pages: 1, currentPage: 1, records: ordenadas.slice(0, quantas) } });
    }
    if (u === "/__injetar") {
      mensagens.push(JSON.parse(body));
      return json({ ok: true, total: mensagens.length });
    }
    return json({ ok: true });
  });
});
evo.listen(4598, () => console.log("[evo-falsa] 4598"));
