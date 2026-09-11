// ============================================================
// Cópia de segurança do banco, guardada na VPS.
//
// Por que existe: o `/fechamento` perdeu 276 ordens de serviço na migração de
// banco, e só voltou porque existia um backup antigo esquecido numa pasta do
// computador. Não havia rotina nenhuma. Agora há.
//
// Esta máquina fica ligada o dia inteiro e tem 100 GB — é o lugar natural.
// Guarda uma cópia por dia e mantém as últimas, para dar tempo de perceber um
// estrago: apagar um produto por engano e só notar três dias depois é comum, e
// um backup de ontem sozinho não salva disso.
// ============================================================

const fs = require("fs");
const path = require("path");

function criarBackupDoBanco({ pasta, urlDoSite, token, buscar, registrar = console.log }) {
  const destino = path.join(pasta, "backups");
  const pegar = buscar || (typeof fetch === "function" ? fetch : null);

  const estado = {
    ultimoEm: null,
    ultimoTamanhoKb: 0,
    ultimoTotalDeLinhas: 0,
    ultimaTentativaEm: null,
    ultimoErro: null,
    copiasGuardadas: 0,
    rodando: false,
  };

  function listar() {
    try {
      if (!fs.existsSync(destino)) return [];
      return fs
        .readdirSync(destino)
        .filter((n) => /^banco-\d{4}-\d{2}-\d{2}\.json$/.test(n))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  /**
   * Apaga as cópias mais antigas, mantendo as `manter` mais recentes.
   *
   * Sem isso, 100 GB acabam — e a VPS parar por disco cheio derrubaria o
   * WhatsApp junto, que é o que a loja usa para vender.
   */
  function limparAntigas(manter = 14) {
    const arquivos = listar();
    for (const nome of arquivos.slice(manter)) {
      try {
        fs.unlinkSync(path.join(destino, nome));
        registrar(`[backup] Cópia antiga removida: ${nome}`);
      } catch (erro) {
        registrar(`[backup] Não consegui remover ${nome}: ${erro.message}`);
      }
    }
    estado.copiasGuardadas = listar().length;
  }

  async function executar({ motivo = "agendado" } = {}) {
    if (!pegar) {
      estado.ultimoErro = "sem fetch disponível nesta versão do Node";
      return { ok: false, erro: estado.ultimoErro };
    }
    if (!token) {
      estado.ultimoErro = "BACKUP_TOKEN não configurado nesta VPS";
      return { ok: false, erro: estado.ultimoErro };
    }
    if (estado.rodando) return { ok: false, erro: "já está rodando" };

    estado.rodando = true;
    estado.ultimaTentativaEm = Date.now();

    try {
      const base = String(urlDoSite).replace(/\/$/, "");
      const resposta = await pegar(`${base}/api/backup`, {
        headers: { authorization: `Bearer ${token}`, accept: "application/json" },
        // Vinte tabelas levam tempo; melhor esperar do que perder o dia.
        signal: AbortSignal.timeout(120_000),
      });

      if (!resposta.ok) {
        estado.ultimoErro = `site respondeu ${resposta.status}`;
        registrar(`[backup] ${estado.ultimoErro} — cópias anteriores mantidas.`);
        return { ok: false, erro: estado.ultimoErro };
      }

      const dados = await resposta.json();

      // Backup vazio não substitui backup bom. Um arquivo de zero linha,
      // gerado no minuto em que o banco recusou conexão, apagaria a cópia de
      // ontem — justamente a que salvaria o dia.
      if (!dados || !(dados.totalDeLinhas > 0)) {
        estado.ultimoErro = "o site devolveu backup vazio — cópias anteriores mantidas";
        registrar(`[backup] ${estado.ultimoErro}`);
        return { ok: false, erro: estado.ultimoErro, guardadas: listar().length };
      }

      if (!fs.existsSync(destino)) fs.mkdirSync(destino, { recursive: true });

      const dia = String(dados.geradoEm || new Date().toISOString()).slice(0, 10);
      const arquivo = path.join(destino, `banco-${dia}.json`);
      const temporario = `${arquivo}.tmp`;
      const conteudo = JSON.stringify(dados);

      // Grava e renomeia: queda no meio da escrita não deixa um JSON pela
      // metade ocupando o lugar de uma cópia boa.
      fs.writeFileSync(temporario, conteudo);
      fs.renameSync(temporario, arquivo);

      estado.ultimoEm = new Date().toISOString();
      estado.ultimoTamanhoKb = Math.round(Buffer.byteLength(conteudo) / 1024);
      estado.ultimoTotalDeLinhas = dados.totalDeLinhas;
      estado.ultimoErro = null;

      limparAntigas();

      const falhas = Object.keys(dados.falhas || {});
      if (falhas.length) {
        // Sem este aviso, "backup feito" esconderia que uma tabela não vem há
        // semanas — e só se descobre na hora de restaurar.
        registrar(`[backup] ATENÇÃO: tabelas que falharam: ${falhas.join(", ")}`);
      }

      registrar(
        `[backup] Cópia de ${dia} guardada (${motivo}): ${dados.totalDeLinhas} linhas, ` +
          `${estado.ultimoTamanhoKb} KB, ${estado.copiasGuardadas} cópias no disco.`
      );

      return {
        ok: true,
        dia,
        totalDeLinhas: dados.totalDeLinhas,
        tamanhoKb: estado.ultimoTamanhoKb,
        guardadas: estado.copiasGuardadas,
        falhas,
      };
    } catch (erro) {
      estado.ultimoErro = erro.message || String(erro);
      registrar(`[backup] Falhou: ${estado.ultimoErro}`);
      return { ok: false, erro: estado.ultimoErro };
    } finally {
      estado.rodando = false;
    }
  }

  function caminhoDaCopia(nome) {
    const limpo = path.basename(String(nome || ""));
    if (!/^banco-\d{4}-\d{2}-\d{2}\.json$/.test(limpo)) return null;
    return path.join(destino, limpo);
  }

  estado.copiasGuardadas = listar().length;

  return { executar, listar, caminhoDaCopia, estado, pastaDeBackups: destino };
}

module.exports = { criarBackupDoBanco };
