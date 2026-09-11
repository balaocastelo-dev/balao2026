# Cópia de segurança do banco

## Por que isto existe

O `/fechamento` perdeu **276 ordens de serviço e 24 despesas** — R$ 154.851,78
de histórico — numa migração de banco. Só foi possível recuperar porque havia um
backup antigo esquecido numa pasta do computador. **Não havia rotina nenhuma.**
Da próxima vez podia não ter.

## Como funciona

A VPS busca o banco inteiro uma vez por dia, às **3h da manhã** (loja fechada,
site parado), e guarda em `/var/lib/balao-whats/backups/banco-AAAA-MM-DD.json`.

Mantém as **14 cópias mais recentes**. Não é excesso: apagar um produto por
engano e só notar três dias depois é comum, e uma cópia só já teria o erro
dentro dela.

O que é copiado é o **dado**, em JSON — não a estrutura das tabelas. É o que
importa para recuperar, é legível daqui a anos, e não depende da versão do MySQL
nem de ferramenta nenhuma para abrir.

## Configuração (uma vez só)

Precisa de um segredo compartilhado entre o site e a VPS.

**1. Na VPS**, crie o arquivo com um segredo longo:

```bash
echo 'BACKUP_TOKEN=troque-isto-por-algo-bem-longo-e-aleatorio' > /etc/balao.env
```

O arquivo fica **fora do repositório** de propósito: o repositório é público, e
este token dá acesso a faturamento, despesas, salários e contatos de cliente.

**2. Na Vercel**, defina a mesma variável `BACKUP_TOKEN` nas configurações do
projeto.

**3. Rode o deploy** da VPS. O script lê `/etc/balao.env` sozinho.

> Sem o token definido, a porta da máquina fica **fechada** e o backup
> automático não roda. É de propósito: melhor não ter backup do que ter o
> faturamento da loja acessível por descuido de configuração.

## Baixar uma cópia para o seu computador

No `/crm`, botão **"Baixar backup"**. Serve para quando você quiser levar uma
cópia embora — antes de uma importação grande, por exemplo.

## Conferir se está rodando

```bash
curl -s https://srv1963897.hstgr.cloud/api/crm/backups
```

Mostra as cópias guardadas, quando foi a última e o tamanho. Se `ultimoErro`
estiver preenchido, é ali que está a explicação.

Para forçar uma cópia agora, sem esperar as 3h:

```bash
curl -s https://srv1963897.hstgr.cloud/api/crm/backups/agora
```

## Cuidados que o código já toma

**Backup vazio nunca substitui um bom.** Um arquivo de zero linha, gerado no
minuto em que o banco recusou conexão, apagaria a cópia de ontem — justamente a
que salvaria o dia. Tem teste para isso.

**Grava e renomeia.** Queda no meio da escrita não deixa um JSON pela metade
ocupando o lugar de uma cópia boa.

**Tabela que falha não derruba o backup.** Ela entra em `falhas` e o resto
segue — mas o aviso aparece no log, senão uma tabela que não vem há semanas só
seria descoberta na hora de restaurar.

## Restaurar

Hoje existe restauração pronta apenas para o `/fechamento` (tela própria, com
botão). Para as demais tabelas, o arquivo é JSON legível e a importação é
manual — se precisar, é melhor fazer com acompanhamento do que ter um botão
"restaurar tudo" que ninguém testou e que pode apagar o que está certo.
