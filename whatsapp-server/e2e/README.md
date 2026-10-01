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

---

## Bancada do vigia de recebimento

```bash
node e2e/vigia.e2e.mjs
```

Sobe a Evolution falsa sozinha (`e2e/fakes.js`, agora dentro do repositório — antes
ela vivia numa pasta temporária e a bancada deixava de rodar quando o ambiente
era reciclado) e um servidor real na porta 4111, com o vigia em escala de
segundos: `VIGIA_SILENCIO_MIN=0.2` são 12 segundos. A regra exercitada é
**exatamente** a da loja; só o relógio muda.

O que esta bancada prova, e que nenhum teste unitário prova:

- mensagem de cliente marca o relógio de entrada;
- mensagem que a **loja** manda **não** marca — era justamente isso que fazia o
  `/health` parecer saudável durante os dois dias de surdez, porque enviar nunca
  parou;
- mensagem de histórico (com data velha) também não marca;
- o alarme sai pelo socket e chega ao painel;
- painel que **abre no meio da pane** já abre avisado;
- o `/health` conta a mesma coisa que o painel;
- o vigia tenta se curar antes de gritar, e **não** martela a Evolution a cada ciclo;
- mensagem que volta a entrar desarma o alarme.

### Dois testes que nasceram de asserção errada

No primeiro `vigia.test.mjs` eu afirmei que às 07h28 de 01/10 — o momento em que
o Thiago mandou "Oi oi oi oi" e o sistema voltou — o parecer devia ser `surdo`.
Falhou. O código estava certo: às 7h28 a loja ainda não tem movimento, então
silêncio ali não é notícia. **A asserção estava errada, não o código.**

Mas investigar a falha revelou um bug de verdade: o vigia acusava surdez às 15h
e, às 19h, com a loja fechada e a fatia "parada", o parecer solto voltava a dizer
`ok` — e ele mandava um **"voltou a funcionar"** mentiroso, com o sistema ainda
surdo. Daí o teste `6b` e a marca `entradaDoAlarme`: só mensagem nova desarma o
alarme, nunca a passagem do relógio. Para conferir que o teste vale, troque
`entrouCoisaNova` por `true` em `vigia.js` e rode: `6b` falha em três pontos.
