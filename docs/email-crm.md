# E-mail de produtos pelo CRM

O vendedor manda produto, preço e link do site por e-mail, direto da conversa no `/painel/crm`.
Complementa o WhatsApp: serve para a empresa que precisa de orçamento formal para aprovar, para o cliente que
pede "me manda por e-mail" e para deixar um registro com foto, preço e link.

## Como usa

1. No catálogo à direita, **📧 Pôr no e-mail** em cada produto que vai junto (ou busque dentro da janela).
2. Na conversa, **📧 E-mail**. O campo "Para" vem preenchido com o e-mail guardado na ficha do cliente ou com o
   que ele digitou na conversa.
3. Ajuste quantidade e, se quiser, um **preço especial à vista** (o site recusa abaixo do custo). Escreva a
   mensagem, inclua um link do site se fizer sentido, veja a **prévia** e envie.

## O que acontece

- O e-mail sai pelo **Gmail da loja (balaocastelo@gmail.com)**, com o nome do vendedor, quando há um; a resposta
  do cliente vai para **balaocastelo@gmail.com** e a loja recebe uma **cópia oculta**.
- Nome, foto, preço à vista, preço no cartão, parcelamento e link vêm do site, não do navegador.
- Os botões passam por `/api/crm/email/clique`: o clique é registrado e o painel avisa
  "📧 Fulano abriu … do e-mail agora". Cliques nos primeiros 45 segundos não avisam (são os leitores de e-mail
  conferindo o link sozinhos). O destino vai assinado no link: a rota não leva para fora do site.
- Na ficha do cliente ficam o e-mail dele e uma nota com o que foi enviado. Envios e cliques ficam em
  `crm_evento` (`email_enviado`, `email_clique`).

## Peças

| Onde | O quê |
|---|---|
| `lib/crm/email-produtos.ts` | monta o e-mail (HTML e texto), regra de preço, link rastreado |
| `lib/crm/email-validacao.ts` | conferir e-mail, achar e-mail na conversa, aceitar só link do site (roda no navegador) |
| `app/api/crm/email/enviar` | prévia e envio (exige sessão do painel ou de vendedor) |
| `app/api/crm/email/clique` | registra o clique e redireciona |
| `components/crm/email/EnviarPorEmail.tsx` | a janela no painel |
| `whatsapp-server/crm/` | e-mail na ficha (`crm_004_email_do_cliente`), nota e eventos; rotas `/api/comando/contatos/:chatId/email`, `.../email-enviado` e `/api/comando/email-clique` |

## Provedor de e-mail (desde 27/10/2026: sem Resend)

A Resend recusava o envio ("The balao.info domain is not verified"), então saiu do caminho. `lib/mail.ts` tenta,
nesta ordem:

1. **Gmail da loja por SMTP** — só precisa de `SMTP_PASS` na Vercel: uma *senha de app* do Google, criada em
   https://myaccount.google.com/apppasswords na conta balaocastelo@gmail.com (exige verificação em duas etapas).
   Limite do Gmail: ~500 e-mails por dia.
2. **Brevo** (API) — se `BREVO_API_KEY` existir. O remetente (`BREVO_FROM`) precisa estar validado na Brevo.

Sem nenhum dos dois, o envio falha dizendo exatamente o que falta e onde criar.

## Variáveis (Vercel)

- `SMTP_PASS` — senha de app do Gmail (obrigatória para o Gmail).
- `SMTP_USER` — opcional; vazio = `balaocastelo@gmail.com`. `SMTP_HOST`/`SMTP_PORT` para outro servidor (padrão Gmail, 465).
- `BREVO_API_KEY` / `BREVO_FROM` — opcionais, alternativa ao Gmail.
- `EMAIL_RESPOSTA` — opcional; padrão `balaocastelo@gmail.com`.
- `EMAIL_COPIA_LOJA` — opcional; padrão `balaocastelo@gmail.com`; `0` desliga a cópia.

## Depende do deploy da VPS

O envio funciona assim que o site sobe. Guardar o e-mail na ficha, a nota e o aviso de clique precisam do
servidor novo na VPS (o mesmo deploy da fase 1 do WhatsApp, `docs/whatsapp-fase1.md`). Antes disso, o painel
avisa que o registro na ficha ficou para depois.

## Testes

`__tests__/crm/email-produtos.test.ts`, `__tests__/crm/email-enviar.test.ts` e o caso de e-mail em
`whatsapp-server/crm/servico.test.js`. Conferido também num navegador de verdade, com um servidor SMTP local:
remetente, resposta, cópia, prévia, nota na ficha, clique rastreado com aviso no painel e link adulterado indo
para a página inicial.
