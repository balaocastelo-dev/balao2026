// A mensagem tem de aparecer na conversa certa, venha o WhatsApp com o número
// ou com o código interno (@lid). Cópia da lógica do painel.

const telefoneCanonico = (bruto) => {
  const d = String(bruto || "").replace(/\D/g, "");
  if (d.length < 10 || d.length > 13) return null;
  const semPais = d.startsWith("55") && d.length >= 12 ? d.slice(2) : d;
  if (semPais.length < 10 || semPais.length > 11) return null;
  return `${semPais.slice(0, 2)}${semPais.slice(2).slice(-8)}`;
};
const codigoInterno = (bruto) => {
  const txt = String(bruto || "");
  const d = txt.replace(/\D/g, "");
  if (!d) return null;
  if (txt.includes("@lid")) return d;
  return d.length >= 14 ? d : null;
};

function aparece(msg, chatAberto) {
  const chatSelecionadoId = chatAberto.id;
  const telefoneDoChat = telefoneCanonico(chatAberto.numero) || telefoneCanonico(chatSelecionadoId);
  const lidsDoChat = new Set([codigoInterno(chatSelecionadoId), codigoInterno(chatAberto.lid)].filter(Boolean));

  if (msg.chatId === chatSelecionadoId) return true;
  const telefoneDaMsg = telefoneCanonico(msg.realNumber) || telefoneCanonico(msg.chatId);
  if (telefoneDoChat && telefoneDaMsg && telefoneDoChat === telefoneDaMsg) return true;
  const lidDaMsg = codigoInterno(msg.chatId) || codigoInterno(msg.lid);
  if (lidDaMsg && lidsDoChat.has(lidDaMsg)) return true;
  if (telefoneDoChat && telefoneCanonico(msg.lid ? msg.realNumber : null) === telefoneDoChat) return true;
  if (lidsDoChat.size && codigoInterno(msg.lid) && lidsDoChat.has(codigoInterno(msg.lid))) return true;
  return false;
}

let falhas = 0;
const ok = (nome, cond) => { console.log(`${cond ? "PASSOU" : "FALHOU"}  ${nome}`); if (!cond) falhas++; };

const CHAT_NUM = { id: "5519991112222@c.us", numero: "5519991112222", lid: null };
const CHAT_LID = { id: "273082677764270@lid", numero: "", lid: "273082677764270" };
const CHAT_LID_RESOLVIDO = { id: "273082677764270@lid", numero: "", lid: "273082677764270" };

// --- o caso do Thiago: digitou no celular, chegou com @lid ---
ok("msg @lid com numero resolvido APARECE na conversa aberta pelo numero",
   aparece({ chatId: "273082677764270@lid", lid: "273082677764270", realNumber: "5519991112222" }, CHAT_NUM));

ok("msg @c.us APARECE na conversa aberta pelo @lid (sentido inverso)",
   aparece({ chatId: "5519991112222@c.us", lid: "273082677764270", realNumber: "5519991112222" }, CHAT_LID_RESOLVIDO));

ok("msg @lid APARECE na conversa aberta pelo mesmo @lid",
   aparece({ chatId: "273082677764270@lid", lid: "273082677764270", realNumber: null }, CHAT_LID));

ok("msg @c.us APARECE na conversa @c.us (caminho normal)",
   aparece({ chatId: "5519991112222@c.us", lid: null, realNumber: "5519991112222" }, CHAT_NUM));

// --- grafias diferentes do mesmo numero ---
ok("sem o 55 casa com o com 55",
   aparece({ chatId: "19991112222@c.us", realNumber: "19991112222" }, CHAT_NUM));
ok("sem o nono digito casa",
   aparece({ chatId: "551991112222@c.us", realNumber: "551991112222" }, CHAT_NUM));

// --- e o que NAO pode acontecer: aparecer na conversa errada ---
ok("cliente DIFERENTE nao aparece",
   !aparece({ chatId: "5519998887777@c.us", realNumber: "5519998887777" }, CHAT_NUM));
ok("DDD diferente, final igual, NAO aparece",
   !aparece({ chatId: "5511991112222@c.us", realNumber: "5511991112222" }, CHAT_NUM));
ok("codigo interno de OUTRA conversa nao aparece",
   !aparece({ chatId: "999999999999999@lid", lid: "999999999999999" }, CHAT_NUM));
ok("codigo interno NAO casa com telefone por coincidencia de digitos",
   !aparece({ chatId: "195519991112222@lid", lid: "195519991112222" }, CHAT_NUM));
ok("msg sem nada identificavel nao aparece",
   !aparece({ chatId: "", lid: null, realNumber: null }, CHAT_NUM));

// --- o bug irmao que o codigo antigo tinha (sufixo sem olhar tamanho) ---
const antigo = (msg, chat) => {
  const cleanSelNum = chat.numero ? chat.numero.replace(/\D/g, "") : "";
  const mNum = String(msg.chatId || "").replace(/\D/g, "");
  if (msg.chatId === chat.id) return true;
  if (cleanSelNum && mNum && (cleanSelNum.endsWith(mNum) || mNum.endsWith(cleanSelNum))) return true;
  return false;
};
ok("CODIGO ANTIGO escondia a mensagem @lid (prova do bug)",
   !antigo({ chatId: "273082677764270@lid", realNumber: "5519991112222" }, CHAT_NUM));
ok("CODIGO ANTIGO mostrava na conversa errada (prova do bug irmao)",
   antigo({ chatId: "5519991112222@c.us" }, { id: "19991112222@c.us", numero: "19991112222" }));

console.log(`\n${falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"}`);
process.exit(falhas ? 1 : 0);
