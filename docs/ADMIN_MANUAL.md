# Manual do Administrador - Sistema de Cupons

## Acesso
1. Acesse a área administrativa do site (`/admin`).
2. Localize a aba **"Cupons"** no menu de navegação.
3. Ao clicar, será solicitada uma senha de segurança.
4. Digite a senha: **56676009**.

## Funcionalidades

### Criar Novo Cupom
1. Clique no botão **"Novo Cupom"**.
2. Preencha o formulário:
   - **Código**: O texto que o cliente digitará (ex: `PROMO10`).
   - **Tipo de Desconto**: Escolha entre Porcentagem (%) ou Valor Fixo (R$).
   - **Valor**: O valor do desconto (ex: `10` para 10% ou R$ 10,00).
   - **Validade** (Opcional): Data limite para uso.
   - **Uso Máximo** (Opcional): Quantidade total de vezes que o cupom pode ser usado por todos os clientes.
   - **Valor Mínimo** (Opcional): Valor mínimo do carrinho para ativar o cupom.
   - **Categorias/Produtos** (Opcional): Restrinja o cupom a itens específicos.
3. Clique em **"Salvar"**.

### Modelos de Datas Comemorativas
O sistema oferece botões rápidos para criar cupons de datas especiais (Natal, Black Friday, Dia das Mães, etc.).
1. Clique em um dos botões de modelo (ex: "Natal").
2. O formulário será preenchido automaticamente com um código sugerido (ex: `NATAL2026`) e configurações padrão.
3. Ajuste os valores conforme necessário e clique em **"Salvar"**.

### Gerenciar Cupons
- **Editar**: Clique no ícone de lápis ao lado de um cupom para alterar suas regras.
- **Excluir**: Clique no ícone de lixeira para remover um cupom permanentemente.
- **Status**: Você pode ativar/desativar um cupom rapidamente editando seu status.

### Acompanhamento
Na lista de cupons, você pode ver:
- Quantas vezes cada cupom foi usado (`Uso Atual`).
- Se o cupom está expirado (indicado visualmente).
- Detalhes das restrições.

## Integração com Pedidos
Quando um cliente finaliza um pedido com cupom:
- O pedido na aba "Pedidos" mostrará o código do cupom usado.
- O valor do desconto será destacado em verde no resumo financeiro do pedido.
