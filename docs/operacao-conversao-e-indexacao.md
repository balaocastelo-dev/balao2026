# Operacao de Conversao e Indexacao

Este documento resume o que foi instrumentado no site e o que precisa ser feito no Google para transformar acesso em lead medido.

## Eventos Implementados

Os eventos abaixo ja sao enviados para `dataLayer`, `gtag` e `fbq` quando essas integracoes estiverem configuradas:

- `route_context`
- `lead_section_view`
- `whatsapp_click`
- `phone_click`
- `email_click`
- `lead_form_attempt`
- `lead_form_success`
- `lead_form_error`

## Campos Enviados

Dependendo do ponto de conversao, os eventos podem incluir:

- `page_path`
- `page_query`
- `source`
- `label`
- `city`
- `service`
- `product_name`
- `destination`
- `event_category`
- `value`

## Onde Isso Ja Esta Ativo

- Botao flutuante de WhatsApp
- Botao de WhatsApp nas paginas de produto
- Formularios de captacao rapida
- Pagina `fale-conosco`
- Links `wa.me`, `tel:` e `mailto:` em qualquer pagina renderizada no site

## Passo 1: Conferir Variaveis de Ambiente

Garanta que estas variaveis estejam configuradas na hospedagem:

- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_SITE_URL`

## Passo 2: Marcar Conversoes no Google Analytics

No GA4:

1. Abra `Administrador`.
2. Entre em `Eventos`.
3. Encontre os eventos:
   - `whatsapp_click`
   - `phone_click`
   - `lead_form_success`
4. Marque esses eventos como conversao.

Recomendacao inicial:

- `lead_form_success`: conversao principal
- `whatsapp_click`: conversao principal
- `phone_click`: conversao secundaria

## Passo 3: Configurar no Google Tag Manager

Se voce usa GTM, crie acionadores para:

- evento customizado `whatsapp_click`
- evento customizado `phone_click`
- evento customizado `lead_form_success`

Depois envie para:

- GA4 Event
- Google Ads Conversion, se estiver usando anuncios
- Meta Pixel Custom Event, se quiser campanhas de remarketing

## Passo 4: Search Console

Assim que publicar:

1. Entre no Search Console da propriedade `https://www.balao.info/`.
2. Envie o sitemap:
   - `https://www.balao.info/sitemap.xml`
3. Solicite indexacao manual destas paginas primeiro:
   - `/`
   - `/regiao`
   - `/especialidades`
   - `/urgente`
   - `/manutencao`
   - `/notebooks`
   - `/pcgamer`
   - `/assistenciagames`
   - `/reparoapple`

Depois solicite indexacao das novas paginas mais fortes:

- `/regiao/campinas/assistencia-tecnica`
- `/regiao/campinas/conserto-notebook`
- `/regiao/campinas/pc-gamer`
- `/regiao/campinas/reparo-apple`
- `/urgente/notebook-nao-liga-campinas`
- `/urgente/pc-lento-campinas`
- `/urgente/ps5-superaquecendo-campinas`
- `/urgente/iphone-tela-quebrada-campinas`

## Passo 5: Ordem de Leitura no GA4

Quando comecar a entrar trafego, acompanhe:

1. Paginas com mais `whatsapp_click`
2. Paginas com mais `lead_form_success`
3. Cidades e servicos que mais geram clique
4. Taxa de conversao por pagina

Se uma pagina recebe visita e nao gera clique:

- ajuste CTA
- reescreva o bloco acima da dobra
- reduza excesso de texto antes do botao

## Passo 6: Sinal para Google Business Profile

Publique no perfil da empresa com links para:

- pagina principal do servico
- pagina regional
- pagina urgente mais importante

Exemplo:

- "Notebook nao liga em Campinas? Veja como pedir atendimento rapido" com link para `/urgente/notebook-nao-liga-campinas`

## Regra Pratica

Nao trabalhe mais no escuro.

As paginas que mais importam agora sao as que conseguem gerar:

- clique no WhatsApp
- envio de formulario
- ligacao

O objetivo nas proximas semanas e simples:

- cortar o que nao gera lead
- reforcar o que gera contato
