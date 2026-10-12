# JUL.IA — vendedora digital do WhatsApp (outubro de 2026)

Pedido do Thiago (11/10/2026): um agente que entende texto, foto, vídeo e áudio do cliente, ajuda a
escolher um produto do site, coleta os dados, emite orçamento no Bling e emite a venda quando o cliente
confirma. Liga e desliga no Centro de Comando. Roda local, sem API, crédito ou token pago. Só recomenda
produto do site.

Decisões dele no mesmo dia:
- no automático, ela responde **conversa sem vendedor** (vendedor respondeu ou pegou: ela sai na hora);
- a venda entra **sozinha no Bling, em aberto**, e ele é avisado.

## Como funciona

```
cliente ──WhatsApp──► VPS (servidor.js + agente/)          PC do Thiago (scripts/agente-local)
                       decide se a JUL.IA pode falar  ◄──── puxa /api/agente/trabalho (a cada 2 s)
                       envia ou vira sugestão          ────► Whisper / qwen2.5vl / qwen3:14b
                       avisa painel, ficha, Telegram  ◄──── /api/agente/resultado (+ Bling direto do PC)
```

- **VPS** (`whatsapp-server/agente/`): chave em `crm_config` (`agente`), situação de cada conversa em
  `crm_agente_conversa` (migração `crm_006_agente`), eventos `agente_*` em `crm_evento`, nota na ficha.
  Só conversa individual, cliente falou por último, mensagem com menos de 45 min e depois de ligar,
  8 s de espera para o cliente terminar de digitar, um trabalho por conversa com prazo de 4 min.
  Mensagem nova enquanto o PC pensava: a resposta velha não sai e a conversa volta à fila.
  Envio recusado pelo WhatsApp: tenta de novo em 1 min; na terceira, chama gente.
- **PC** (`scripts/agente-local/`): ver `scripts/agente-local/LEIA-ME.md` (instalação, travas, testes).
- **Painel**: Centro de Comando → **🤖 JUL.IA** (PC no ar, modo Desligada/Copiloto/Automático, "só os
  números de teste", "fechar venda sozinha", números do dia, conversas, sugestões, atividade) e o selo
  **🤖 JUL.IA** no cabeçalho da conversa (atendendo / fora e por quê / pausar / devolver / sugestão do copiloto).
- A JUL.IA aparece como vendedora (`julia-ia`) na atribuição: devolver a conversa para ela = atribuir a ela.

## Ligar, na ordem (PowerShell, de qualquer pasta)

1. Deploy da VPS (pede a senha de root):
   `ssh -t root@179.199.148.87 "git -C /opt/balao2026 fetch origin main --depth=100 && git -C /opt/balao2026 reset --hard origin/main && bash /opt/balao2026/whatsapp-server/deploy-evo.sh"`
   (é o que o `deploy-evo.ps1` faz; ele não depende da cópia do projeto no PC).
2. Projeto no PC: `git -C $HOME\balao2026 pull` (primeira vez: `git clone --depth 1 https://github.com/balaocastelo-dev/balao2026.git $HOME\balao2026`).
3. Só na primeira vez: `& $HOME\balao2026\whatsapp-server\deploy-evo.ps1 -Agente` (segredo para o PC).
4. `& $HOME\balao2026\scripts\agente-local\instalar.ps1` (no fim roda `--conferir` e liga a tarefa).
5. No /crm → Comando → JUL.IA: **Automático** com **"Só os números de teste"** marcado (é o padrão).
   Mandar mensagem do celular pessoal (5519984515960) para a loja. No teste o Bling é simulado.
6. Conferido, desmarcar "Só os números de teste".

Feito no PC da loja em 12/10/2026, 00h19: cópia do projeto em `C:\Users\user\balao2026`, JUL.IA em
`C:\Users\user\balao-agente`, tarefa `\BalaoFabrica\JUL.IA` rodando, conferência toda OK.

Desligar: botão **Desligada** no mesmo lugar (vale na hora). PC desligado = ninguém é respondido pela
JUL.IA; os vendedores atendem como sempre.

## Conferido em 11/10/2026

- VPS: `agente/agente.test.js` 16/16 (com Postgres); bancada `e2e/agente.e2e.mjs` 30/30 com o servidor e o
  trabalhador Python de verdade (Ollama de mentira): modo teste, foto, orçamento, venda, vendedor pelo
  celular, copiloto, preço inventado barrado, desligar. `e2e/fase1` 36/36 e `e2e/disparo` 33/33 seguem passando.
- PC: `testes/test_julia.py` 35/35.
- **Com o modelo de verdade** (qwen3:14b no PC da loja, catálogo de 4.854 produtos, Bling simulado):
  "pc gamer com rtx 4060?" → 3 opções com RTX 4060 (6 s) → "quero o mais barato" → orçamento → "pode fechar,
  cartão 10x, retiro, nome e CPF" → pedido com o preço de cartão e conversa passada a um vendedor.
  Desconto e conserto foram para um vendedor. As travas foram feitas a partir do que o modelo errou nesses
  testes (lista com link inventado, pedido "registrado" sem registrar, preço do orçamento do cliente etc.).
- Painel: componentes testados (vitest) e vistos num navegador de verdade.

## O que ainda não foi exercitado

- **Gravação no Bling de verdade** (proposta e pedido): os campos seguem a API v3 e pedidos reais lidos da
  conta, mas a primeira gravação real só acontece no público "clientes" (ou com `bling_no_teste`). Se o
  Bling recusar, a JUL.IA avisa no painel, passa a conversa a um vendedor e o erro do Bling aparece na nota.
- A JUL.IA ainda não é vendedora no Bling: `bling_vendedor_id` vazio (já existe uma JULIA SOUZA humana).
