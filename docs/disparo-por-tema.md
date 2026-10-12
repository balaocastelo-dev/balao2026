# Disparo por tema de conversa

Mensagem em massa no WhatsApp para quem já conversou com a loja sobre um
assunto (notebook, PC gamer, impressora…). Fica na aba **Disparo** do
atendimento (`/crm` e páginas dos vendedores).

> **Depende do deploy da VPS.** A tela nova chama rotas que só existem no
> `whatsapp-server` atualizado. Sem o deploy, a aba mostra "O servidor da loja
> ainda não recebeu esta atualização". O deploy é o Thiago quem faz
> (`whatsapp-server/deploy-evo.sh`); a migração `crm_005_campanha` roda sozinha
> quando o servidor sobe.

## Como usar

1. Escolha um ou mais **temas** (cada chip mostra quantos clientes têm aquele
   assunto). Temas valem com "ou": Notebook + PC Gamer = quem falou de um OU
   do outro.
2. Se quiser, escolha **etiquetas** (as da loja e as postas na tela de
   atendimento). Etiquetas também valem com "ou" entre si, mas junto com o
   tema o cliente precisa ter as duas coisas.
3. Escolha o período: **conversou com a loja nos últimos** 30 dias a 2 anos
   (padrão 1 ano). Conta só mensagem que o *cliente* mandou.
4. Escreva o texto. `{nome}` vira o primeiro nome do cliente ("JOÃO PEDRO" →
   "João"); sem nome, sai do texto sem deixar buraco ("Olá, {nome}!" → "Olá!").
   `{whatsapp}` vira `https://wa.me/5519987510267`. A linha
   "Para não receber mais, responda SAIR." entra sozinha no fim. Qualquer
   outra variável (ex.: `{promocao}`) é recusada.
5. **Ver prévia**: total, os 10 primeiros e como a mensagem chega.
6. **Enviar teste para meus números**: manda o texto, na hora, só para
   5519987510267 e 5519984515960. Nenhum outro número é aceito (fixo no código).
7. **Iniciar campanha**: pede confirmação com o total e quantos dias de envio
   leva no teto diário. A lista é tirada do banco nesse momento e fica gravada.
8. Acompanhe na lista de campanhas (barra de progresso, pausar, retomar,
   cancelar). O fim também aparece como aviso no painel.

## Travas (todas no servidor, não na tela)

- **Horário**: segunda a sábado, das 9h às 18h, no fuso de São Paulo
  (calculado pelo `Intl`, não pelo relógio do container).
- **Teto**: 100 envios por dia, somando todas as campanhas. Muda em
  `crm_config`, chave `disparo`, valor `{"tetoDiario": N}` (de 1 a 500).
- **Ritmo**: uma mensagem por vez, de 40 a 120 s (aleatório) entre uma e outra.
  Vale mesmo com dois processos de pé durante uma troca de container (trava no
  Postgres).
- **Quem nunca recebe**: grupo, lista de transmissão e canal; quem pediu SAIR
  (`crm_contato.optout`, último registro de `crm_consentimento` e
  `store.optout`); bloqueado; quem nunca escreveu para a loja; quem recebeu
  qualquer campanha nos últimos 7 dias. A mesma pessoa com duas conversas
  (@lid e número) recebe uma vez só.
- **Antes de cada envio** o SAIR e o "recebeu campanha recente" são
  conferidos de novo: quem pede SAIR no meio da campanha é pulado.
- **Reinício**: o estado está no banco; o laço continua de onde parou. Envio que
  ficou no meio (o processo caiu entre mandar e gravar) **não é repetido** —
  depois de 5 minutos vira falha com o motivo "envio interrompido".
- WhatsApp desconectado: o laço espera, e o envio que falhou por queda volta
  para a fila sem contar como falha.
- Cada envio, pulo ou falha fica em `crm_evento` (tipo `campanha_envio`); o
  teste fica como `campanha_teste`.

## Onde está cada coisa

| | |
|---|---|
| `whatsapp-server/crm/campanha.js` | seleção por SQL, campanhas e o laço de envio |
| `whatsapp-server/crm/campanha-regras.js` | horário de SP, intervalo, texto ({nome}, {whatsapp}, SAIR) |
| `whatsapp-server/crm/campanha-rotas.js` | rotas `/api/comando/campanhas*` (admin ou vendedor logado) |
| `whatsapp-server/crm/db.js` | migração `crm_005_campanha` (`crm_campanha`, `crm_campanha_envio`) |
| `whatsapp-server/servidor.js` | liga o laço junto com o CRM (`ligarDisparoPorTema`) e liga SAIR/bloqueio/etiquetas do `store` |
| `components/crm/disparo/DisparoPorTema.tsx` | a aba Disparo |

Rotas: `POST /campanhas/previa`, `POST /campanhas`, `GET /campanhas`,
`POST /campanhas/:id/pausar|retomar|cancelar`, `POST /campanhas/teste`.
O painel recebe o progresso pelo socket (`whatsapp:campanha`).

O evento antigo `panel:send-segmented` (tela velha em cache) não manda mais
nada sozinho: vira uma campanha "Disparo do painel antigo" com as mesmas
travas.

## Testes

```bash
cd whatsapp-server
node --test crm/campanha-regras.test.js                       # horário, intervalo, texto
CAMPANHA_TESTE_DB=postgres://…/disparo_teste node --test crm/campanha.test.js
DISPARO_TESTE_DB=postgres://…/disparo_e2e node e2e/disparo.e2e.mjs   # servidor real + Evolution falsa
npx vitest run __tests__/crm/disparo-por-tema.test.tsx       # a tela (na raiz)
```

Os bancos indicados têm as tabelas `crm_*` apagadas. A bancada usa
`DISPARO_INTERVALO_MS` e `DISPARO_JANELA_SEMPRE_ABERTA=1` para não esperar
40 s nem o horário comercial — **nunca** ligue essas variáveis na loja (o
servidor avisa no log quando elas estão ligadas).
