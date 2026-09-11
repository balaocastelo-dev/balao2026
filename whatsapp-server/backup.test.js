// Teste da cópia de segurança do banco.
//
// O caso real: o /fechamento perdeu 276 ordens de serviço na migração de banco
// e só voltou porque existia um backup esquecido numa pasta. Não havia rotina.
//
// O erro que tornaria esta rotina inútil é o mesmo do espelho: substituir a
// cópia boa por uma vazia no minuto em que o banco recusou conexão — ou seja,
// perder o backup exatamente quando ele seria necessário.
//
//   node backup.test.js
//
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");
const { criarBackupDoBanco } = require("./backup");

let falhas = 0;
async function teste(nome, fn) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "balao-backup-"));
  try {
    await fn(pasta);
    console.log(`  [ok] ${nome}`);
  } catch (e) {
    falhas++;
    console.log(`  [FALHOU] ${nome}\n         ${e.message}`);
  } finally {
    fs.rmSync(pasta, { recursive: true, force: true });
  }
}

function backupDe(dia, linhas = 300, extra = {}) {
  return {
    geradoEm: `${dia}T03:00:00.000Z`,
    totalDeLinhas: linhas,
    contagem: { weekly_orders: 276, products: 24 },
    falhas: {},
    tabelas: { weekly_orders: [{ id: "1" }], products: [{ id: "p1" }] },
    ...extra,
  };
}

const responder = (corpo, status = 200) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => corpo,
});

function criar(pasta, corpo, opcoes = {}) {
  return criarBackupDoBanco({
    pasta,
    urlDoSite: "https://www.balao.info",
    token: "segredo",
    buscar: typeof corpo === "function" ? corpo : responder(corpo),
    registrar() {},
    ...opcoes,
  });
}

(async () => {
  console.log("\ncópia de segurança do banco");

  await teste("guarda a cópia do dia", async (pasta) => {
    const b = criar(pasta, backupDe("2026-09-11"));
    const r = await b.executar();
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.totalDeLinhas, 300);
    assert.deepStrictEqual(b.listar(), ["banco-2026-09-11.json"]);
  });

  await teste("backup VAZIO não apaga a cópia boa", async (pasta) => {
    // O caso que justifica a rotina inteira: com o banco recusando conexão, o
    // site devolve zero linha. Gravar isso por cima apagaria a única cópia que
    // resolveria o problema.
    const bom = criar(pasta, backupDe("2026-09-11"));
    await bom.executar();

    const vazio = criar(pasta, backupDe("2026-09-12", 0));
    const r = await vazio.executar();

    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(vazio.listar(), ["banco-2026-09-11.json"], "a cópia boa sumiu");
  });

  await teste("site fora do ar mantém as cópias", async (pasta) => {
    const bom = criar(pasta, backupDe("2026-09-11"));
    await bom.executar();

    const semRede = criar(pasta, async () => {
      throw new Error("ECONNRESET");
    });
    const r = await semRede.executar();

    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(semRede.listar(), ["banco-2026-09-11.json"]);
  });

  await teste("sem token, nem tenta", async (pasta) => {
    // Token ausente é erro de configuração, não motivo para bater no site.
    let chamou = false;
    const b = criarBackupDoBanco({
      pasta,
      urlDoSite: "https://www.balao.info",
      token: "",
      buscar: async () => {
        chamou = true;
        return responder(backupDe("2026-09-11"))();
      },
      registrar() {},
    });
    const r = await b.executar();
    assert.strictEqual(r.ok, false);
    assert.strictEqual(chamou, false, "bateu no site sem token");
    assert.ok(String(r.erro).includes("BACKUP_TOKEN"));
  });

  await teste("mantém 14 cópias e apaga as mais velhas", async (pasta) => {
    // Uma cópia por dia sem limpeza enche o disco — e a VPS parar por disco
    // cheio derrubaria o WhatsApp junto, que é o que a loja usa para vender.
    for (let d = 1; d <= 20; d++) {
      const dia = `2026-09-${String(d).padStart(2, "0")}`;
      await criar(pasta, backupDe(dia)).executar();
    }
    const guardadas = criar(pasta, backupDe("2026-10-01")).listar();
    assert.strictEqual(guardadas.length, 14, `guardou ${guardadas.length}`);
    // As mais recentes é que ficam.
    assert.strictEqual(guardadas[0], "banco-2026-09-20.json");
    assert.strictEqual(guardadas[13], "banco-2026-09-07.json");
  });

  await teste("guarda mais de um dia, não só o último", async (pasta) => {
    // Apagar um produto por engano e só notar três dias depois é comum. Com
    // uma cópia só, o erro já estaria dentro dela.
    await criar(pasta, backupDe("2026-09-10")).executar();
    await criar(pasta, backupDe("2026-09-11")).executar();
    const b = criar(pasta, backupDe("2026-09-12"));
    await b.executar();
    assert.strictEqual(b.listar().length, 3);
  });

  await teste("o mesmo dia duas vezes não duplica arquivo", async (pasta) => {
    const b = criar(pasta, backupDe("2026-09-11"));
    await b.executar();
    await b.executar();
    assert.strictEqual(b.listar().length, 1);
  });

  await teste("nome de arquivo vindo de fora não escapa da pasta", async (pasta) => {
    const b = criar(pasta, backupDe("2026-09-11"));
    assert.strictEqual(b.caminhoDaCopia("../../etc/passwd"), null);
    assert.strictEqual(b.caminhoDaCopia("qualquer.json"), null);
    assert.ok(b.caminhoDaCopia("banco-2026-09-11.json"));
  });

  console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
  process.exit(falhas ? 1 : 0);
})();
