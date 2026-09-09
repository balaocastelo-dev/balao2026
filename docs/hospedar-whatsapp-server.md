# Onde hospedar o servidor de WhatsApp

## A resposta curta

**No Render não é grátis.** O plano gratuito dele não serve para este caso — e
não é questão de "dar um jeitinho", é limitação técnica:

| Limite do plano free | Efeito aqui |
| --- | --- |
| Hiberna após ~15 min sem acesso | O WhatsApp desconecta junto |
| Sem disco persistente | A sessão se perde: **QR Code novo a cada reinício** |
| 512 MB de RAM | Não segura o Chrome que o whatsapp-web.js precisa abrir |

**A opção realmente gratuita é rodar no computador da loja.** É também a que
melhor se encaixa no seu caso: o número é da loja, os vendedores estão na loja,
e o PC já fica ligado no horário comercial. O código já foi escrito pensando
nisso — ele procura o Chrome do Windows automaticamente.

---

## Por que este servidor é "pesado"

Entender isso explica todas as opções abaixo. O `whatsapp-server` não é uma API
comum: ele **abre um Chrome de verdade** e controla o WhatsApp Web dentro dele.

- Precisa ficar **ligado o tempo todo** — se dormir, desconecta.
- Consome **500 MB a 1 GB de RAM** (o Chrome).
- Precisa **guardar a sessão em disco** (`.wwebjs_auth`), senão pede QR sempre.
- Precisa de **HTTPS**, porque o site é HTTPS e o navegador bloqueia conexão de
  página segura para servidor inseguro.

Qualquer hospedagem que não atenda os quatro pontos vai dar dor de cabeça.

---

## Opção A — PC da loja + Cloudflare Tunnel · **R$ 0** ✅ recomendada

O servidor roda no computador da loja. O Cloudflare Tunnel (gratuito) publica
ele na internet com HTTPS, **sem** abrir porta no roteador e **sem** precisar de
IP fixo.

### Pré-requisito

O domínio `balao.info` precisa estar com o DNS na Cloudflare (a conta e o plano
de DNS são gratuitos). Se ainda não estiver, é uma troca de nameservers no
registrador do domínio.

### Passo 1 — Rodar o servidor no PC

Uma vez só, no PC da loja:

```bash
cd whatsapp-server
npm install
```

Depois, para ligar, use o atalho `iniciar-servidor.bat` (está nessa pasta) ou:

```bash
npm start
```

Se aparecer `[whatsapp] QR Code gerado`, está funcionando.

### Passo 2 — Instalar o Cloudflare Tunnel

Baixe o `cloudflared` para Windows no site da Cloudflare e, no Prompt de
Comando:

```bash
cloudflared tunnel login
```

Abre o navegador para você autorizar o domínio. Depois:

```bash
cloudflared tunnel create balao-whats
```

```bash
cloudflared tunnel route dns balao-whats whats.balao.info
```

### Passo 3 — Apontar o túnel para o servidor

Crie o arquivo `C:\Users\<seu-usuario>\.cloudflared\config.yml`:

```yaml
tunnel: balao-whats
credentials-file: C:\Users\<seu-usuario>\.cloudflared\<id-do-tunel>.json

ingress:
  - hostname: whats.balao.info
    service: http://localhost:4100
  - service: http_status:404
```

O `<id-do-tunel>` aparece na saída do `tunnel create`.

### Passo 4 — Deixar tudo subindo sozinho

Para o túnel virar serviço do Windows (sobe junto com o PC):

```bash
cloudflared service install
```

Para o servidor de WhatsApp subir junto, coloque um atalho do
`iniciar-servidor.bat` na pasta de inicialização: tecle `Win+R`, digite
`shell:startup` e arraste o atalho para lá.

### Passo 5 — Configurar o site

Na Vercel (ou onde o site estiver publicado), defina:

```
NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL=https://whats.balao.info
```

E no PC da loja, no arquivo `.env` da pasta `whatsapp-server`:

```
WHATSAPP_PANEL_PORT=4100
WHATSAPP_PANEL_ALLOWED_ORIGIN=https://www.balao.info,https://balao.info
```

Publique o site de novo e abra `/crm` para ler o QR Code.

### O que pesar antes de escolher

- ✅ Custo zero, sem cartão, sem mensalidade.
- ✅ O Chrome do Windows já está lá — nada para configurar.
- ✅ Você tem acesso físico se travar.
- ⚠️ **Se o PC desligar, o atendimento cai.** Vale ligar em um nobreak — vocês
  vendem isso.
- ⚠️ Windows Update reinicia o PC sozinho. Configure o horário de reinício para
  a madrugada.

---

## Opção B — Render · cerca de **US$ 7/mês**

O `render.yaml` do projeto já está pronto para isso (plano `starter` + disco de
2 GB). Confira o preço atual no site da Render antes de decidir.

1. Suba o repositório no GitHub.
2. No Render: **New → Blueprint** e aponte para o repositório. Ele lê o
   `render.yaml` sozinho.
3. Defina a variável `WHATSAPP_PANEL_ALLOWED_ORIGIN` como
   `https://www.balao.info,https://balao.info`.
4. Copie a URL pública do serviço e coloque em
   `NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL` no site.
5. Publique o site e leia o QR Code em `/crm`.

- ✅ Liga sozinho, HTTPS pronto, não depende do PC da loja.
- ✅ O disco persistente mantém a sessão entre reinícios.
- ⚠️ Custo mensal recorrente em dólar.

---

## Opção C — VPS ✅ escolhida

Precisa ser **VPS**, não hospedagem compartilhada — compartilhada não roda Node
continuamente. Na Hostinger, o plano **KVM 2** (2 vCPU, 8 GB, 100 GB) é o ponto
certo: o Chrome do whatsapp-web.js fica ativo o tempo todo e 1 vCPU engasga.

No sistema, escolha **Ubuntu 24.04 LTS limpo** — sem painel de controle
(CyberPanel, Plesk, cPanel). Painel come 1-2 GB de RAM que você quer para o
Chrome.

### Passo 1 — Subir o servidor

## Atualizar o servidor sem entrar na VPS

O `deploy-vps.sh` mora **dentro** da VPS. Rodá-lo no PowerShell do PC
responde `No such file or directory` — o caminho não existe lá. Já aconteceu
duas vezes.

Do PC, na pasta do projeto:

```powershell
.\whatsapp-server\deploy-daqui.ps1
```

Ele conecta, roda o deploy, espera o WhatsApp conectar e mostra a versão que
ficou no ar. Pede a senha de root da VPS, que não fica gravada no repositório.

Como saber onde você está: prompt começando com `PS C:\` é o Windows;
começando com `root@srv...` é a VPS.

Conecte no servidor (`ssh root@SEU-IP`, ou pelo **Web console** do painel da
Hostinger, que abre no navegador) e rode:

```bash
curl -fsSL https://raw.githubusercontent.com/balaocastelo-dev/balao2026/main/whatsapp-server/deploy-vps.sh -o /tmp/deploy.sh && bash /tmp/deploy.sh
```

Ele instala o Docker se faltar, baixa o código, constrói a imagem e sobe o
container. A primeira vez demora alguns minutos (o Chromium é pesado).

Rodar de novo, depois de mudanças no código, atualiza tudo **sem perder a
sessão do WhatsApp nem o funil de vendas** — eles ficam no volume
`/var/lib/balao-whats`.

A porta fica publicada só em `127.0.0.1` de propósito: quem expõe para a
internet, com HTTPS, é o passo seguinte.

### Passo 2 — HTTPS

Depois rode o segundo script, que põe HTTPS na frente com Caddy (certificado
Let's Encrypt, pedido e renovado sozinho):

```bash
bash /opt/balao2026/whatsapp-server/configurar-https.sh
```

Sem informar nada, ele usa o hostname da própria VPS (ex.:
`srv1963897.hstgr.cloud`), que já aponta para o servidor — **não precisa mexer
em DNS**. Para um endereço próprio, crie um registro A apontando para o IP da
VPS no painel DNS do seu domínio e rode:

```bash
DOMINIO=whats.balao.info bash /opt/balao2026/whatsapp-server/configurar-https.sh
```

> O Cloudflare Tunnel também funciona, mas exige mover os nameservers do
> domínio para a Cloudflare. Se o site principal estiver em outro provedor de
> DNS (o `balao.info` está no Wix), o Caddy é o caminho mais seguro: ele não
> encosta no DNS que já existe.

- ✅ Mais barato que o Render e você controla tudo.
- ⚠️ Manutenção é sua: atualização de sistema, certificado, monitoramento.

---

## Comparação

| | PC da loja | Render | VPS |
| --- | --- | --- | --- |
| Custo | **R$ 0** | ~US$ 7/mês | ~R$ 25–40/mês |
| Trabalho para montar | Médio | Baixo | Alto |
| Cai se o PC desligar | Sim | Não | Não |
| Manutenção | Baixa | Nenhuma | Sua |

**Sugestão:** comece pela **Opção A**. Custo zero, e você descobre na prática se
a queda de energia é um problema real na loja. Se for, migrar para a Opção B
depois é trocar uma variável de ambiente e ler o QR Code de novo — o resto do
sistema não muda.

---

## Se der problema

**"Aguardando servidor" na tela do CRM**
O site não alcança o servidor. Confira se o `NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL`
está com `https://` e sem barra no fim, e se o servidor está de pé
(abra `https://whats.balao.info/status` no navegador — deve responder um JSON).

**Erro de conexão no console do navegador, falando em CORS ou origem**
A origem do site não está na lista. Confira
`WHATSAPP_PANEL_ALLOWED_ORIGIN` — ele aceita várias separadas por vírgula.

**Pede QR Code toda vez que reinicia**
A pasta `.wwebjs_auth` não está persistindo. Na nuvem, é o disco que não foi
montado no caminho certo (`/app/.wwebjs_auth`).

**O WhatsApp desconecta sozinho depois de um tempo**
Normalmente é o servidor tendo dormido (plano free) ou falta de memória. Veja os
requisitos no começo deste documento.

---

## Espaço em disco (importante)

O servidor grava em `whatsapp-server/data/media` **toda** foto, vídeo, áudio e
documento que passa pelo WhatsApp — é o que faz a mídia continuar aparecendo
quando alguém recarrega a página. Numa loja com movimento, isso são alguns GB
por mês.

Para o disco não encher e derrubar o atendimento, o servidor faz faxina
sozinho: no boot e a cada 6 horas, apaga o que passou do prazo e, se ainda
estiver acima do teto, remove os arquivos mais antigos até caber. **O histórico
da conversa permanece** — some apenas o arquivo guardado no servidor.

Quando o uso passa de 80% do teto, quem estiver com o painel aberto vê uma
faixa amarela de aviso.

### Variáveis

| Variável | Padrão | O que faz |
| --- | --- | --- |
| `MEDIA_RETENCAO_DIAS` | `60` | Apaga mídia mais antiga que isso |
| `MEDIA_LIMITE_MB` | `20000` (20 GB) | Teto da pasta; acima disso, os mais antigos saem. Mínimo aceito: 100 MB |
| `MEDIA_LIMPEZA_HORAS` | `6` | De quanto em quanto tempo a faxina roda |

Numa VPS de 100 GB, os padrões funcionam sem você mexer. Se o disco for menor,
reduza `MEDIA_LIMITE_MB` para algo em torno de um terço do disco total.
