# Acesso dos vendedores (páginas pessoais)

Como a equipe atende: **um número só, um QR Code só, um login por pessoa.**

## Como funciona

Todos os vendedores atendem pelo mesmo WhatsApp da loja — **(19) 98751-0267**.
O WhatsApp é conectado **uma única vez** por QR Code, no servidor
(`whatsapp-server`). Ninguém precisa ler QR Code de novo depois disso, nem no
próprio computador.

Cada vendedor tem uma página própria e entra com a senha dele:

| Vendedor | Página | Onde fica a senha |
| --- | --- | --- |
| Brendon | `www.balao.info/brendon` | Variável `VENDEDOR_BRENDON_SENHA` na hospedagem |

> ⚠️ **A senha nunca vai no código.** Este repositório é público: senha
> versionada vira senha pública, e o histórico do git não esquece. Enquanto a
> variável de ambiente não existir, **nenhuma senha funciona** e a tela de login
> avisa que falta configurar — é proposital, para o acesso nunca abrir sozinho
> com um valor que qualquer um poderia adivinhar lendo o repositório.

Quem entra pela página pessoal recebe:

- **a mesma caixa de conversas** — é o número da loja, compartilhado por todos;
- **o kanban pessoal dele** — o mesmo cliente pode estar em etapas diferentes
  para vendedores diferentes, de propósito;
- **a assinatura dele** anexada automaticamente nas mensagens;
- o filtro **“👤 Meus”**, para ver só o que está atribuído a ele;
- o botão **“✋ Pegar este atendimento”**, para puxar um lead da caixa da loja.

O que a página pessoal **não** mostra: a aba de cadastrar/remover vendedores.
Isso é tarefa de quem administra, em `/crm`.

## As três portas do sistema

| Rota | Para quem | Senha |
| --- | --- | --- |
| `/brendon` | O vendedor, no dia a dia | A senha pessoal dele |
| `/crm` | Administração: conectar QR Code, cadastrar vendedor, ver a caixa toda | `PAINEL_PASSWORD` |
| `/whatsapp` | Painel simples do WhatsApp (QR + chat) | `PAINEL_PASSWORD` |

## Primeira vez (checklist)

1. **Suba o servidor de WhatsApp** (`whatsapp-server`) — Render ou VPS. Veja
   [whatsapp-painel-deploy.md](./whatsapp-painel-deploy.md). Ele precisa de
   disco persistente em `.wwebjs_auth`, senão a sessão cai a cada reinício.
2. **Configure no site** a variável `NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL`
   apontando para esse servidor.
3. **Abra `/crm`** com a senha do painel e **leia o QR Code** com o celular da
   loja, o do número (19) 98751-0267. Isso é feito uma vez só.
4. **Mande o link para o vendedor**: `www.balao.info/brendon`. Ele entra com a
   senha dele, no computador dele.

## Definir ou trocar a senha de um vendedor

A senha mora só numa variável de ambiente na hospedagem (Vercel → Settings →
Environment Variables, ou o `.env` do servidor). Nunca no código.

```
VENDEDOR_BRENDON_SENHA=aSenhaQueVoceEscolher
```

Depois de salvar, **publique o site de novo** — variável de ambiente só passa a
valer no próximo deploy.

Trocar a senha derruba as sessões abertas daquele vendedor: ele entra de novo
com a senha nova. É assim que você tira o acesso de alguém no mesmo dia.

**Enquanto a variável não existir, ninguém entra** — nem com a senha certa,
porque não há senha certa. A tela de login mostra um aviso amarelo dizendo
exatamente qual variável falta.

## Adicionar um vendedor novo

São quatro passos — os quatro precisam bater.

1. **`lib/vendedores.ts`** — acrescente o registro:

   ```ts
   {
     slug: "maria",
     id: "maria",
     nome: "Maria",
     cargo: "Consultora de Vendas",
     assinatura: "Atenciosamente,\n*Maria* — Balão da Informática Castelo",
     envSenha: "VENDEDOR_MARIA_SENHA",
   }
   ```

2. **`app/maria/page.tsx`** — copie `app/brendon/page.tsx` e troque só a
   constante `SLUG` para `"maria"`.

3. **`whatsapp-server/vendedores-fixos.json`** — espelhe `id`, `nome`, `cargo`
   e `assinatura`. Reinicie o servidor de WhatsApp para o seed rodar.

4. **Defina `VENDEDOR_MARIA_SENHA`** na hospedagem e publique. Sem isso a
   página existe, mas ninguém entra.

⚠️ **O `id` nunca deve mudar** depois que a pessoa começou a atender. Ele é a
chave do kanban pessoal (`kanbanPorVendedor[id]`) e da atribuição de conversas
(`chatAssignments`). Mudar o `id` zera o funil daquele vendedor.

## Tirar o acesso de alguém

Remova o registro de `lib/vendedores.ts`, apague a pasta `app/<slug>/` e tire a
entrada de `whatsapp-server/vendedores-fixos.json`. Publique o site.

Remover pelo painel do CRM **não** funciona para esses vendedores: o seed do
servidor recria o registro no próximo boot, e o painel avisa isso em vez de
fingir que deu certo.

## Perguntas que sempre aparecem

**Dois vendedores podem atender ao mesmo tempo?**
Sim. Cada um no seu PC, cada um com seu login. A caixa é a mesma porque o
número é o mesmo — por isso existem o filtro “Meus” e o botão de assumir
atendimento, para não ficarem dois respondendo o mesmo cliente.

**Brendon precisa ler algum QR Code?**
Não. O QR Code é do servidor, lido uma vez pelo celular da loja. Ele só entra
com a senha.

**Se o Brendon sair, o histórico some?**
Não. As conversas são do número da loja e ficam. O que é dele é o kanban
pessoal e as conversas atribuídas a ele — que podem ser transferidas para
outro vendedor pelo menu de contexto da conversa.

**A sessão dele expira?**
O login vale 30 dias no mesmo navegador. O botão “🚪 Sair”, no topo, encerra
na hora — importante se ele usar um computador compartilhado.
