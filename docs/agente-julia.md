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

## Velocidade e horário de pico (12/10/2026)

No primeiro teste do Thiago cada resposta levou de 18 a 86 s. Medido no PC:

| | Antes | Depois |
|---|---|---|
| Idas ao modelo por resposta | 3 a 5 | 1 (2 quando escolhe outros produtos) |
| Resposta com a placa livre | 8 a 17 s | 1,3 a 4 s |
| Duas conversas ao mesmo tempo | uma esperava a outra | as duas em ~4 a 6 s |
| Recarga do modelo | 4 a 8 s a cada troca URA/fábrica/JUL.IA | só quando o Ollama reabre |

O que mudou:
- **Ollama no PC** (variáveis do usuário, valem ao reabrir o Ollama): `OLLAMA_CONTEXT_LENGTH=8192` (o mesmo da
  JUL.IA e das rotinas da fábrica; a URA não pede contexto e usa o padrão) e `OLLAMA_NUM_PARALLEL=3` (3 conversas
  juntas no Ollama; a JUL.IA usa 2 e deixa 1 sempre livre para a URA). Para desfazer: apagar as duas variáveis e
  reabrir o Ollama (o `paralelo` da JUL.IA cai sozinho para 1).
- **JUL.IA**: o primeiro pedido de produto já vai com a busca feita pelo código; o modelo responde em 1 frase + 1
  pergunta (os cartões mostram foto, preço e link); resposta comprida é encurtada pelo código; histórico só da
  conversa de agora; saída limitada; prazo de 70 s (passou: manda os produtos já escolhidos ou chama um vendedor).
- **VPS**: "digitando…" para o cliente do pegar da conversa até a resposta; espera de 6 s (era 8) para o cliente
  terminar de digitar; erro do PC volta a conversa para a fila em 20 s e, no segundo erro, chama um vendedor
  avisando o cliente.
- **Áudio**: não estava sendo transcrito (o PyAV novo recusava a chamada do faster-whisper); agora vai pelo ffmpeg.

**O que ainda deixa lento:** a placa de vídeo e a memória do PC divididas com outros trabalhos. Com o ComfyUI
gerando imagem (FLUX Kontext, ~12 GB) junto com a JUL.IA, a mesma leitura que leva 1 s levou de 13 a 85 s, e o
Ollama chegou a levar 18 a 47 s só para guardar a conversa na memória do PC. Render de imagem/vídeo no horário da
loja deixa a JUL.IA e a URA lentas.

No pico: cada resposta ocupa o modelo por 1 a 4 s; com 2 ao mesmo tempo dá umas 30 respostas por minuto, o que
atende dezenas de conversas abertas (cada cliente escreve a cada minuto ou dois). Quem chega na fila vê
"digitando…" e é atendido por ordem de chegada.

## Prioridade na placa de vídeo (12/10/2026)

Decisão do Thiago: **a JUL.IA vem primeiro** (atende dezenas de vezes mais que a URA). Às 5h30 ela não conseguiu
responder: um render de vídeo do avatar ocupava 19 GB da placa e o qwen3 nem carregava.

- A JUL.IA não espera mais nada (nem ligação da URA, nem render). `respeitar_placa` no `config.json` volta ao
  jeito antigo, se um dia precisar.
- Ao pegar uma conversa, grava `C:\Users\user\balao-agente\dados\placa-julia.txt` (até quando precisa da placa:
  agora + 10 min). A fábrica lê esse sinal junto com o da URA, nas funções `ligacoes()` de `avatar/fila_avatar.py`,
  `avatar/vigiar.py`, `publisher/capa_blog.py` e `publisher/crescimento.py`: render não começa e, se estiver no
  meio, derruba o ComfyUI na hora e tenta de novo depois (cópias dos originais com `.bak-…-antes-julia-prioridade`).
- Com o modelo fora da placa (a fábrica o descarrega para renderizar), a JUL.IA espera até 30 s a memória liberar
  antes de chamar o modelo, para ele carregar inteiro na placa.
- A URA continua com uma vaga própria no Ollama e ninguém derruba ligação.
- Scripts de imagem rodados à mão (kontext_corpo, plano_aberto, corpo_inteiro) não leem o sinal: rodar fora do
  horário da loja. O `--conferir` diz se algum script da fábrica deixou de ceder.

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
