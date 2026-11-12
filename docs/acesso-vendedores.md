# Acesso dos vendedores (páginas pessoais)

Como a equipe atende: **um número só, um QR Code só, um login por pessoa.**

## Como funciona

Todos os vendedores atendem pelo mesmo WhatsApp da loja — **(19) 98751-0267**.
O WhatsApp é conectado **uma única vez** por QR Code, no servidor
(`whatsapp-server`). Ninguém precisa ler QR Code de novo depois disso, nem no
próprio computador.

Cada vendedor cadastrado na aba Vendedores do CRM tem uma página própria e entra com o PIN dele (não com a senha de administração):

| Vendedor | Página | Acesso |
| --- | --- | --- |
| Thiago | `www.balao.info/thiago` | PIN cadastrado no CRM |
| Marcos | `www.balao.info/marcos` | PIN cadastrado no CRM |
| Julia | `www.balao.info/julia` | PIN cadastrado no CRM |
| Gabriel | `www.balao.info/gabriel` | PIN cadastrado no CRM |
| Wendell | `www.balao.info/wendell` | PIN cadastrado no CRM |
| Brendon | `www.balao.info/brendon` | PIN cadastrado no CRM |

O slug sai do nome: minúsculo, sem acento, sem espaço. Dois "Thiago" ficam `thiago` e `thiago2`. "Thiago Herrera" fica `thiagoherrera`. O link de cada um, com botão de copiar, aparece na aba Vendedores do CRM. Vendedor novo ganha a página na hora, sem publicar o site de novo.

Um slug nunca ocupa rota que o site já tem (`/iphone`, `/android`, `/macbook`, `/imac`, `/microsoft`, `/painel`, `/sistema`, `/app`, `/downloads` e as demais em `lib/vendedor-slug.ts`). Essas páginas seguem no ar, com o SEO delas. Endereço que não é de vendedor continua 404.

> ⚠️ **O PIN não vai no código nem na página.** Ele fica só no servidor do CRM. A tela pede o PIN e não mostra o de ninguém.

Quem entra pela página pessoal recebe:

- **a mesma caixa de conversas** — é o número da loja, compartilhado por todos;
- **o kanban pessoal dele** — o mesmo cliente pode estar em etapas diferentes
  para vendedores diferentes, de propósito;
- **a assinatura dele** anexada automaticamente nas mensagens;
- o filtro **“👤 Meus”**, para ver só o que está atribuído a ele;
- o botão **“✋ Pegar este atendimento”**, para puxar um lead da caixa da loja.

O que a página pessoal **não** mostra: a aba de cadastrar/remover vendedores.
Isso é tarefa de quem administra, em `/painel/crm`.

## O que fica guardado, e onde

Tudo que é pessoal fica **no servidor, amarrado à pessoa** — não ao
computador. O vendedor pode entrar de qualquer máquina da loja, ou de casa, e
encontra o funil do jeito que deixou. Limpar o cache do navegador não perde
nada.

| Pessoal (por vendedor) | Compartilhado (toda a loja) |
| --- | --- |
| Colunas do funil, com nome e cor | A caixa de conversas e o histórico |
| Em que etapa está cada cliente | Etiquetas |
| Assinatura automática ligada/desligada | Respostas rápidas |
| Tamanho do kanban e o filtro "Meus" | Catálogo de produtos |
| As conversas atribuídas a ele | Notas de cliente |

Na prática: se o Thiago renomeia uma coluna para "Aguardando peça", isso é só
dele — a Julia continua vendo o funil dela. Já uma etiqueta ou resposta rápida
nova aparece para todo mundo.

Quem entra por `/painel/crm` (administração) vê a caixa inteira e não carrega funil
pessoal.

> Nota sobre `/wendell`: a rota existia antes só como pasta de `/wendell/apple`
> (o hub Apple, público). A página do vendedor ocupa `/wendell`; as páginas de
> `/wendell/apple` continuam funcionando normalmente.

## As três portas do sistema

| Rota | Para quem | Senha |
| --- | --- | --- |
| `/brendon` | O vendedor, no dia a dia | O PIN dele, cadastrado no CRM |
| `/painel/crm` | Administração: conectar QR Code, cadastrar vendedor, ver a caixa toda | `PAINEL_PASSWORD` |
| `/whatsapp` | Painel simples do WhatsApp (QR + chat) | `PAINEL_PASSWORD` |

## Primeira vez (checklist)

1. **Suba o servidor de WhatsApp** (`whatsapp-server`) — Render ou VPS. Veja
   [whatsapp-painel-deploy.md](./whatsapp-painel-deploy.md). Ele precisa de
   disco persistente em `.wwebjs_auth`, senão a sessão cai a cada reinício.
2. **Configure no site** a variável `NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL`
   apontando para esse servidor.
3. **Abra `/painel/crm`** com a senha do painel e **leia o QR Code** com o celular da
   loja, o do número (19) 98751-0267. Isso é feito uma vez só.
4. **Mande o link para o vendedor**: `www.balao.info/brendon`. Ele entra com o
   PIN dele, no computador dele.

## Trocar o PIN de um vendedor

O PIN é o que foi cadastrado na aba Vendedores do CRM. Ele não fica em variável de ambiente e não precisa de publicação do site. Não apague o vendedor para trocar o PIN: o id é a chave do funil dele.

## Adicionar um vendedor novo

Na aba Vendedores do CRM (`/painel/crm`): nome, cargo, assinatura e PIN. A página `www.balao.info/<slug>` passa a existir na hora. O link fica na própria lista, com o botão de copiar. Não é preciso criar pasta, variável de ambiente nem publicar o site.

⚠️ **O `id` nunca deve mudar** depois que a pessoa começou a atender. Ele é a
chave do kanban pessoal (`kanbanPorVendedor[id]`) e da atribuição de conversas
(`chatAssignments`). Mudar o `id` zera o funil daquele vendedor.

## Tirar o acesso de alguém

Quem foi cadastrado só no CRM sai pela aba Vendedores. Quem está no seed do servidor (a equipe fixa) é recriado no próximo boot: o painel avisa em vez de fingir que removeu. Para esses, o acesso acaba quando o PIN deixa de ser o que a pessoa conhece.

## Perguntas que sempre aparecem

**Dois vendedores podem atender ao mesmo tempo?**
Sim. Cada um no seu PC, cada um com seu login. A caixa é a mesma porque o
número é o mesmo — por isso existem o filtro “Meus” e o botão de assumir
atendimento, para não ficarem dois respondendo o mesmo cliente.

**Brendon precisa ler algum QR Code?**
Não. O QR Code é do servidor, lido uma vez pelo celular da loja. Ele só entra
com o PIN.

**Se o Brendon sair, o histórico some?**
Não. As conversas são do número da loja e ficam. O que é dele é o kanban
pessoal e as conversas atribuídas a ele — que podem ser transferidas para
outro vendedor pelo menu de contexto da conversa.

**A sessão dele expira?**
O login vale 30 dias no mesmo navegador. O botão “🚪 Sair”, no topo, encerra
na hora — importante se ele usar um computador compartilhado.
