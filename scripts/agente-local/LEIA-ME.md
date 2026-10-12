# JUL.IA no computador da loja

Trabalhador local da vendedora digital do WhatsApp. Roda no PC do Thiago (placa RTX 4090), sem API paga:

| Sentido | Como | Arquivo |
|---|---|---|
| Conversa e decisões | Ollama `qwen3:14b` (o mesmo que a URA deixa na placa no horário da loja) | `cerebro.py` |
| Áudio | faster-whisper `large-v3-turbo` (o da URA, já baixado) | `sentidos.py` |
| Foto | Ollama `qwen2.5vl:7b`, sai da placa depois de responder | `sentidos.py` |
| Vídeo | ffmpeg: áudio para o Whisper e 3 quadros para o modelo de visão | `sentidos.py` |
| Produtos | catálogo do site espelhado pela VPS (nunca o MySQL), sem custo nem fornecedor | `catalogo.py` |
| Orçamento e pedido | Bling v3, lendo o token que a sentinela do Bionic renova (nunca renova daqui) | `bling.py` |
| Placa de vídeo | espera ligação da URA e render da fábrica terminarem | `placa.py` |

Ele **puxa** da VPS as conversas que precisam de resposta (`/api/agente/*`, com o segredo de
`%USERPROFILE%\.balao-agente\segredo.txt`). Não abre porta, não usa túnel.

## Instalar (uma vez)

No PowerShell, na pasta do projeto, depois de `git pull`:

```powershell
.\whatsapp-server\deploy-evo.ps1          # se a VPS ainda não tem o agente
.\whatsapp-server\deploy-evo.ps1 -Agente  # traz o segredo para este PC (senha de root)
.\scripts\agente-local\instalar.ps1       # copia para C:\Users\user\balao-agente, instala o Whisper, cria a tarefa
```

A tarefa `\BalaoFabrica\JUL.IA` liga com o Windows e volta sozinha se cair. Ela só deixa o PC pronto:
**quem liga o atendimento é o Centro de Comando do /crm, aba JUL.IA.**

## Testar sem WhatsApp

```powershell
cd C:\Users\user\balao-agente
.\.venv\Scripts\python.exe julia.py --conferir    # VPS, Ollama, Whisper, ffmpeg, catálogo, Bling (só leitura)
.\.venv\Scripts\python.exe julia.py --conversar   # você é o cliente; Bling simulado; nada sai do PC
```

## As travas (código, não o modelo)

- Só produto do catálogo do site; preço, foto e link saem do catálogo, nunca do modelo.
- Resposta com "R$" que não veio de uma ferramenta (nem do próprio cliente) não sai: uma chance de
  reescrever, depois chama um vendedor.
- Não sai resposta que cite outra loja, custo, fornecedor ou margem, que diga que o pedido foi feito sem
  ter sido, que invente número de pedido ou prometa comprovante/link/reserva.
- Desconto, conserto, assistência e garantia: resposta pronta e um vendedor.
- Venda só com orçamento emitido, "sim" do cliente para aquele orçamento, nome completo, CPF/CNPJ válido,
  forma de pagamento e retirada/entrega. No cartão vale o preço de cartão do site.
- Depois da venda a conversa passa para um vendedor (pagamento e entrega são com gente).
- No modo teste (só os números do Thiago) o Bling é simulado: orçamento e pedido saem como "(teste)".
  Para testar o Bling de verdade, `"bling_no_teste": true` no `config.json`.

## Configuração

`config.json` ao lado do `julia.py` (copiado de `config.exemplo.json`): modelo, modelo de visão,
`bling_vendedor_id` (id do vendedor no Bling para a JUL.IA), `bling_no_teste`, `respeitar_placa`.
Também por variável de ambiente `JULIA_<CHAVE>` (ex.: `JULIA_MODELO=gpt-oss:20b`).

Log: `dados\julia.log` (sem texto de cliente: só a conversa abreviada e o tempo).

## Testes

`python -m unittest discover -s testes` (modelo, Bling e VPS de mentira). A bancada de ponta a ponta,
com o servidor de verdade, está em `whatsapp-server/e2e/agente.e2e.mjs`.
