# Diagrama Entidade-Relacionamento (ER) - Sistema de Cupons

```mermaid
erDiagram
    COUPONS {
        UUID id PK "Identificador único"
        TEXT code UK "Código do cupom (ex: NATAL10)"
        TEXT discount_type "Tipo: 'percentage' ou 'fixed'"
        NUMERIC discount_value "Valor do desconto"
        TIMESTAMP expiration_date "Data de validade"
        INTEGER max_uses "Limite global de usos"
        INTEGER current_uses "Total de usos atuais"
        TEXT status "Status: 'active' ou 'inactive'"
        NUMERIC min_purchase_value "Valor mínimo do carrinho"
        JSONB applicable_products "IDs de produtos elegíveis"
        JSONB applicable_categories "Nomes de categorias elegíveis"
        TIMESTAMP created_at "Data de criação"
        TIMESTAMP updated_at "Data de atualização"
    }

    ORDERS {
        UUID id PK
        UUID user_id FK
        TEXT status
        NUMERIC total
        TEXT coupon_code "Código do cupom aplicado"
        NUMERIC discount_value "Valor do desconto obtido"
        TIMESTAMP created_at
        TEXT customer_name
        TEXT customer_email
    }

    PRODUCTS {
        UUID id PK
        TEXT name
        TEXT category
        NUMERIC price
        TEXT image
    }

    %% Relacionamentos
    COUPONS ||--o{ ORDERS : "aplica desconto em"
    PRODUCTS }|--o{ COUPONS : "pode ser restrito a"
```

## Descrição das Tabelas

### `coupons`
Armazena as regras e definições dos cupons de desconto.
- **code**: Código único, case-insensitive.
- **discount_type**: Define se o desconto é percentual (`percentage`) ou valor fixo (`fixed`).
- **applicable_products/categories**: Arrays JSON para restringir o cupom a itens específicos.

### `orders`
Tabela de pedidos, agora incluindo campos para rastrear o uso de cupons.
- **coupon_code**: Armazena qual cupom foi usado no pedido.
- **discount_value**: O valor monetário total descontado do pedido.
