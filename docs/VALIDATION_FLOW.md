# Fluxo de Validação de Cupons

O sistema valida os cupons em tempo real durante o checkout seguindo a seguinte ordem de prioridade. Se qualquer etapa falhar, o cupom é considerado inválido.

## Etapas de Validação

1. **Existência do Código**
   - O sistema busca o código no banco de dados (ignorando maiúsculas/minúsculas).
   - *Falha*: Retorna "Cupom não encontrado".

2. **Status Ativo**
   - Verifica se o campo `status` é igual a 'active'.
   - *Falha*: Retorna "Este cupom não está mais ativo".

3. **Data de Validade**
   - Verifica se a data atual é anterior à `expiration_date` (se definida).
   - *Falha*: Retorna "Este cupom expirou".

4. **Limite de Uso Global**
   - Verifica se `current_uses` é menor que `max_uses` (se definido).
   - *Falha*: Retorna "Este cupom atingiu o limite de uso global".

5. **Valor Mínimo de Compra**
   - Verifica se o total do carrinho é maior ou igual a `min_purchase_value`.
   - *Falha*: Retorna "Valor mínimo para este cupom é R$ X".

6. **Elegibilidade de Produtos/Categorias**
   - Se o cupom tiver restrições de produtos ou categorias:
     - O sistema filtra os itens do carrinho que correspondem às restrições.
     - *Falha*: Se nenhum item for elegível, retorna "Este cupom não se aplica aos produtos no carrinho".

## Cálculo do Desconto

O desconto é calculado apenas sobre o valor dos **itens elegíveis**:

1. **Desconto Percentual**
   - `Valor do Desconto = (Soma dos Itens Elegíveis * % do Cupom) / 100`

2. **Desconto Fixo**
   - `Valor do Desconto = Valor Fixo do Cupom`
   - *Regra*: O desconto fixo não pode exceder o valor total dos itens elegíveis. Se o desconto for R$ 50 e o cliente comprar apenas R$ 30 em produtos elegíveis, o desconto será R$ 30.

3. **Limite Final**
   - O desconto total nunca pode exceder o valor total do carrinho.
