# Balão da Informática — leia antes de mexer

Repositório do site e da loja **www.balao.info** (Next.js, publicado na Vercel). Dono: Thiago.
Tudo aqui é escrito em português do Brasil, inclusive nomes de variáveis, comentários e commits.

## Antes de dizer que não conhece alguma coisa

Quase tudo o que o Thiago menciona já foi feito em alguma conversa. Procure, nesta ordem:

1. **Projeto "Balao.info" no Claude**, doc `claude/00-LEIA-PRIMEIRO.md`: o mapa de todos os sistemas
   (site, catálogo espelhado, painel, blog, fábrica de conteúdo com o avatar e o Telegram, CRM de WhatsApp,
   URA, Office 3D) e o doc de cada um.
2. **O cérebro**, no computador do Thiago: `C:\TUDO DAS IA - CEREBRO\Obsidian Vault`
   (`11-Claude-Mapa-do-Balao.md` e a pasta `11-Claude\`). É lá que ele quer tudo registrado, para todos os agentes.
3. A pasta `docs/` deste repositório (`docs/blog/`, `docs/painel.md`, …).

Ao terminar um trabalho, **atualize o mapa, o doc do assunto e o cérebro**. O Thiago não aceita explicar de
novo o que já foi feito em outra conversa.

## Regras que valem sempre

- O Thiago não junta ramo no GitHub: publique o que for preciso (PR + merge pelo `gh api`) e mande os links.
  Ele já deu essa autorização várias vezes; se o sistema de permissões barrar, peça o OK na hora.
- Deploy na VPS é ele quem faz. Nunca use nem repita senha, token ou chave.
- Teste de mensagem só entre os dois números dele, nunca para cliente.
- Nada vai para as redes sociais sem o OK dele pelo Telegram (isso é da fábrica de conteúdo, no computador dele).
- Artigo do blog e vídeo com o avatar não falam preço.
- O banco MySQL tem cota de conexões por hora: não rode varreduras nas páginas da loja sem necessidade.

## Onde está o quê

- `app/`, `components/`, `lib/` — o site. `lib/blog/` é o motor do blog; `lib/catalogo/` e `lib/precos/` o catálogo.
- `scripts/blog-publicar.mjs` — único caminho para publicar artigo da rotina (ramo `claude/blog-conteudo`).
- `docs/blog/publicacao-diaria.md` — as três publicações do dia e o vídeo da dica.
- `whatsapp-server/` — o servidor do CRM (roda na VPS, não na Vercel).
- `office3d/` — fonte do Office 3D (`/3d`).
- `/mybots-app` — landing do app MyBots (APK grátis, vídeo e passo a passo). Doc: `docs/mybots-app.md`.
  O endereço `/mybots` é outra coisa: rewrite para o Hub (túnel Cloudflare). Não trocar um pelo outro.
- `/sistema` — **MEU BLING**, o ERP próprio que substitui o Bling. Não mora neste repositório: é só um rewrite em
  `next.config.ts` (`/sistema` → VPS Hostinger, container `meu-bling`). Código no repo privado `balaocastelo-dev/meu-bling`
  (`C:\meu-bling` no PC), deploy por `.\scripts\deploy-vps.ps1`; doc no cérebro `11-Claude\MEU-BLING.md` e no projeto "MEU BLING" do Claude.

## Conferir antes de publicar

`npx tsc --noEmit`, `npx vitest run`, `npx next build`. Mudança de régua do blog precisa estar no ar
**antes** de publicar artigo que dependa dela: o site aplica a régua de novo na hora de mostrar.
