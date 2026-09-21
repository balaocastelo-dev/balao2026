// Módulo de Status da loja: conteúdos, agendamentos, publicação, auditoria,
// biblioteca, calendário e status recebidos dos contatos.
//
// Independente do resto do servidor: recebe por injeção o banco, o cliente
// da Evolution e como avisar o painel. Pensado para crescer (campanhas,
// aprovação, métricas, várias contas) sem refazer: toda linha já tem `conta`
// e toda ação passa por `auditar`.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const R = require("./recorrencia");

const ASSINATURA_PADRAO = "Balão da Informática Castelo\n🌐 balao.info\nConfira: https://balao.info";
const CONFIG_PADRAO = {
  assinatura: { ativa: true, texto: ASSINATURA_PADRAO },
  // Status atrasado além disto não sai (ex.: servidor ficou fora do ar de
  // manhã — "Bom dia, estamos abertos" não pode sair às 15h).
  toleranciaAtrasoMin: 30,
  // Janela do alerta "loja sem status programado".
  diasDeAlerta: 7,
  minimoPorDia: 1,
};
const CATEGORIAS = [
  "Ofertas",
  "Computadores",
  "Notebooks",
  "Serviços",
  "Garantia",
  "Institucional",
  "Horário de funcionamento",
  "Dicas",
  "Datas comemorativas",
];
const MIMES_ACEITOS = {
  "image/jpeg": "imagem",
  "image/png": "imagem",
  "image/webp": "imagem",
  "video/mp4": "video",
  "video/3gpp": "video",
  "video/quicktime": "video",
};
const LIMITE_IMAGEM = 10 * 1024 * 1024;
const LIMITE_VIDEO = 60 * 1024 * 1024;
const CORES_TEXTO = ["#0a6e3d", "#b91c1c", "#1f3a8a", "#6b21a8", "#b45309", "#0f766e", "#111827"];

class ErroStatus extends Error {
  constructor(msg, status = 400) {
    super(msg);
    this.status = status;
  }
}

function usuarioDe(quem) {
  if (!quem) return "sistema";
  if (quem.papel === "vendedor") return `vendedor:${quem.vendedor || "?"}`;
  if (quem.vendedor === "site") return "site";
  return quem.papel || "admin";
}

function criarServicoDeStatus({
  db,
  evolution,
  instancia,
  pasta,
  urlInternaBase,
  segredoInterno,
  estaConectado,
  avisarPainel,
  registrar = console.log,
  carregarSharp = () => require("sharp"),
}) {
  fs.mkdirSync(pasta, { recursive: true });
  let config = { ...CONFIG_PADRAO };

  // ---------------------------------------------------------------- base
  async function auditar(usuario, acao, { conteudoId = null, agendamentoId = null, execucaoId = null, detalhes = {} } = {}, cliente = db) {
    await cliente.query(
      `INSERT INTO status_auditoria (usuario, acao, conteudo_id, agendamento_id, execucao_id, detalhes)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [usuario, acao, conteudoId, agendamentoId, execucaoId, detalhes]
    );
  }

  function mudou(tipo, extra = {}) {
    avisarPainel("status:mudou", { tipo, ...extra, em: Date.now() });
  }

  async function carregarConfig() {
    const r = await db.query("SELECT valor FROM status_config WHERE chave = 'geral'");
    config = { ...CONFIG_PADRAO, ...(r.rows[0]?.valor || {}) };
    config.assinatura = { ...CONFIG_PADRAO.assinatura, ...(config.assinatura || {}) };
    return config;
  }

  async function salvarConfig(novo, quem) {
    const atual = await carregarConfig();
    const assinatura = novo?.assinatura || {};
    const proximo = {
      ...atual,
      assinatura: {
        ativa: assinatura.ativa !== undefined ? Boolean(assinatura.ativa) : atual.assinatura.ativa,
        texto: String(assinatura.texto ?? atual.assinatura.texto).slice(0, 300).trim() || ASSINATURA_PADRAO,
      },
      toleranciaAtrasoMin: Math.min(240, Math.max(5, Number(novo?.toleranciaAtrasoMin ?? atual.toleranciaAtrasoMin))),
      diasDeAlerta: Math.min(31, Math.max(1, Number(novo?.diasDeAlerta ?? atual.diasDeAlerta))),
      minimoPorDia: Math.min(10, Math.max(1, Number(novo?.minimoPorDia ?? atual.minimoPorDia))),
    };
    await db.query(
      `INSERT INTO status_config (chave, valor, atualizado_em, atualizado_por) VALUES ('geral', $1, now(), $2)
       ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now(), atualizado_por = EXCLUDED.atualizado_por`,
      [proximo, usuarioDe(quem)]
    );
    await auditar(usuarioDe(quem), "config_alterada", { detalhes: { antes: atual, depois: proximo } });
    config = proximo;
    mudou("config");
    return config;
  }

  /** Texto final: conteúdo + link + assinatura (sem repetir o que já está). */
  function montarTexto(c) {
    const partes = [String(c.texto || "").trim()];
    const link = String(c.link || "").trim();
    if (link && !partes[0].includes(link)) partes.push(`👉 ${link}`);
    if (c.assinar && config.assinatura.ativa) {
      const ass = config.assinatura.texto.trim();
      if (ass && !partes.join("\n").includes(ass)) partes.push(ass);
    }
    return partes.filter(Boolean).join("\n\n");
  }

  // ---------------------------------------------------------------- mídia
  function caminho(arquivo) {
    const limpo = path.basename(String(arquivo || ""));
    return path.join(pasta, limpo);
  }

  async function salvarMidia(dataUrl) {
    const m = String(dataUrl || "").match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$/s);
    if (!m) throw new ErroStatus("Arquivo inválido: envie imagem ou vídeo.");
    const mime = m[1].toLowerCase();
    const tipo = MIMES_ACEITOS[mime];
    if (!tipo) throw new ErroStatus("Formato não aceito. Use JPG, PNG, WEBP ou MP4.");
    const bytes = Buffer.from(m[2], "base64");
    if (tipo === "imagem" && bytes.length > LIMITE_IMAGEM) throw new ErroStatus("Imagem acima de 10 MB.");
    if (tipo === "video" && bytes.length > LIMITE_VIDEO) throw new ErroStatus("Vídeo acima de 60 MB.");
    const id = crypto.randomUUID();
    if (tipo === "imagem") {
      // Normaliza para JPG até 1920 px, girando pela orientação da câmera:
      // é o formato que o WhatsApp exibe sem recomprimir de novo.
      const sharp = carregarSharp();
      const saida = await sharp(bytes)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      fs.writeFileSync(caminho(`${id}.jpg`), saida);
      return { tipo, arquivo: `${id}.jpg`, mime: "image/jpeg" };
    }
    const ext = mime === "video/3gpp" ? "3gp" : mime === "video/quicktime" ? "mov" : "mp4";
    fs.writeFileSync(caminho(`${id}.${ext}`), bytes);
    return { tipo, arquivo: `${id}.${ext}`, mime };
  }

  /** Cópia da imagem com o selo "balao.info" no canto (a original fica intacta). */
  async function comSelo(arquivo) {
    const destino = caminho(arquivo.replace(/\.jpg$/, "-selo.jpg"));
    if (fs.existsSync(destino)) return path.basename(destino);
    const sharp = carregarSharp();
    const img = sharp(caminho(arquivo));
    const { width = 1080, height = 1080 } = await img.metadata();
    const altura = Math.max(28, Math.round(Math.min(width, height) * 0.055));
    const largura = Math.round(altura * 3.9);
    const margem = Math.round(altura * 0.6);
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}">
        <rect width="100%" height="100%" rx="${altura / 2}" fill="#0a6e3d" fill-opacity="0.82"/>
        <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
          font-family="DejaVu Sans, Arial, sans-serif" font-weight="700"
          font-size="${Math.round(altura * 0.55)}" fill="#ffffff">balao.info</text>
      </svg>`
    );
    await img
      .composite([{ input: svg, left: Math.max(0, width - largura - margem), top: Math.max(0, height - altura - margem) }])
      .jpeg({ quality: 88 })
      .toFile(destino);
    return path.basename(destino);
  }

  function urlInterna(arquivo) {
    return `${urlInternaBase}/interno/status/${encodeURIComponent(arquivo)}?k=${segredoInterno}`;
  }

  // ---------------------------------------------------------------- conteúdos
  function linhaParaConteudo(r) {
    if (!r) return null;
    return {
      id: r.id,
      titulo: r.titulo,
      tipo: r.tipo,
      texto: r.texto,
      link: r.link,
      corFundo: r.cor_fundo,
      fonte: r.fonte,
      midia: r.midia_arquivo ? `/api/status/midia/${r.midia_arquivo}` : null,
      midiaMime: r.midia_mime,
      categoria: r.categoria,
      campanha: r.campanha,
      assinar: r.assinar,
      selo: r.selo,
      modelo: r.modelo,
      criadoPor: r.criado_por,
      criadoEm: r.criado_em,
      atualizadoEm: r.atualizado_em,
      textoFinal: montarTexto(r),
    };
  }

  async function lerConteudo(id, cliente = db) {
    const r = await cliente.query("SELECT * FROM status_conteudo WHERE id = $1 AND excluido_em IS NULL", [id]);
    if (!r.rowCount) throw new ErroStatus("Status não encontrado.", 404);
    return r.rows[0];
  }

  async function salvarConteudo(dados, quem) {
    const usuario = usuarioDe(quem);
    const titulo = String(dados.titulo || "").trim().slice(0, 80);
    const texto = String(dados.texto || "").slice(0, 700);
    const link = String(dados.link || "").trim().slice(0, 300) || null;
    if (link && !/^https?:\/\/\S+$/i.test(link)) throw new ErroStatus("O link precisa começar com http:// ou https://");
    const categoria = CATEGORIAS.includes(dados.categoria) ? dados.categoria : null;
    const campanha = String(dados.campanha || "").trim().slice(0, 60) || null;
    const corFundo = CORES_TEXTO.includes(dados.corFundo) ? dados.corFundo : CORES_TEXTO[0];
    const fonte = Math.min(5, Math.max(1, Number(dados.fonte) || 1));
    const assinar = dados.assinar !== false;
    const selo = dados.selo !== false;
    const modelo = Boolean(dados.modelo);

    let midia = null;
    if (dados.midiaDataUrl) midia = await salvarMidia(dados.midiaDataUrl);

    if (dados.id) {
      const atual = await lerConteudo(dados.id);
      const tipo = midia ? midia.tipo : dados.removerMidia ? "texto" : atual.tipo;
      if (tipo === "texto" && !texto.trim()) throw new ErroStatus("Status de texto precisa de texto.");
      const r = await db.query(
        `UPDATE status_conteudo SET titulo=$2, tipo=$3, texto=$4, link=$5, cor_fundo=$6, fonte=$7,
           midia_arquivo=$8, midia_mime=$9, categoria=$10, campanha=$11, assinar=$12, selo=$13, modelo=$14,
           atualizado_em=now()
         WHERE id=$1 RETURNING *`,
        [
          atual.id,
          titulo || atual.titulo,
          tipo,
          texto,
          link,
          corFundo,
          fonte,
          midia ? midia.arquivo : tipo === "texto" ? null : atual.midia_arquivo,
          midia ? midia.mime : tipo === "texto" ? null : atual.midia_mime,
          categoria,
          campanha,
          assinar,
          selo,
          modelo,
        ]
      );
      await auditar(usuario, "status_editado", {
        conteudoId: atual.id,
        detalhes: { antes: { titulo: atual.titulo, texto: atual.texto, tipo: atual.tipo }, depois: { titulo, texto, tipo } },
      });
      mudou("conteudo");
      return linhaParaConteudo(r.rows[0]);
    }

    const tipo = midia ? midia.tipo : "texto";
    if (tipo === "texto" && !texto.trim()) throw new ErroStatus("Status de texto precisa de texto.");
    const id = crypto.randomUUID();
    const r = await db.query(
      `INSERT INTO status_conteudo (id, titulo, tipo, texto, link, cor_fundo, fonte, midia_arquivo, midia_mime,
         categoria, campanha, assinar, selo, modelo, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        id,
        titulo || (texto.split("\n")[0] || "Status").slice(0, 60),
        tipo,
        texto,
        link,
        corFundo,
        fonte,
        midia?.arquivo || null,
        midia?.mime || null,
        categoria,
        campanha,
        assinar,
        selo,
        modelo,
        usuario,
      ]
    );
    await auditar(usuario, modelo ? "modelo_criado" : "status_criado", { conteudoId: id, detalhes: { titulo, tipo } });
    mudou("conteudo");
    return linhaParaConteudo(r.rows[0]);
  }

  async function duplicarConteudo(id, quem, { comoModelo = null } = {}) {
    const c = await lerConteudo(id);
    const novoId = crypto.randomUUID();
    let arquivo = c.midia_arquivo;
    if (arquivo && fs.existsSync(caminho(arquivo))) {
      const ext = path.extname(arquivo);
      const copia = `${novoId}${ext}`;
      fs.copyFileSync(caminho(arquivo), caminho(copia));
      arquivo = copia;
    }
    const modelo = comoModelo === null ? c.modelo : comoModelo;
    const r = await db.query(
      `INSERT INTO status_conteudo (id, titulo, tipo, texto, link, cor_fundo, fonte, midia_arquivo, midia_mime,
         categoria, campanha, assinar, selo, modelo, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        novoId,
        comoModelo === true ? c.titulo : `${c.titulo} (cópia)`.slice(0, 80),
        c.tipo,
        c.texto,
        c.link,
        c.cor_fundo,
        c.fonte,
        arquivo,
        c.midia_mime,
        c.categoria,
        c.campanha,
        c.assinar,
        c.selo,
        modelo,
        usuarioDe(quem),
      ]
    );
    await auditar(usuarioDe(quem), modelo && !c.modelo ? "salvo_como_modelo" : "status_duplicado", {
      conteudoId: novoId,
      detalhes: { origem: id },
    });
    mudou("conteudo");
    return linhaParaConteudo(r.rows[0]);
  }

  async function excluirConteudo(id, quem) {
    await db.transacao(async (t) => {
      await lerConteudo(id, t);
      const ags = await t.query(
        `UPDATE status_agendamento SET situacao='cancelado', proxima_em=NULL, atualizado_em=now()
         WHERE conteudo_id=$1 AND situacao IN ('ativo','pausado') RETURNING id`,
        [id]
      );
      await t.query("UPDATE status_conteudo SET excluido_em=now() WHERE id=$1", [id]);
      await auditar(usuarioDe(quem), "status_excluido", { conteudoId: id, detalhes: { agendamentosCancelados: ags.rowCount } }, t);
    });
    mudou("conteudo");
  }

  // ---------------------------------------------------------------- agendamentos
  function linhaParaAgendamento(r) {
    return {
      id: r.id,
      conteudoId: r.conteudo_id,
      regra: r.regra,
      descricao: R.descrever(r.regra),
      recorrente: r.regra?.tipo !== "unica",
      situacao: r.situacao,
      proximaEm: r.proxima_em,
      criadoPor: r.criado_por,
      criadoEm: r.criado_em,
      atualizadoEm: r.atualizado_em,
    };
  }

  async function agendar(conteudoId, regraBruta, quem) {
    const regra = R.validarRegra(regraBruta);
    await lerConteudo(conteudoId);
    const proximaEm = R.proxima(regra, Date.now());
    if (!proximaEm) throw new ErroStatus("Essa data/horário já passou. Escolha um momento futuro.");
    const id = crypto.randomUUID();
    const r = await db.query(
      `INSERT INTO status_agendamento (id, conteudo_id, regra, situacao, proxima_em, criado_por)
       VALUES ($1,$2,$3,'ativo',$4,$5) RETURNING *`,
      [id, conteudoId, regra, new Date(proximaEm), usuarioDe(quem)]
    );
    await auditar(usuarioDe(quem), "agendado", {
      conteudoId,
      agendamentoId: id,
      detalhes: { regra, descricao: R.descrever(regra), proxima: new Date(proximaEm).toISOString() },
    });
    mudou("agendamento");
    return linhaParaAgendamento(r.rows[0]);
  }

  async function alterarAgendamento(id, { regra: regraBruta, situacao }, quem) {
    return db.transacao(async (t) => {
      const r = await t.query("SELECT * FROM status_agendamento WHERE id=$1 FOR UPDATE", [id]);
      if (!r.rowCount) throw new ErroStatus("Agendamento não encontrado.", 404);
      const atual = r.rows[0];
      if (["finalizado", "cancelado"].includes(atual.situacao) && situacao !== "ativo") {
        throw new ErroStatus("Esse agendamento já terminou.");
      }
      let regra = atual.regra;
      if (regraBruta) regra = R.validarRegra(regraBruta);
      let nova = situacao || atual.situacao;
      if (!["ativo", "pausado", "cancelado"].includes(nova)) throw new ErroStatus("Situação inválida.");
      let proximaEm = null;
      if (nova === "ativo") {
        proximaEm = R.proxima(regra, Date.now());
        if (!proximaEm) throw new ErroStatus("Não há próxima data para esse agendamento. Reagende com uma data futura.");
      }
      const u = await t.query(
        `UPDATE status_agendamento SET regra=$2, situacao=$3, proxima_em=$4, atualizado_em=now() WHERE id=$1 RETURNING *`,
        [id, regra, nova, proximaEm ? new Date(proximaEm) : null]
      );
      const acao =
        nova === "pausado" ? "pausado" : nova === "cancelado" ? "cancelado" : atual.situacao !== "ativo" ? "reativado" : "reagendado";
      await auditar(
        usuarioDe(quem),
        regraBruta && acao === "reativado" ? "reagendado" : acao,
        {
          conteudoId: atual.conteudo_id,
          agendamentoId: id,
          detalhes: { antes: { regra: atual.regra, situacao: atual.situacao }, depois: { regra, situacao: nova } },
        },
        t
      );
      mudou("agendamento");
      return linhaParaAgendamento(u.rows[0]);
    });
  }

  // ---------------------------------------------------------------- publicação
  async function publicarAgora(conteudoId, quem, { origem = "manual", agendamentoId = null, previsto = new Date(), chave = null, tentativa = 1 } = {}) {
    await lerConteudo(conteudoId);
    const id = crypto.randomUUID();
    const r = await db.query(
      `INSERT INTO status_execucao (id, chave, agendamento_id, conteudo_id, previsto_para, situacao, tentativa, origem, disparado_por)
       VALUES ($1,$2,$3,$4,$5,'publicando',$6,$7,$8) ON CONFLICT (chave) DO NOTHING RETURNING id`,
      [id, chave || `${origem}:${id}`, agendamentoId, conteudoId, previsto, tentativa, origem, usuarioDe(quem)]
    );
    if (!r.rowCount) throw new ErroStatus("Essa publicação já foi feita ou está em andamento.", 409);
    return executar(id);
  }

  /** Publica UMA execução já reservada (situacao='publicando'). */
  async function executar(execucaoId) {
    const e = (await db.query("SELECT * FROM status_execucao WHERE id=$1", [execucaoId])).rows[0];
    const c = await lerConteudo(e.conteudo_id).catch(() => null);
    let situacao = "publicado";
    let erro = null;
    let idWhatsapp = null;
    try {
      if (!c) throw Object.assign(new Error("O status foi excluído."), { naoPublicou: true });
      if (!estaConectado()) throw Object.assign(new Error("WhatsApp da loja desconectado."), { naoPublicou: true });
      const texto = montarTexto(c);
      let corpo;
      if (c.tipo === "texto") {
        corpo = { type: "text", content: texto, backgroundColor: c.cor_fundo, font: c.fonte, allContacts: true };
      } else {
        if (!c.midia_arquivo || !fs.existsSync(caminho(c.midia_arquivo))) {
          throw Object.assign(new Error("A mídia do status sumiu do servidor."), { naoPublicou: true });
        }
        const arquivo = c.tipo === "imagem" && c.selo ? await comSelo(c.midia_arquivo) : c.midia_arquivo;
        corpo = {
          type: c.tipo === "imagem" ? "image" : "video",
          content: urlInterna(arquivo),
          caption: texto || undefined,
          allContacts: true,
        };
      }
      const rec = await evolution.publicarStatus(instancia, corpo);
      idWhatsapp = rec?.key?.id || null;
      if (!idWhatsapp) {
        situacao = "incerto";
        erro = "A Evolution respondeu sem confirmar o id da publicação. Confira no celular antes de repetir.";
      }
    } catch (err) {
      // Resposta de erro da Evolution (4xx/5xx) ou recusa nossa = não saiu.
      // Queda de rede/tempo esgotado = pode ter saído: fica "incerto" e NÃO
      // é repetido sozinho, para nunca publicar duas vezes.
      const respondeu = err.naoPublicou || (err.status && err.status >= 400);
      situacao = respondeu ? "falhou" : "incerto";
      erro = respondeu ? err.message : `Sem resposta do WhatsApp (${err.message}). Pode ter sido publicado — confira no celular.`;
    }
    await db.query(
      `UPDATE status_execucao SET situacao=$2, erro=$3, id_whatsapp=$4, concluido_em=now() WHERE id=$1`,
      [execucaoId, situacao, erro, idWhatsapp]
    );
    await auditar(e.disparado_por, situacao === "publicado" ? "publicado" : situacao === "falhou" ? "falhou" : "resultado_incerto", {
      conteudoId: e.conteudo_id,
      agendamentoId: e.agendamento_id,
      execucaoId,
      detalhes: { erro, idWhatsapp, tentativa: e.tentativa, origem: e.origem },
    });
    mudou("execucao", { situacao });
    if (situacao !== "publicado") registrar(`[status] ${c?.titulo || e.conteudo_id}: ${situacao} — ${erro}`);
    return { execucaoId, situacao, erro, idWhatsapp };
  }

  async function tentarNovamente(execucaoId, quem) {
    const e = (await db.query("SELECT * FROM status_execucao WHERE id=$1", [execucaoId])).rows[0];
    if (!e) throw new ErroStatus("Execução não encontrada.", 404);
    if (!["falhou", "incerto", "perdido"].includes(e.situacao)) throw new ErroStatus("Só dá para repetir o que falhou.");
    const tentativa = e.tentativa + 1;
    await auditar(usuarioDe(quem), "nova_tentativa", {
      conteudoId: e.conteudo_id,
      agendamentoId: e.agendamento_id,
      execucaoId,
      detalhes: { tentativa },
    });
    return publicarAgora(e.conteudo_id, quem, {
      origem: "tentativa",
      agendamentoId: e.agendamento_id,
      previsto: e.previsto_para,
      chave: `tentativa:${execucaoId}:${tentativa}`,
      tentativa,
    });
  }

  // ---------------------------------------------------------------- agendador
  let rodando = false;
  async function tick() {
    if (rodando) return;
    rodando = true;
    try {
      const agora = Date.now();
      const tolerancia = config.toleranciaAtrasoMin * 60_000;
      const reservadas = await db.transacao(async (t) => {
        const devidos = await t.query(
          `SELECT * FROM status_agendamento WHERE situacao='ativo' AND proxima_em <= now()
           ORDER BY proxima_em LIMIT 20 FOR UPDATE SKIP LOCKED`
        );
        const lista = [];
        for (const a of devidos.rows) {
          const previsto = new Date(a.proxima_em).getTime();
          const atrasado = agora - previsto > tolerancia;
          const id = crypto.randomUUID();
          const ins = await t.query(
            `INSERT INTO status_execucao (id, chave, agendamento_id, conteudo_id, previsto_para, situacao, origem, disparado_por, erro, concluido_em)
             VALUES ($1,$2,$3,$4,$5,$6,'agendada',$7,$8,$9) ON CONFLICT (chave) DO NOTHING RETURNING id`,
            [
              id,
              `agenda:${a.id}:${new Date(previsto).toISOString()}`,
              a.id,
              a.conteudo_id,
              new Date(previsto),
              atrasado ? "perdido" : "publicando",
              a.criado_por,
              atrasado
                ? `O servidor estava fora do ar às ${new Date(previsto).toLocaleString("pt-BR", { timeZone: R.FUSO })}; não publicado atrasado.`
                : null,
              atrasado ? new Date() : null,
            ]
          );
          if (ins.rowCount && !atrasado) lista.push(id);
          if (ins.rowCount && atrasado) {
            await auditar("sistema", "perdido", { conteudoId: a.conteudo_id, agendamentoId: a.id, execucaoId: id }, t);
          }
          // Próxima: a seguinte a esta; se o servidor ficou fora muito tempo,
          // pula direto para a primeira que ainda cabe na tolerância.
          let proxima = R.proxima(a.regra, previsto);
          if (proxima && agora - proxima > tolerancia) proxima = R.proxima(a.regra, agora - tolerancia);
          await t.query(
            `UPDATE status_agendamento SET proxima_em=$2, situacao=$3, atualizado_em=now() WHERE id=$1`,
            [a.id, proxima ? new Date(proxima) : null, proxima ? "ativo" : "finalizado"]
          );
          if (!proxima) await auditar("sistema", "finalizado", { conteudoId: a.conteudo_id, agendamentoId: a.id }, t);
        }
        return lista;
      });
      for (const id of reservadas) await executar(id);
      if (reservadas.length) mudou("agendamento");
    } catch (e) {
      registrar("[status] Falha no agendador:", e.message);
    } finally {
      rodando = false;
    }
  }

  async function iniciar() {
    await carregarConfig();
    // Execução que estava "publicando" quando o servidor caiu: não sabemos se
    // saiu. Nunca repete sozinha.
    const r = await db.query(
      `UPDATE status_execucao SET situacao='incerto', concluido_em=now(),
         erro='O servidor reiniciou durante a publicação. Confira no celular antes de tentar de novo.'
       WHERE situacao='publicando' RETURNING id, conteudo_id, agendamento_id`
    );
    for (const e of r.rows) {
      await auditar("sistema", "resultado_incerto", { conteudoId: e.conteudo_id, agendamentoId: e.agendamento_id, execucaoId: e.id, detalhes: { motivo: "reinício" } });
    }
    setInterval(tick, 20_000).unref?.();
    setInterval(limparRecebidos, 30 * 60_000).unref?.();
    setTimeout(tick, 3000).unref?.();
  }

  // ---------------------------------------------------------------- consultas
  async function resumo() {
    const [conteudos, agendamentos, execucoes] = await Promise.all([
      db.query("SELECT * FROM status_conteudo WHERE excluido_em IS NULL ORDER BY atualizado_em DESC LIMIT 500"),
      db.query("SELECT * FROM status_agendamento ORDER BY coalesce(proxima_em, atualizado_em) DESC LIMIT 500"),
      db.query("SELECT * FROM status_execucao ORDER BY iniciado_em DESC LIMIT 300"),
    ]);
    return {
      config,
      categorias: CATEGORIAS,
      cores: CORES_TEXTO,
      conteudos: conteudos.rows.map(linhaParaConteudo),
      agendamentos: agendamentos.rows.map(linhaParaAgendamento),
      execucoes: execucoes.rows.map((e) => ({
        id: e.id,
        agendamentoId: e.agendamento_id,
        conteudoId: e.conteudo_id,
        previstoPara: e.previsto_para,
        situacao: e.situacao,
        tentativa: e.tentativa,
        origem: e.origem,
        disparadoPor: e.disparado_por,
        iniciadoEm: e.iniciado_em,
        concluidoEm: e.concluido_em,
        erro: e.erro,
      })),
      alertas: await alertas(),
    };
  }

  async function calendario(deMs, ateMs) {
    if (!(ateMs > deMs) || ateMs - deMs > 62 * 24 * 3600_000) throw new ErroStatus("Período inválido (máx. 62 dias).");
    const ags = await db.query(
      `SELECT a.*, c.titulo, c.tipo, c.campanha, c.categoria FROM status_agendamento a
       JOIN status_conteudo c ON c.id = a.conteudo_id
       WHERE a.situacao IN ('ativo','pausado') AND c.excluido_em IS NULL`
    );
    const itens = [];
    const agora = Date.now();
    for (const a of ags.rows) {
      const desde = Math.max(deMs, agora);
      if (desde >= ateMs) continue;
      for (const t of R.ocorrencias(a.regra, desde, ateMs, 400)) {
        itens.push({
          quando: new Date(t).toISOString(),
          data: R.dataLocal(t).data,
          conteudoId: a.conteudo_id,
          agendamentoId: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          campanha: a.campanha,
          categoria: a.categoria,
          recorrente: a.regra.tipo !== "unica",
          pausado: a.situacao === "pausado",
          situacao: a.situacao === "pausado" ? "pausado" : "programado",
        });
      }
    }
    const feitas = await db.query(
      `SELECT e.*, c.titulo, c.tipo, c.campanha, c.categoria FROM status_execucao e
       JOIN status_conteudo c ON c.id = e.conteudo_id
       WHERE e.previsto_para >= $1 AND e.previsto_para < $2`,
      [new Date(deMs), new Date(ateMs)]
    );
    for (const e of feitas.rows) {
      const t = new Date(e.previsto_para).getTime();
      itens.push({
        quando: new Date(t).toISOString(),
        data: R.dataLocal(t).data,
        conteudoId: e.conteudo_id,
        agendamentoId: e.agendamento_id,
        execucaoId: e.id,
        titulo: e.titulo,
        tipo: e.tipo,
        campanha: e.campanha,
        categoria: e.categoria,
        recorrente: false,
        situacao: e.situacao,
      });
    }
    itens.sort((a, b) => a.quando.localeCompare(b.quando));
    return { de: new Date(deMs).toISOString(), ate: new Date(ateMs).toISOString(), itens, minimoPorDia: config.minimoPorDia };
  }

  /** Dias dos próximos N sem status (ou com menos que o mínimo) programado. */
  async function alertas() {
    const hoje = R.dataLocal(Date.now()).data;
    const de = R.instante(hoje, "00:00");
    const ate = R.instante(R.somarDias(hoje, config.diasDeAlerta), "00:00");
    const cal = await calendario(de, ate).catch(() => ({ itens: [] }));
    const porDia = {};
    for (let i = 0; i < config.diasDeAlerta; i++) porDia[R.somarDias(hoje, i)] = 0;
    // Conta o que vai sair e o que já saiu hoje (publicado também é conteúdo no ar).
    for (const it of cal.itens) {
      if (["programado", "publicado", "publicando"].includes(it.situacao) && porDia[it.data] !== undefined) porDia[it.data]++;
    }
    const vazios = Object.entries(porDia).filter(([, n]) => n === 0).map(([d]) => d);
    const fracos = Object.entries(porDia).filter(([, n]) => n > 0 && n < config.minimoPorDia).map(([d]) => d);
    const falhas = await db.query(
      "SELECT count(*)::int AS n FROM status_execucao WHERE situacao IN ('falhou','incerto') AND iniciado_em > now() - interval '7 days'"
    );
    return { diasSemStatus: vazios, diasFracos: fracos, falhasRecentes: falhas.rows[0].n, janelaDias: config.diasDeAlerta };
  }

  async function historico({ limite = 200, conteudoId = null } = {}) {
    const r = await db.query(
      `SELECT h.*, c.titulo FROM status_auditoria h LEFT JOIN status_conteudo c ON c.id = h.conteudo_id
       WHERE ($1::uuid IS NULL OR h.conteudo_id = $1) ORDER BY h.em DESC LIMIT $2`,
      [conteudoId, Math.min(1000, Math.max(1, Number(limite) || 200))]
    );
    return r.rows.map((h) => ({
      id: h.id,
      em: h.em,
      usuario: h.usuario,
      acao: h.acao,
      titulo: h.titulo,
      conteudoId: h.conteudo_id,
      agendamentoId: h.agendamento_id,
      execucaoId: h.execucao_id,
      detalhes: h.detalhes,
    }));
  }

  // ---------------------------------------------------------------- status dos contatos
  async function registrarRecebido({ id, autor, autorNome, tipo, texto, mime, recebidoEm }) {
    if (!id || !autor) return;
    await db.query(
      `INSERT INTO status_recebido (id, autor, autor_nome, tipo, texto, mime, recebido_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [id, autor, autorNome || null, tipo, texto || "", mime || null, new Date(recebidoEm || Date.now())]
    );
    avisarPainel("status:recebido", { id, autor });
  }

  async function recebidos() {
    const r = await db.query(
      `SELECT * FROM status_recebido WHERE recebido_em > now() - interval '24 hours' ORDER BY recebido_em ASC`
    );
    return r.rows.map((s) => ({
      id: s.id,
      autor: s.autor,
      autorNome: s.autor_nome,
      tipo: s.tipo,
      texto: s.texto,
      mime: s.mime,
      recebidoEm: s.recebido_em,
      vistoEm: s.visto_em,
      midia: s.tipo === "texto" ? null : `/midia/${encodeURIComponent(s.id)}`,
    }));
  }

  async function marcarVisto(ids, quem) {
    const lista = (Array.isArray(ids) ? ids : [ids]).map(String).slice(0, 200);
    if (!lista.length) return;
    await db.query(
      `UPDATE status_recebido SET visto_em=now(), visto_por=$2 WHERE id = ANY($1) AND visto_em IS NULL`,
      [lista, usuarioDe(quem)]
    );
  }

  async function limparRecebidos() {
    await db.query("DELETE FROM status_recebido WHERE recebido_em < now() - interval '48 hours'").catch(() => {});
  }

  return {
    iniciar,
    tick,
    carregarConfig,
    salvarConfig,
    montarTexto,
    salvarConteudo,
    duplicarConteudo,
    excluirConteudo,
    agendar,
    alterarAgendamento,
    publicarAgora,
    tentarNovamente,
    resumo,
    calendario,
    historico,
    registrarRecebido,
    recebidos,
    marcarVisto,
    caminho,
    comSelo,
    get config() {
      return config;
    },
  };
}

module.exports = { criarServicoDeStatus, ErroStatus, usuarioDe, CATEGORIAS, ASSINATURA_PADRAO };
