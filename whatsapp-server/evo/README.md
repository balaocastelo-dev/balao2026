# WhatsApp da loja sobre a Evolution API

`servidor.js` (raiz de `whatsapp-server/`) substitui o `server.js` antigo
(whatsapp-web.js + Chromium). Quem fala com o WhatsApp é a
[Evolution API](https://github.com/evolution-foundation/evolution-api) v2.3.7,
num container ao lado, sem porta pública.

| Arquivo | Para quê |
| --- | --- |
| `evo/evolution.js` | cliente REST da Evolution |
| `evo/acesso.js` | confere o ingresso (ticket) emitido pelo site |
| `evo/normalizar.js` | Evolution/Baileys → formato do painel (@lid → número) |
| `evo/normalizar.test.js` | testes (`node evo/normalizar.test.js`) |
| `evo/amostras/` | foto, vídeo, áudio falado e PDF do teste cruzado |
| `docker-compose.evo.yml` | Evolution + Postgres + Redis + servidor |
| `deploy-evo.sh` / `deploy-evo.ps1` | instala, atualiza e volta atrás |

## Segurança

- Socket e rotas de envio exigem o ingresso de `/api/painel/socket-ticket`
  (só sai para quem entrou no `/crm` ou na página do vendedor). A VPS
  confere em `/api/painel/socket-ticket/verificar`; o segredo fica só na
  Vercel (derivado de `PAINEL_PASSWORD`).
- O webhook da Evolution traz um segredo gerado na VPS (`webhook.segredo`).
- `/status` público só diz se está no ar. QR Code só para admin.

## Transcrição de áudio

`/api/crm/transcrever` (site) baixa o áudio da VPS e manda para o Whisper
da Groq (`whisper-large-v3-turbo`, `GROQ_API_KEY`). O painel transcreve
sozinho o áudio recebido na conversa aberta; o texto fica guardado na VPS.

## Teste cruzado

`www.balao.info/api/crm/teste-cruzado` (logado no painel): conecta uma
segunda linha ("fora") e manda texto, foto, foto por link, vídeo, voz, PDF
e um produto do catálogo; confere a chegada e se a mídia baixa, faz o
caminho de volta e transcreve o áudio recebido.

## Módulo de Status (`whatsapp-server/status/`)

| Arquivo | Para quê |
| --- | --- |
| `status/db.js` | banco próprio `balao` no Postgres do compose, migrações idempotentes |
| `status/recorrencia.js` | regras (única, diária, dias úteis, semanal; início/fim) no fuso de SP |
| `status/servico.js` | conteúdos, agendamentos, publicação, agendador, auditoria, biblioteca, calendário, status recebidos |
| `status/rotas.js` | `/api/status/*` (com ingresso) e `/interno/status/*` (a Evolution baixa a mídia daqui) |
| `status/*.test.js` | `node status/recorrencia.test.js` e, com Postgres, `STATUS_DB_TESTE=… node status/servico.test.js` |

- Sem publicação duplicada: cada ocorrência tem chave única
  (`agenda:<agendamento>:<horário>`); o agendador só publica o que conseguiu
  inserir. Reinício no meio da publicação vira "incerto" e nunca é repetido
  sozinho — só com "Tentar novamente".
- Ocorrência atrasada além da tolerância (padrão 30 min) vira "perdido".
- Ver status dos contatos exige `readStatus` ligado na Evolution
  (`STATUS_LER_CONTATOS=0` desliga): todo status recebido é marcado como visto.
- Painel: `components/crm/status/` (Central, Editor, Calendário, Visualizador).
