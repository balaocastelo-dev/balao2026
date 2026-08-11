# Melhorias de conversão local — Balão da Informática

Este pacote foi preparado para transformar a home do site em uma página mais forte para cliente local de Campinas.

## O que muda

1. Nova seção principal da home com foco em:
   - Loja física em Campinas/Cambuí
   - Compra pelo WhatsApp
   - Retirada na loja
   - Entrega rápida em Campinas/região
   - Assistência técnica e suporte

2. Botão flutuante de WhatsApp em todas as páginas.

3. Botão principal do produto deixa de ser apenas carrinho e vira:
   - COMPRAR PELO WHATSAPP
   - Adicionar ao carrinho fica como ação secundária

4. Mensagens automáticas do WhatsApp mais comerciais, com produto, valor e link.

5. Topbar e SEO da home ajustados para intenção local.

6. Schema LocalBusiness ajustado para não usar CEP errado quando o CEP não estiver confirmado.

## Como aplicar

Dentro da pasta do projeto, execute no PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
.\aplicar_melhorias_conversao.ps1
npm run build
```

Depois confira a home e as páginas de produto.

## Importante

O script faz backup dos arquivos antigos em `backup-conversao-local`.
Se o CEP correto da loja for confirmado, preencha `postalCode` em `lib/config.ts`.
