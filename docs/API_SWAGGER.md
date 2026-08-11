# Documentação da API de Cupons (Swagger/OpenAPI Spec)

## Base URL
`/api/coupons`

## Endpoints

### 1. Listar Cupons
**GET** `/api/coupons`

Retorna uma lista de todos os cupons cadastrados.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "code": "NATAL10",
    "discount_type": "percentage",
    "discount_value": 10,
    "status": "active",
    "expiration_date": "2026-12-25T23:59:59Z",
    "current_uses": 5,
    "max_uses": 100
  }
]
```

---

### 2. Criar Cupom
**POST** `/api/coupons`

Cria um novo cupom.

**Body:**
```json
{
  "code": "SUMMER20",
  "discount_type": "fixed",
  "discount_value": 20.00,
  "expiration_date": "2026-03-01T00:00:00Z",
  "max_uses": 50,
  "min_purchase_value": 100.00,
  "applicable_categories": ["Verão", "Praia"]
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "code": "SUMMER20",
  ...
}
```

---

### 3. Atualizar Cupom
**PUT** `/api/coupons`

Atualiza um cupom existente.

**Body:**
```json
{
  "id": "uuid",
  "status": "inactive",
  "max_uses": 60
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  ...updated_fields
}
```

---

### 4. Deletar Cupom
**DELETE** `/api/coupons?id={uuid}`

Remove um cupom (Soft delete ou Hard delete dependendo da implementação, neste caso Hard delete via API, mas banco pode ter soft delete se configurado).

**Response (200 OK):**
```json
{ "message": "Cupom excluído com sucesso" }
```

---

### 5. Validar Cupom (Checkout)
**POST** `/api/coupons/validate`

Valida um cupom contra um carrinho de compras e retorna o desconto aplicável.

**Body:**
```json
{
  "code": "NATAL10",
  "cartTotal": 500.00,
  "items": [
    { "id": "prod1", "price": 100.00, "quantity": 2, "category": "Natal" },
    { "id": "prod2", "price": 300.00, "quantity": 1, "category": "Eletrônicos" }
  ]
}
```

**Response (200 OK - Válido):**
```json
{
  "valid": true,
  "discount": 20.00,
  "coupon": {
    "code": "NATAL10",
    "type": "percentage",
    "value": 10
  }
}
```

**Response (200 OK - Inválido):**
```json
{
  "valid": false,
  "message": "Este cupom expirou."
}
```
