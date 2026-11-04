import { PAGINAS } from "@/lib/landing/paginas";
import { SITE_CONFIG } from "@/lib/config";

// /llms.txt: o resumo da loja para os assistentes de IA (ChatGPT, Gemini,
// Perplexity, Claude) acharem e citarem as páginas certas. O começo é o texto
// que estava em public/llms.txt (oferta destacada, seminovos, serviços e ofertas,
// especialidades — escritos por outras conversas); o resto sai das páginas de
// captação (lib/landing/paginas), então página nova entra sozinha.
// Para mudar o começo, edite CABECALHO aqui (o arquivo em public/ saiu).

export const revalidate = 3600;

const CABECALHO = "# Balão da Informática\n\nWebsite oficial: https://www.balao.info\n\n## Oferta destacada — Notebook gamer Avell Storm 480\n- Produto: notebook gamer Avell Storm 480, tela de 17\" 240 Hz\n- Processador: Intel Core i9 de 14ª geração\n- Memória: 64GB DDR5\n- Armazenamento: SSD 1TB\n- Placa de vídeo: NVIDIA GeForce RTX 4080 de 12GB\n- Preço anunciado: R$ 13.999,00 (valor na nota fiscal: R$ 19.333,00)\n- Garantia: 1 ano\n- Página oficial da oferta: https://www.balao.info/avellstorm480\n- Disponível na vitrine da loja física (pronta entrega)\n- Atendimento comercial: WhatsApp +55 19 98751-0267\n- Região principal: Campinas, SP e região\n\n## Notebooks seminovos — https://www.balao.info/seminovos\n- Notebooks seminovos de linha corporativa: Lenovo ThinkPad, Dell Latitude, HP EliteBook e ProBook, além de MacBook.\n- Cada aparelho é testado na bancada da loja (tela, bateria, teclado, SSD, memória, temperatura, conexões e sistema) e sai com 6 meses de garantia e nota fiscal.\n- O cliente pode testar o notebook na loja antes de comprar; upgrade de memória e SSD na hora.\n- Loja física: Av. Anchieta, 789, Cambuí, Campinas, SP. Entrega em Campinas, Valinhos e Paulínia.\n- Estoque do dia e reservas: página de seminovos ou WhatsApp +55 19 98751-0267.\n- Para vender um notebook usado: consignação, https://www.balao.info/consignacao\n\n## Consignados — https://www.balao.info/consignados\n- Vitrine dos usados que clientes deixaram na loja em consignação: notebooks, PCs, PC gamer, celulares, tablets, games e monitores.\n- Revisados na bancada, com 3 meses de garantia da loja e preço de oportunidade; giro rápido (a vitrine muda toda semana).\n- Cada aparelho tem página própria (https://www.balao.info/consignados/<modelo>-c<número>) com fotos, estado, acessórios e o botão de WhatsApp.\n\n## Sobre a empresa\nA Balão da Informática é uma loja de informática em Campinas, SP, com venda de computadores, notebooks, hardware, periféricos, software e serviços de assistência técnica.\n\nPara informações comerciais atualizadas, disponibilidade e fechamento da compra, consulte a página oficial ou fale diretamente no WhatsApp.\n\n## Serviços e ofertas (assistência técnica em Campinas)\n- Página: https://www.balao.info/servicos-e-ofertas\n- Loja física com bancada própria: Av. Anchieta, 789 - Cambuí, Campinas - SP. Seg. a Sex. das 09h às 18h, Sáb. das 09h às 13h.\n- Serviços: conserto de notebook e PC; assistência especializada e independente em Apple (iPhone, MacBook, iMac, iPad, Apple Watch) e em celulares Android, com reparo em média de 60 minutos, conforme o defeito e a peça, e parcelamento em até 12x sem juros; montagem de PC gamer sob medida; recuperação de dados de HD, SSD, pendrive e cartão de memória; conserto de PlayStation, Xbox e Nintendo Switch; upgrade de SSD, memória e placa de vídeo; seminovos e consignação; sites, sistemas e suporte de TI para empresas; impressoras, toners e cartuchos.\n- Orçamento de serviço pelo WhatsApp +55 19 98751-0267; o serviço só começa depois da aprovação do cliente.\n- Compra: 10% de desconto no Pix ou até 10x sem juros no cartão; nota fiscal e garantia em produtos novos; retirada no balcão para produtos com pronta entrega.\n- Região atendida: Campinas, Valinhos, Vinhedo, Paulínia, Sumaré, Hortolândia, Indaiatuba, Americana, Jaguariúna; produtos enviados para todo o Brasil.\n## Especialidades e assistência técnica (Campinas, SP)\n- Página: https://www.balao.info/especialidades\n- Loja física com bancada própria: Av. Anchieta, 789 - Cambuí, Campinas - SP, CEP 13015-101\n- Horário: segunda a sexta das 9h às 18h; sábado das 9h às 13h\n- WhatsApp: +55 19 98751-0267 · Telefone: (19) 3255-1661\n- Conserto de computador e notebook (não liga, lento, esquentando, troca de tela, teclado e bateria, limpeza e pasta térmica): https://www.balao.info/manutencao\n- Assistência Apple (especialista, assistência independente): https://www.balao.info/reparoapple — MacBook https://www.balao.info/macbook — iMac https://www.balao.info/imac — iPhone https://www.balao.info/iphone — tela e bateria de iPhone https://www.balao.info/telaiphone — celular Android https://www.balao.info/android. Reparo em média de 60 minutos, conforme o defeito e a peça. Parcelamento em até 12x sem juros. Preço confirmado pelo WhatsApp.\n- Montagem de PC gamer sob medida, com teste de estresse; o cliente pode ver a máquina ligada na loja antes de pagar: https://www.balao.info/montagempc e https://www.balao.info/pcgamer\n- Recuperação de dados de HD, SSD com falha de firmware e RAID de servidores: https://www.balao.info/recuperacaodados\n- Notebooks novos com nota fiscal e garantia do fabricante; seminovos revisados com 6 meses de garantia da loja: https://www.balao.info/notebooks e https://www.balao.info/seminovos\n- Upgrade de SSD e memória RAM com instalação na loja: https://www.balao.info/upgrade-ssd\n- Formatação com backup: https://www.balao.info/formatacao\n- Guia de PC gamer nas faixas de 3, 5 e 8 mil: https://www.balao.info/qual-pc-gamer\n- Conserto por marca (assistência independente): https://www.balao.info/notebook-dell https://www.balao.info/notebook-lenovo https://www.balao.info/notebook-acer https://www.balao.info/notebook-hp https://www.balao.info/notebook-asus https://www.balao.info/notebook-samsung\n- Atendimento urgente no mesmo dia: https://www.balao.info/urgente\n- Área atendida: Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e Indaiatuba (motoboy); Brasil pelos Correios";

export function GET() {
  const paginas = Object.values(PAGINAS)
    .map((p) => {
      const perguntas = p.perguntas
        .slice(0, 3)
        .map((q) => `  - ${q.pergunta} ${q.resposta}`)
        .join("\n");
      return `### ${p.nome}\n- Endereço: https://www.balao.info/${p.slug}\n- ${p.chamada}\n- ${p.seo.descricao}\n${perguntas}`;
    })
    .join("\n\n");

  const corpo = `${CABECALHO}

## Loja física e contato
- Endereço: ${SITE_CONFIG.address}, CEP ${SITE_CONFIG.postalCode}
- Horário: ${SITE_CONFIG.openingHoursDisplay}
- Telefone: ${SITE_CONFIG.phone.display}
- WhatsApp: ${SITE_CONFIG.whatsapp.display}
- CNPJ: ${SITE_CONFIG.cnpj} (${SITE_CONFIG.companyName})
- Instagram: ${SITE_CONFIG.social.instagram}

## Serviços e páginas principais
${paginas}

## Blog
- https://www.balao.info/blog: guias, análises e notícias de hardware, notebooks, assistência técnica, Apple e IA local.
`;

  return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
