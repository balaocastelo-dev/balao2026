# WhatsApp da loja — fase 1 (outubro de 2026)

O que esta fase resolve, sem trocar o motor (continua a Evolution 2.3.7):

| Problema | O que mudou |
|---|---|
| A loja ficava dias sem receber mensagem (29/09 e 01/10) quando chegava uma mensagem que o Baileys não entende | A Evolution passa a ser a imagem oficial 2.3.7 com **uma linha trocada** no Baileys: o erro numa mensagem não trava mais as outras (é o conserto do Baileys rc10). `whatsapp-server/evolution/` |
| Cada recibo, conversa aberta e varredura lia a tabela inteira de mensagens da Evolution | **Índices** nas consultas quentes (`evo/indices.sql`), criados sem parar a loja, e Postgres com 1 GB e parâmetros de memória |
| A lista de 12 mil conversas era relida a cada 5 minutos | Lista inteira só ao ligar e às 03h30; no resto do dia, só a conversa que mudou (`recarga.js`) |
| Abrir conversa demorava (2 a 4 buscas na Evolution) | O histórico vem do **banco da loja** (`crm_mensagem`), que já tem índice por conversa e data |
| Mensagem perdida na tela depois de queda/sono | Cada mensagem tem um **número de sequência**; o painel pede "tudo depois do número N" ao voltar |
| Reação, edição, mensagem apagada, resposta citada e ligação não apareciam | Aparecem no balão da mensagem; ligação vira uma linha na conversa |
| Ler no celular não zerava as não lidas do CRM | Zera |
| Foto/vídeo enviado pelo celular da loja não era baixado | Mídia é baixada nas duas direções |
| Arquivo enviado pelo painel ia em base64 pelo mesmo canal das mensagens | **Upload direto** com barra de progresso; a Evolution busca o arquivo pela rede interna |
| Áudio só era transcrito quando alguém abria a conversa | O servidor transcreve na chegada (quando um provedor estiver ligado — ver abaixo) |
| Ninguém sabia quanto a mensagem demorava | `/health` mostra a latência (mediana e pior 5%) por caminho: webhook, varredura, histórico |

## Ordem do deploy

1. **Site primeiro**: juntar o PR na Vercel. O painel novo funciona com o servidor atual da VPS (o que ele
   pede de novo e o servidor ainda não sabe, ele simplesmente ignora; o upload cai no caminho antigo).
2. **VPS depois**, no PowerShell, na pasta do projeto (pede a senha de root, que você digita):

   ```powershell
   .\whatsapp-server\deploy-evo.ps1
   ```

   O que acontece, em ordem:
   - mostra a memória da VPS (o compose foi dimensionado para 8 GB; avisa se tiver menos de 4 GB);
   - **constrói** a Evolution remendada. Se o remendo não encaixar, o build falha aqui e nada é trocado;
   - reinicia a Evolution com a mesma sessão (não pede QR);
   - cria os índices **sem travar a escrita** (pode levar alguns minutos numa tabela grande; a loja continua
     recebendo). Se falhar, o deploy segue e o WhatsApp funciona como antes;
   - troca o servidor do painel.

3. **Uma vez só**, copiar o histórico da Evolution para o banco da loja (para o histórico antigo abrir
   rápido também):

   ```powershell
   .\whatsapp-server\deploy-evo.ps1 -Importar
   ```

   É idempotente (rodar de novo não duplica) e só imprime contagens.

## Conferir depois

- `https://srv1963897.hstgr.cloud/health`:
  - `versao.hash` = o commit novo;
  - `diagnostico.latencia.webhook.total.medianaMs` abaixo de 2000 e `p95Ms` abaixo de 4000 depois de algumas
    mensagens (o horário do WhatsApp vem em segundos inteiros, então até 1 s disso é arredondamento);
    `ateEmitir` mostra só o tempo dentro do servidor, que deve ficar em milissegundos;
  - `diagnostico.recarga.completas` crescendo só no boot e de madrugada.
- Mandar uma mensagem do seu celular pessoal para a loja e responder pelo celular da loja: as duas aparecem no
  `/crm` na hora. Reagir com 👍 e editar a mensagem: o painel mostra.
- Raio-X do banco (só leitura, nada de cliente): `.\whatsapp-server\deploy-evo.ps1 -Diagnostico`.

## Transcrição no servidor

Fica desligada até um provedor ser configurado em `/var/lib/balao-evo/segredos.env` (e um novo deploy).
Enquanto isso, o painel transcreve como sempre, pela Vercel.

- `GROQ_API_KEY=...` — a mesma chave que já está na Vercel. Liga na hora.
- `TRANSCRICAO_PUXADA=1` — modo em que um trabalhador no seu computador (RTX 4090, o mesmo faster-whisper da
  URA) busca os áudios e devolve o texto. A conexão sai do computador: não precisa abrir porta. O trabalhador é
  a fase 4.
- `TRANSCRICAO_URL=...` — um servidor de transcrição no formato da OpenAI, se um dia houver um alcançável pela VPS.

## Desfazer

Subir o commit que estava no ar antes (hoje: `9061954`):

```powershell
.\whatsapp-server\deploy-evo.ps1 -Commit 9061954
```

Volta a imagem oficial da Evolution e o servidor anterior. As colunas novas do banco da loja e os índices
ficam (não atrapalham nada). **Não use `-Voltar`**: ele liga o servidor de antes da Evolution
(whatsapp-web.js), com sessão própria e desatualizada.

## Riscos conhecidos

- **A falha de segurança CVE-2026-48063 continua** (mensagem forjável no Baileys anterior ao rc12). Ela só sai
  com o motor novo (fase 3).
- A criação dos índices usa CPU e disco por alguns minutos.
- A primeira subida aplica uma migração no banco da loja (`crm_003_mensagem_completa`) que reescreve a tabela
  `crm_mensagem` uma vez. Durante esse tempo só a parte de estatística espera; a conversa com o cliente segue.

## Testes

- `whatsapp-server`: testes unitários de cada módulo (`node <arquivo>.test.js`), índices e importação contra
  Postgres de verdade (`EVO_TESTE_DB`, `CRM_TESTE_DB`), remendo do Baileys contra o pacote real
  `baileys@7.0.0-rc.9`, e a bancada `e2e/fase1.e2e.mjs` (36 verificações; contra o código anterior, 32 falham).
- Painel: `__tests__/crm/whatsapp-fase1.test.tsx` e a bancada com navegador (`e2e/chat.e2e.mjs`,
  `e2e/cenarios.e2e.mjs`).
