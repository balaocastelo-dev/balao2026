# Bancada de testes do chat

Até agora todo teste parava no servidor — e os bugs estavam na TELA. Esta
bancada sobe o sistema inteiro local e abre o `/crm` num navegador de verdade.

Nenhum dado de cliente e nenhuma conexão com a loja: a Evolution é falsa.

## Subir

```bash
bash whatsapp-server/e2e/bancada.sh
```

Sobe três coisas: Evolution falsa (4598), servidor real (4100) e site real
(3100), com a senha de painel `teste123`.

## Rodar

```bash
node whatsapp-server/e2e/chat.e2e.mjs       # os 10 testes do caminho normal
node whatsapp-server/e2e/cenarios.e2e.mjs   # cache estragado, @lid, escala
```

## O que cada teste prova

| | |
|---|---|
| T1 | o painel abre e lista a conversa |
| T2 | o selo mostra "Ao vivo" (socket ligado) |
| T3 | mensagem do cliente aparece sozinha |
| T4 | mensagem digitada no celular da loja aparece |
| T5 | mensagem que chega pelo código interno (@lid) aparece |
| T6 | mensagem que só a varredura acha aparece |
| T7 | a prévia da conversa na lista mostra a mensagem nova |
| T8 | conversa nova entra na lista sozinha |
| T9 | nenhuma conversa some |
| T10 | sem erro de JavaScript na tela |

E os cenários: cache estragado no navegador (o Ctrl+Shift+R não limpa o
localStorage), conversa só com código interno, e lista grande (800 conversas) —
onde se mede quanto tempo a mensagem leva para aparecer.

## Cuidado ao escrever teste aqui

Dois dos meus primeiros testes passaram contra código quebrado, e um "falhou"
contra código certo. Antes de confiar num teste novo, rode-o contra o código
ANTIGO e confirme que ele falha. Teste que não falha contra o bug não prova
nada.
