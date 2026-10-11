// Envio de arquivo pelo painel: upload direto, em streaming.
//
// Antes, foto, vídeo e documento iam do navegador para cá DENTRO do Socket.IO,
// em base64 (o maxHttpBufferSize era de 80 MB por isso), e daqui para a
// Evolution de novo em base64. Um vídeo de 50 MB virava ~67 MB de texto
// atravessando o mesmo canal das mensagens: enquanto ele passava, nada mais
// chegava à tela, e se a conexão piscasse no meio o envio inteiro se perdia,
// sem barra de progresso nenhuma para o vendedor saber o que estava
// acontecendo.
//
// Agora o arquivo vem por uma rota HTTP própria (multipart), é gravado em
// disco pedaço por pedaço, sem nunca estar inteiro na memória, e a Evolution
// o busca por uma URL da rede interna do Docker. O caminho antigo pelo socket
// continua de reserva no painel.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Busboy = require("busboy");

function montarRotaDeUpload(app, { acesso, pasta, limiteBytes = 64 * 1024 * 1024, segredo, aoReceber, extensaoDoMime }) {
  fs.mkdirSync(pasta, { recursive: true });

  app.post("/api/crm/upload", acesso.exigir(), (req, res) => {
    let bb;
    try {
      bb = Busboy({ headers: req.headers, limits: { fileSize: limiteBytes, files: 1, fields: 20, fieldSize: 64 * 1024 } });
    } catch {
      return res.status(400).json({ ok: false, erro: "Envie o arquivo como multipart/form-data." });
    }

    const campos = {};
    let arquivo = null; // { caminho, nome, mimetype, tamanho }
    let gravacao = null; // promessa do fim da gravação em disco
    let estourou = false;
    let abortado = false;
    let respondido = false;
    const responder = (status, corpo) => {
      if (respondido) return;
      respondido = true;
      res.status(status).json(corpo);
    };
    const jogarFora = () => arquivo && fs.promises.unlink(arquivo.caminho).catch(() => {});

    bb.on("field", (nome, valor) => {
      campos[nome] = valor;
    });

    bb.on("file", (_campo, stream, info) => {
      const mimetype = String(info.mimeType || "application/octet-stream");
      // Nome no disco: aleatório (ninguém adivinha a URL interna) + extensão do tipo.
      const nomeDisco = `${crypto.randomBytes(16).toString("hex")}.${extensaoDoMime(mimetype)}`;
      arquivo = { caminho: path.join(pasta, nomeDisco), nomeDisco, nome: String(info.filename || "arquivo"), mimetype, tamanho: 0 };
      const saida = fs.createWriteStream(arquivo.caminho, { flags: "wx" });
      stream.on("data", (pedaco) => {
        arquivo.tamanho += pedaco.length;
      });
      stream.on("limit", () => {
        estourou = true;
        stream.unpipe(saida);
        saida.destroy();
        stream.resume();
      });
      gravacao = new Promise((ok, falha) => {
        saida.on("finish", ok);
        saida.on("close", ok);
        saida.on("error", falha);
      });
      stream.pipe(saida);
    });

    bb.on("error", (erro) => {
      jogarFora();
      responder(400, { ok: false, erro: `Upload interrompido: ${erro.message}` });
    });

    bb.on("close", async () => {
      try {
        if (abortado) return jogarFora();
        if (estourou) {
          jogarFora();
          return responder(413, { ok: false, erro: `Arquivo grande demais (máx. ${Math.round(limiteBytes / 1024 / 1024)} MB).` });
        }
        if (!arquivo || !gravacao) return responder(400, { ok: false, erro: "Nenhum arquivo veio no envio." });
        await gravacao;
        if (!arquivo.tamanho) {
          jogarFora();
          return responder(400, { ok: false, erro: "O arquivo veio vazio." });
        }
        const saida = await aoReceber({
          arquivo,
          campos,
          quem: req.quem,
          urlInterna: (base) => `${base}/interno/upload/${arquivo.nomeDisco}?k=${segredo}`,
        });
        responder(200, { ok: true, ...saida });
      } catch (erro) {
        jogarFora();
        const status = Number.isInteger(erro.status) ? erro.status : 502;
        responder(status, { ok: false, erro: erro.message });
      }
    });

    // Conexão caiu no meio: o que já foi gravado vai embora.
    req.on("close", () => {
      if (req.complete) return;
      abortado = true;
      jogarFora();
    });
    req.pipe(bb);
  });

  // A Evolution busca o arquivo daqui (rede interna do Docker). A chave na URL
  // é porque a Evolution não manda cabeçalho nosso; e o nome é aleatório.
  app.get("/interno/upload/:arquivo", (req, res) => {
    const k = String(req.query.k || "");
    const ok = k.length === segredo.length && crypto.timingSafeEqual(Buffer.from(k), Buffer.from(segredo));
    const nome = String(req.params.arquivo || "");
    if (!ok || !/^[a-f0-9]{32}\.[a-z0-9]{1,8}$/.test(nome)) return res.status(404).end();
    const caminho = path.join(pasta, nome);
    fs.promises
      .access(caminho)
      .then(() => res.sendFile(caminho))
      .catch(() => res.status(404).end());
  });
}

module.exports = { montarRotaDeUpload };
