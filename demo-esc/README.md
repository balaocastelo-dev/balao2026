# Escritório Digital (`/demo-esc`)

Página isolada para o Thiago mostrar a **Equipe Digital Balão** para o cliente. O visual é um cenário 3D low-poly, com ilhas flutuando, chão xadrez e bonecos na própria cor. Não usa personagem, fonte, música nem marca de jogo: é desenho original da casa.

A cena, o feed e esta pasta são só desta página. O restante do site não entra aqui.

## O que a página faz

- Cada agente ativo tem mesa, cadeira, monitor, teclado e torre. Trabalhando, a tela acende na cor dele e as mãos digitam. Ocioso, em conversa, em reunião ou no café, a tela apaga.
- Quem está `em_breve` na equipe fica numa ilha inacabada, translúcido, com o computador desligado.
- A câmera gira sozinha. Arrastar gira, a roda e o gesto de pinça aproximam. Clicar num boneco (ou na tarefa) abre a ficha e aproxima a câmera.
- O painel **Conversas ao vivo** e o contador de estrelas (tarefas concluídas) e moedas (conversas hoje) acompanham o movimento.
- Com `prefers-reduced-motion`, a câmera para de girar e os enfeites param de se mexer. A tela ligada fica acesa, sem rolagem.

## Modo demonstração e dados reais

A página pede `GET /demo-esc/api/status` a cada 10 segundos.

- Se `updatedAt` tiver menos de 5 minutos, a cena, as telas e o painel seguem o feed. Aparece o selo **Ao vivo**.
- Se o feed faltar, vier inválido ou estiver velho, volta o roteiro local e o selo **Modo demonstração**.

O arquivo `demo-esc/status.json` é o exemplo e o fallback. A data dele é antiga de propósito, para a página abrir em demonstração quando ninguém publicou um feed novo.

Ordem de leitura do `GET`:

1. Memória gravada por `POST` neste processo (some quando o processo reinicia; na Vercel isso é por instância).
2. A URL em `DEMO_ESC_STATUS_URL`, se existir e responder um JSON válido.
3. O `status.json` desta pasta.

## Como acrescentar um agente

Edite só `demo-esc/equipe.ts` e copie um bloco para o fim da lista:

```ts
{
  id: "novo-id",
  nome: "Nome",
  papel: "Função curta",
  cor: "#ff88aa",
  emoji: "🧩",
  status: "ativo", // ou "em_breve"
  tarefas: ["Uma tarefa", "Outra tarefa"],
}
```

A mesa e o computador nascem sozinhos. `ativo` entra na ilha principal; `em_breve` entra na ilha inacabada. A ordem na lista é a ordem das mesas.

Para ele falar no modo demonstração, acrescente um roteiro em `demo-esc/dialogos.ts` usando o mesmo `id`. Sem roteiro, ele ainda trabalha, fica disponível e pode entrar numa conversa genérica.

## Contrato do JSON

```json
{
  "updatedAt": "2026-10-28T15:00:00.000Z",
  "agents": [
    {
      "id": "joao",
      "name": "João",
      "status": "trabalhando",
      "currentTask": "Editando vídeo da campanha",
      "lastMessage": "",
      "talkingTo": null,
      "whatsappConnected": false
    }
  ],
  "events": [
    {
      "at": "2026-10-28T14:58:00.000Z",
      "from": "malaquias",
      "to": "joao",
      "text": "João, fecha um vídeo curto da campanha da semana?"
    }
  ]
}
```

| Campo | Significado |
| --- | --- |
| `updatedAt` | Data ISO. Mais de 5 minutos e a página ignora o feed. |
| `agents[].id` | O `id` de `equipe.ts`. Também aceita o nome (`João`). |
| `agents[].status` | `trabalhando`, `em_conversa`, `ocioso`, `em_reuniao` ou `em_breve`. |
| `currentTask` | Texto da tarefa na ficha e na lista. |
| `lastMessage` | Balão, se o status for conversa ou reunião. |
| `talkingTo` | `id` ou nome de quem está do outro lado. `null` se ninguém. |
| `whatsappConnected` | Opcional. `true` mostra **WhatsApp conectado** na ficha. Ausente ou `false` esconde. |
| `events[]` | Recados do painel, do mais antigo ao mais novo. `from` e `to` como o `id`. |

Quem está `em_breve` na equipe permanece na ilha inacabada mesmo que o feed diga outra coisa. Status `em_reuniao` leva o boneco até a mesa redonda. `em_conversa` com `talkingTo` leva um dos dois até a mesa do outro. `trabalhando` e `ocioso` ficam na própria mesa; só `trabalhando` acende o monitor.

No modo ao vivo, as moedas são a quantidade de eventos e as estrelas sobem quando a tarefa de alguém muda.

## Publicar um feed

Variável `DEMO_ESC_STATUS_URL`: um endereço que devolve o JSON acima. A rota busca de novo, com uma folga de 8 segundos para não martelar a origem.

Variável `DEMO_ESC_TOKEN`: libera o `POST`. Sem ela, o `POST` responde 401.

```bash
curl -X POST https://www.balao.info/demo-esc/api/status \
  -H "Authorization: Bearer $DEMO_ESC_TOKEN" \
  -H "Content-Type: application/json" \
  -d @demo-esc/status.json
```

Se o corpo não trouxer `updatedAt`, a rota carimba a hora atual. Para esquecer o que foi gravado na memória:

```bash
curl -X POST https://www.balao.info/demo-esc/api/status \
  -H "Authorization: Bearer $DEMO_ESC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limpar":true}'
```

O `GET` responde com o cabeçalho `X-Demo-Esc-Fonte`: `memoria`, `url` ou `arquivo`.
