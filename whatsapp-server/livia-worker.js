/**
 * LIV.IA — a caixa de entrada da loja, do lado da VPS.
 *
 * Este arquivo NÃO decide nada. Ele abre o IMAP, pega o que chegou, pergunta
 * ao site o que fazer, e executa: arquiva na pasta, guarda rascunho ou manda
 * a resposta. A classificação, o texto e a supressão moram no site
 * (/api/livia/email), que é onde estão o banco e as chaves — worker que
 * pensa é worker que precisa de credencial de banco na máquina mais exposta
 * do conjunto.
 *
 * Credencial: SENHA DE APP do Google (a conta precisa de verificação em duas
 * etapas ligada). A senha normal do Gmail não abre IMAP.
 *
 *   LIVIA_ATIVO=1
 *   LIVIA_EMAIL=balaocastelo@gmail.com
 *   LIVIA_SENHA_APP=xxxxxxxxxxxxxxxx
 *   LIVIA_URL=https://www.balao.info
 *   BETO_TOKEN=...            (o mesmo das outras rotas de worker)
 *   LIVIA_INTERVALO_MIN=5
 */

const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");

const URL_SITE = (process.env.LIVIA_URL || process.env.BETO_URL || "https://www.balao.info")
  .replace(/\/$/, "");
const TOKEN = process.env.BETO_TOKEN || "";
const CAIXA = String(process.env.LIVIA_EMAIL || "").trim();
const SENHA = String(process.env.LIVIA_SENHA_APP || "").trim();
const INTERVALO_MS = Math.max(2, Number(process.env.LIVIA_INTERVALO_MIN) || 5) * 60 * 1000;

// Teto por rodada. Uma caixa com anos de histórico não vira mil chamadas ao
// site na primeira execução — e, se algo estiver errado, o estrago cabe em 25.
const POR_RODADA = 25;

const estado = {
  // "1" como as outras (CARLA_ATIVO, RAFA_ATIVO, BETO_ATIVO) e como o
  // deploy-vps.sh escreve. "true" continua valendo porque foi o que a
  // documentação deste arquivo pediu primeiro — e ficar desligada em
  // silêncio por causa da grafia da chave é o tipo de bug que custa uma
  // manhã para ser notado.
  ativo: ["1", "true", "sim", "on"].includes(
    String(process.env.LIVIA_ATIVO || "").trim().toLowerCase()
  ),
  rodando: false,
  ultimaRodada: null,
  ultimoErro: null,
  vistos: 0,
  respondidos: 0,
  rascunhos: 0,
  arquivados: 0,
};

function pendencias() {
  const faltando = [];
  if (!CAIXA) faltando.push("LIVIA_EMAIL");
  if (!SENHA) faltando.push("LIVIA_SENHA_APP");
  if (!TOKEN) faltando.push("BETO_TOKEN");
  return faltando;
}

function log(...args) {
  console.log("[livia]", ...args);
}

/** Pergunta ao site o que fazer com um e-mail. */
async function perguntarAoSite(email) {
  const resposta = await fetch(`${URL_SITE}/api/livia/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(email),
    signal: AbortSignal.timeout(45_000),
  });
  if (!resposta.ok) throw new Error(`site respondeu ${resposta.status}`);
  return resposta.json();
}

/**
 * Garante que a pasta existe antes de mover.
 *
 * O Gmail cria etiqueta sozinho pelo painel, não pelo IMAP: mover para uma
 * pasta inexistente falha e a mensagem fica na caixa de entrada para sempre,
 * sendo reprocessada a cada rodada.
 */
async function garantirPasta(cliente, nome) {
  try {
    await cliente.mailboxCreate(nome);
  } catch (erro) {
    // ALREADYEXISTS é o caso normal a partir da segunda vez.
    if (!String(erro && erro.message).toLowerCase().includes("exist")) throw erro;
  }
}

/** Uma passada na caixa de entrada. */
async function rodar() {
  if (estado.rodando) return { ok: false, motivo: "já está rodando" };
  const faltando = pendencias();
  if (faltando.length) return { ok: false, motivo: `faltando: ${faltando.join(", ")}` };

  estado.rodando = true;
  const cliente = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: CAIXA, pass: SENHA },
    logger: false,
  });

  try {
    await cliente.connect();
    const trava = await cliente.getMailboxLock("INBOX");
    try {
      // Só o que não foi lido: e-mail já lido é e-mail que alguém da loja já
      // tratou, e responder por cima disso é atropelar um humano.
      //
      // Por UID, não por número de sequência: mover uma mensagem RENUMERA
      // todas as seguintes, e o laço passaria a baixar e arquivar a mensagem
      // errada a partir do primeiro move. UID não muda.
      const ids = await cliente.search({ seen: false }, { uid: true });
      const lote = (ids || []).slice(-POR_RODADA);

      for (const uid of lote) {
        let bruto;
        try {
          const { content } = await cliente.download(String(uid), undefined, { uid: true });
          bruto = await simpleParser(content);
        } catch (erro) {
          log("não consegui ler a mensagem uid", uid, erro.message);
          continue;
        }

        const de = (bruto.from && bruto.from.value && bruto.from.value[0]) || {};
        // `List-Unsubscribe` é o sinal que o próprio protocolo dá para "isto
        // saiu de uma lista". Sem ele, toda newsletter parece um cliente
        // pedindo para sair, porque toda newsletter tem essa frase no rodapé.
        const cabecalhos = bruto.headers || new Map();
        const mala = Boolean(
          cabecalhos.get("list-unsubscribe") ||
          cabecalhos.get("list-id") ||
          String(cabecalhos.get("precedence") || "").toLowerCase() === "bulk"
        );
        const email = {
          messageId: bruto.messageId || `sem-id-${uid}@balao`,
          remetente: String(de.address || "").toLowerCase(),
          nome: de.name || null,
          assunto: bruto.subject || "",
          corpo: (bruto.text || bruto.html || "").slice(0, 20_000),
          recebidoEm: bruto.date ? bruto.date.toISOString() : null,
          mala,
        };
        if (!email.remetente) continue;

        let decisao;
        try {
          decisao = await perguntarAoSite(email);
        } catch (erro) {
          // Site fora do ar: deixa a mensagem como não lida e tenta na
          // próxima rodada. Marcar como lida aqui perderia o e-mail.
          log("site não respondeu:", erro.message);
          break;
        }
        if (!decisao || !decisao.ok) continue;

        estado.vistos += 1;

        try {
          if (decisao.acao === "responder" && decisao.resposta) {
            await enviarResposta(bruto, decisao.resposta);
            estado.respondidos += 1;
          } else if (decisao.acao === "rascunho" && decisao.resposta) {
            await guardarRascunho(cliente, bruto, decisao.resposta);
            estado.rascunhos += 1;
          }
        } catch (erro) {
          // Falhar ao responder não pode impedir de arquivar: senão a mesma
          // mensagem volta na próxima rodada e tenta responder de novo.
          log("não consegui responder", email.remetente, erro.message);
          estado.ultimoErro = erro.message;
        }

        if (decisao.pasta && decisao.acao !== "nada") {
          await garantirPasta(cliente, decisao.pasta);
          try {
            await cliente.messageMove(String(uid), decisao.pasta, { uid: true });
            estado.arquivados += 1;
          } catch (erro) {
            log("não consegui mover para", decisao.pasta, erro.message);
          }
        }
      }
    } finally {
      trava.release();
    }

    estado.ultimaRodada = new Date().toISOString();
    estado.ultimoErro = null;
    return { ok: true, vistos: estado.vistos };
  } catch (erro) {
    estado.ultimoErro = erro.message;
    log("rodada falhou:", erro.message);
    return { ok: false, motivo: erro.message };
  } finally {
    estado.rodando = false;
    try { await cliente.logout(); } catch { /* conexão já caiu */ }
  }
}

/**
 * Manda a resposta, ou guarda como rascunho.
 *
 * O envio sai daqui, e não do site, porque tem que sair do PRÓPRIO endereço
 * da loja: é o que faz a resposta cair na mesma conversa que o cliente abriu,
 * com o histórico junto. O site manda por Resend, de outro domínio — viraria
 * uma mensagem solta de um remetente que o cliente não reconhece.
 *
 * A senha de app do Google serve para IMAP e SMTP; é a mesma credencial que
 * o worker já precisa ter para ler a caixa, não uma a mais.
 */
function correio() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: CAIXA, pass: SENHA },
  });
}

function assuntoDeResposta(original) {
  const assunto = original.subject || "seu contato";
  return /^re:/i.test(assunto) ? assunto : `Re: ${assunto}`;
}

async function enviarResposta(original, texto) {
  const destino = (original.from && original.from.value && original.from.value[0] || {}).address;
  if (!destino) throw new Error("mensagem sem remetente para responder");
  await correio().sendMail({
    from: `"Balão da Informática Castelo" <${CAIXA}>`,
    to: destino,
    subject: assuntoDeResposta(original),
    text: texto,
    // Sem estes dois cabeçalhos a resposta abre uma conversa nova no cliente
    // de e-mail, e o cliente perde o que ele mesmo escreveu.
    inReplyTo: original.messageId,
    references: original.messageId,
  });
}

/** Guarda o texto na pasta de rascunhos do Gmail, para um humano soltar. */
async function guardarRascunho(cliente, original, texto) {
  const destino = original.from && original.from.text;
  await garantirPasta(cliente, "[Gmail]/Rascunhos");
  await cliente.append(
    "[Gmail]/Rascunhos",
    Buffer.from(
      `To: ${destino}\r\nSubject: ${assuntoDeResposta(original)}\r\n` +
      `In-Reply-To: ${original.messageId}\r\nReferences: ${original.messageId}\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n\r\n${texto}`,
      "utf-8"
    ),
    ["\\Draft"]
  );
}

let relogio = null;

function ligar() {
  estado.ativo = true;
  if (!relogio) relogio = setInterval(() => { if (estado.ativo) rodar(); }, INTERVALO_MS);
  return resumo();
}

function desligar() {
  estado.ativo = false;
  // Solta o relógio também: um intervalo pendurado segura o processo vivo no
  // encerramento e, no teste, faz a suíte nunca terminar.
  if (relogio) { clearInterval(relogio); relogio = null; }
  return resumo();
}

/** O que o painel mostra. Nunca devolve a senha. */
function resumo() {
  return {
    ativo: estado.ativo,
    caixa: CAIXA || null,
    intervaloMin: INTERVALO_MS / 60000,
    pendencias: pendencias(),
    ultimaRodada: estado.ultimaRodada,
    ultimoErro: estado.ultimoErro,
    vistos: estado.vistos,
    respondidos: estado.respondidos,
    rascunhos: estado.rascunhos,
    arquivados: estado.arquivados,
  };
}

function iniciar() {
  if (pendencias().length) {
    log("desligada — faltando:", pendencias().join(", "));
    return;
  }
  if (estado.ativo) {
    log(`ligada em ${CAIXA}, a cada ${INTERVALO_MS / 60000} min`);
    relogio = setInterval(() => { if (estado.ativo) rodar(); }, INTERVALO_MS);
    rodar();
  } else {
    log("configurada, mas desligada (LIVIA_ATIVO diferente de 1)");
  }
}

module.exports = { iniciar, ligar, desligar, rodar, resumo, pendencias, estado };
