# Sugestões na página do produto (19/10/2026)

Pedido do Thiago: carrossel de produtos sugeridos dentro da página do produto.

## O que aparece
Embaixo dos detalhes do produto, dois carrosséis (somem se não houver o que mostrar):

1. **Opções parecidas**: mesma categoria (ou a categoria de cima, nunca a raiz), preço até 2,5× para mais ou
   para menos, e nome com as mesmas palavras (i3, 4ª geração, SSD 240GB…). Pronta entrega ganha um empurrão.
2. **Combina com este produto**: o que se leva junto, um de cada grupo por vez.
   - PC: monitor, teclado e mouse, headset, estabilizador, nobreak, caixa de som, adaptador Wi-Fi.
   - Processador: placa-mãe, memória, cooler, SSD e pasta térmica.
   - As regras para celular, notebook, games, periféricos e as outras categorias estão em `REGRAS`.
   - O preço alvo é uma fração do preço do produto, para o monitor sugerido caber no orçamento de quem
     compra um PC de R$ 1.200.

Só entra produto com foto e disponível. Nada repete: mesmo nome, ou a mesma peça em outra cor com o mesmo
preço, aparece uma vez só.

## Compatibilidade (só no "combina")
- **Placa-mãe e processador:** precisam ter o mesmo soquete.
  - O soquete sai do nome, do modelo (Ryzen 5000 = AM4, i5-12400 = 1700) ou do chipset (B550 = AM4, H610 = 1700).
  - Se o soquete do produto é conhecido e o da placa não, a placa fica de fora.
- **Memória:** tem de ser da geração do soquete (DDR3/4/5). Memória de notebook não vai para processador nem
  para placa-mãe de desktop.
- **Acessório de iPhone:** de outro modelo não entra. Capa e película ficam de fora.
- **Fonte de PC:** precisa ter a potência em W. Fonte de CFTV de 12 V que está em Hardware/Fontes não entra.

## Código
- `lib/catalogo/sugestoes.ts`: regras, montagem da base e escolha. Tudo função pura.
  Testes em `__tests__/lib/sugestoes.test.ts`.
- `lib/cache.ts`, função `getCachedBaseDeSugestoes(categoria)`:
  - faz uma consulta enxuta por categoria (`getCandidatosPorOrigens`), no máximo a cada 30 minutos, por causa
    da cota de 500 conexões por hora do banco;
  - guarda só os campos do card, entre ~20 KB e ~700 KB, dentro do limite de 2 MB do cache do Next;
  - sem banco, usa a cópia do catálogo.
- `components/produto/SugestoesDoProduto.tsx` (servidor) e `CarrosselDeSugestoes.tsx` (cliente).
  - A página carrega dentro de `<Suspense>`: o produto aparece primeiro e os carrosséis chegam depois.
  - Se der erro, a página do produto aparece sem os carrosséis.

## Para mudar
- **O que combina com o quê:** edite `REGRAS`. A primeira regra cujo prefixo casa com a categoria vale, então
  as mais específicas ficam em cima. `g(fração, caminhos…)`.
- **PC que já vem com a peça:** um "PC Gamer Completo com monitor, teclado, mouse e headset" não recebe sugestão de monitor, teclado, mouse nem headset (campo `jaVem` do grupo).
- **Quantos itens aparecem:** `LIMITE_PARECIDOS` e `LIMITE_COMBINA`, hoje 12 cada.
