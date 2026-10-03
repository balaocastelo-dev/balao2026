import type { Metadata } from "next";
import Image from "next/image";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { SITE_CONFIG } from "@/lib/config";
import styles from "./sistemasdeia.module.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sdi-display",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sdi-body",
});

export const metadata: Metadata = {
  title: "18 Sistemas Prontos para a sua Empresa por R$ 97",
  description:
    "Atendimento no WhatsApp, loja virtual, estoque, financeiro e automações com inteligência artificial. 18 sistemas prontos com código-fonte, criados pelo Balão da Informática. R$ 29 cada ou R$ 97 o pacote, pagamento único.",
  alternates: {
    canonical: "https://www.balao.info/sistemasdeia",
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/sistemasdeia",
    title: "18 Sistemas Prontos para a sua Empresa por R$ 97",
    description:
      "Os sistemas que o Balão da Informática criou para tocar a própria loja, agora à venda. Pagamento único e 7 dias de garantia.",
    siteName: "Balão da Informática",
    images: [{ url: "/images/sistemasdeia/ia-hero.webp", width: 1100, height: 840 }],
  },
};

function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;
}

const LINK_PACOTE = linkWhatsApp("Quero o pacote com os 18 sistemas do Balão");
const LINK_AVULSO = linkWhatsApp("Quero comprar um sistema avulso do Balão");

type Sistema = { numero: string; nome: string; descricao: string };

const GRUPOS: { titulo: string; sistemas: Sistema[] }[] = [
  {
    titulo: "Atender e vender no WhatsApp",
    sistemas: [
      { numero: "01", nome: "CRM de WhatsApp com Kanban", descricao: "Conversas, clientes e etapas da venda num painel só, com senha." },
      { numero: "02", nome: "Disparo de ofertas com travas", descricao: "Intervalo aleatório, horário comercial, teto diário e saída automática de quem responde SAIR." },
      { numero: "03", nome: "Fila de mensagens com aprovação", descricao: "Você revisa e aprova antes de qualquer mensagem sair." },
      { numero: "04", nome: "Envio de produto pelo painel", descricao: "Busca no catálogo e manda produto e foto direto na conversa." },
    ],
  },
  {
    titulo: "Vender pela internet",
    sistemas: [
      { numero: "05", nome: "Loja virtual com carrinho", descricao: "Vitrine, página de produto, carrinho e checkout." },
      { numero: "06", nome: "PIX com código do pedido", descricao: "O QR Code sai do servidor já amarrado ao número do pedido." },
      { numero: "07", nome: "Preço por margem de categoria", descricao: "Calcula o preço a partir do custo, com teto de margem e piso de lucro." },
      { numero: "08", nome: "Painel da loja", descricao: "Produtos, banners, cupons e pedidos num lugar só." },
      { numero: "09", nome: "Loja de atacado e varejo", descricao: "Dois preços na mesma loja, com pedido mínimo e quantidade por caixa." },
    ],
  },
  {
    titulo: "Trazer cliente novo",
    sistemas: [
      { numero: "10", nome: "Captação de leads por cidade", descricao: "Lista os comércios da região num mapa, com nota de 0 a 100 para cada um." },
      { numero: "11", nome: "Site com SEO local", descricao: "Páginas por cidade e por produto, prontas para o Google encontrar." },
      { numero: "12", nome: "Posts de Instagram com IA", descricao: "Planeja os posts e gera as artes no seu computador, sem API paga. Pede placa de vídeo." },
    ],
  },
  {
    titulo: "Organizar a empresa",
    sistemas: [
      { numero: "13", nome: "Estoque por lote e validade", descricao: "A venda baixa primeiro o lote que vence antes." },
      { numero: "14", nome: "Contas a pagar e a receber", descricao: "Parcelas, vencidos e fluxo de caixa dos próximos 30 dias." },
      { numero: "15", nome: "Compras e recebimento", descricao: "A entrada da mercadoria atualiza o custo médio e gera a conta a pagar." },
      { numero: "16", nome: "Agenda, totem e painel de senhas", descricao: "O cliente retira a senha no totem e acompanha a chamada na TV." },
      { numero: "17", nome: "Documentos em PDF", descricao: "Gera os documentos do atendimento com os dados e a marca da empresa." },
      { numero: "18", nome: "Agente navegador supervisionado", descricao: "Navega, coleta dados e preenche formulários, e para antes de qualquer ação crítica." },
    ],
  },
];

const FATOS = [
  { valor: "25+ anos", rotulo: "vendendo tecnologia" },
  { valor: "18", rotulo: "sistemas prontos" },
  { valor: "R$ 97", rotulo: "pagamento único" },
  { valor: "7 dias", rotulo: "de garantia" },
];

const PASSOS = [
  { numero: "1", titulo: "Escolha", texto: "Um sistema avulso por R$ 29 ou o pacote com os 18 por R$ 97." },
  { numero: "2", titulo: "Receba", texto: "O código-fonte de cada sistema, com o guia de instalação." },
  { numero: "3", titulo: "Configure", texto: "Coloque o nome, a logo e os dados da sua empresa e comece a usar." },
];

const ORIGENS = [
  { nome: "Balão da Informática", setor: "Loja de informática", texto: "CRM de WhatsApp, disparo de ofertas, loja virtual e preço por margem." },
  { nome: "Doces Komilão", setor: "Distribuidora", texto: "Loja de atacado e varejo, captação de leads, estoque por validade e financeiro." },
  { nome: "H2 Medicina Ocupacional", setor: "Clínica", texto: "Agenda, totem, painel de senhas na TV e documentos em PDF." },
  { nome: "Herrera Materiais", setor: "Fábrica de blocos", texto: "Site com SEO local, com páginas por cidade e por produto." },
];

const DUVIDAS = [
  { pergunta: "É curso ou é sistema pronto?", resposta: "Sistema pronto. Você recebe o código-fonte e o guia de instalação, não horas de aula." },
  { pergunta: "Preciso saber programar?", resposta: "Para instalar, você segue o guia. Para mudar o sistema por dentro, ajuda ter alguém de TI ou uma IA de programação." },
  { pergunta: "Tem mensalidade?", resposta: "Não. O pagamento é único. Hospedagem, domínio e número de WhatsApp ficam por sua conta." },
  { pergunta: "Serve para o meu setor?", resposta: "Os sistemas nasceram em loja, distribuidora, clínica e fábrica. Atendimento, venda, estoque e financeiro funcionam igual em qualquer comércio." },
  { pergunta: "O disparo pode bloquear meu WhatsApp?", resposta: "Pode. As travas reduzem o risco, mas não eliminam. Para volume alto, o caminho certo é a API oficial do WhatsApp." },
  { pergunta: "E se eu não gostar?", resposta: "Você tem 7 dias para pedir o dinheiro de volta." },
];

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export default function SistemasDeIaPage() {
  return (
    <div className={`${styles.pagina} ${sora.variable} ${jakarta.variable}`}>
      <div className={`${styles.container} ${styles.topo}`}>
        <div className={styles.marca}>Balão da Informática</div>
        <a href={LINK_PACOTE} className={styles.botaoTopo}>
          Comprar por R$&nbsp;97
        </a>
      </div>

      <header className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrade}`}>
          <div className={styles.heroTexto}>
            <h1 className={styles.h1}>Não é curso. São 18 sistemas prontos para a sua empresa.</h1>
            <p className={styles.heroSub}>
              Atendimento no WhatsApp, loja virtual, estoque, financeiro e automações com inteligência artificial. Copie,
              configure e use.
            </p>
            <a href={LINK_PACOTE} className={`${styles.botaoBranco} ${styles.botaoHero}`}>
              Quero os 18 sistemas por R$&nbsp;97
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </a>
            <ul className={styles.selos}>
              <li><Check className={styles.checkPequeno} />Pagamento único</li>
              <li><Check className={styles.checkPequeno} />Código-fonte incluso</li>
              <li><Check className={styles.checkPequeno} />7 dias de garantia</li>
            </ul>
          </div>
          <div className={styles.heroImagem}>
            <Image
              src="/images/sistemasdeia/ia-hero.webp"
              alt="Chip de inteligência artificial em 3D ligado a telas de conversa, vendas e loja"
              width={1100}
              height={840}
              priority
              sizes="(max-width: 900px) 90vw, 540px"
            />
          </div>
        </div>
      </header>

      <section className={`${styles.container} ${styles.fatosSecao}`}>
        <ul className={styles.fatos}>
          {FATOS.map((fato) => (
            <li key={fato.rotulo} className={styles.fato}>
              <div className={styles.fatoValor}>{fato.valor}</div>
              <div className={styles.fatoRotulo}>{fato.rotulo}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.container} ${styles.sobre}`}>
        <div className={styles.sobreImagem}>
          <Image
            src="/images/sistemasdeia/ia-robot.webp"
            alt="Robô assistente em 3D com balões de conversa"
            width={900}
            height={710}
            sizes="(max-width: 900px) 90vw, 440px"
          />
        </div>
        <div className={styles.sobreTexto}>
          <h2 className={styles.h2Menor}>Feitos por lojista, para lojista.</h2>
          <p>
            O Balão da Informática vende tecnologia há mais de 25 anos e foi uma das pioneiras do e-commerce de
            informática no Brasil. Para tocar a operação, criamos nossos próprios sistemas de atendimento, loja, estoque
            e financeiro.
          </p>
          <p className={styles.forte}>
            Agora eles estão à venda para ajudar outros lojistas. E servem em qualquer setor: loja, clínica,
            distribuidora, prestador de serviço.
          </p>
        </div>
      </section>

      <section className={`${styles.container} ${styles.secao}`}>
        <h2 className={styles.h2}>Os 18 sistemas, um por um.</h2>
        <p className={styles.apoio}>
          Compre só o que precisa por R$&nbsp;29 cada, ou leve todos por R$&nbsp;97. Para pedir um avulso, diga o número
          dele no WhatsApp.
        </p>

        <div className={styles.grupos}>
          {GRUPOS.map((grupo) => (
            <div key={grupo.titulo} className={styles.grupo}>
              <div className={styles.grupoTopo}>
                <h3 className={styles.grupoTitulo}>{grupo.titulo}</h3>
                <span className={styles.etiqueta}>R$&nbsp;29 cada</span>
              </div>
              <ul>
                {grupo.sistemas.map((sistema) => (
                  <li key={sistema.numero} className={styles.sistema}>
                    <span className={styles.numero}>{sistema.numero}</span>
                    <div>
                      <div className={styles.sistemaNome}>{sistema.nome}</div>
                      <div className={styles.sistemaDescricao}>{sistema.descricao}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={styles.emBreve}>
          <strong>Em breve:</strong> URA de ligações ativas, ordem de serviço para assistência técnica e comissão de
          vendedores.
        </p>

        <div className={styles.faixa}>
          <div className={styles.faixaTexto}>
            <div className={styles.faixaTitulo}>Os 18 juntos saem por R$&nbsp;97.</div>
            <div className={styles.faixaSub}>Comprando um por um seriam R$&nbsp;522. Você economiza R$&nbsp;425.</div>
          </div>
          <a href={LINK_PACOTE} className={`${styles.botaoBranco} ${styles.botaoFaixa}`}>
            Quero o pacote completo
          </a>
        </div>
      </section>

      <section className={`${styles.container} ${styles.secao}`}>
        <h2 className={`${styles.h2} ${styles.h2ComEspaco}`}>3 passos. É só isso.</h2>
        <div className={styles.passos}>
          {PASSOS.map((passo) => (
            <div key={passo.numero} className={styles.passo}>
              <div className={styles.passoNumero}>{passo.numero}</div>
              <h3 className={styles.passoTitulo}>{passo.titulo}</h3>
              <p>{passo.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} ${styles.secao}`}>
        <h2 className={styles.h2}>Onde esses sistemas nasceram.</h2>
        <p className={`${styles.apoio} ${styles.apoioComEspaco}`}>
          Cada um foi feito para resolver o problema de uma empresa real, em setores diferentes.
        </p>
        <div className={styles.origens}>
          {ORIGENS.map((origem) => (
            <div key={origem.nome} className={styles.origem}>
              <h3 className={styles.origemNome}>{origem.nome}</h3>
              <div className={styles.origemSetor}>{origem.setor}</div>
              <p>{origem.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} ${styles.secao}`}>
        <h2 className={`${styles.h2} ${styles.h2ComEspaco}`}>Escolha como quer levar.</h2>
        <div className={styles.planos}>
          <div className={styles.plano}>
            <h3 className={styles.planoTitulo}>Sistema avulso</h3>
            <div className={styles.planoSub}>1 sistema à sua escolha</div>
            <div className={styles.planoPreco}>R$&nbsp;29</div>
            <div className={styles.planoNota}>pagamento único</div>
            <ul className={styles.planoLista}>
              <li><Check className={styles.checkVermelho} />Código-fonte do sistema escolhido</li>
              <li><Check className={styles.checkVermelho} />Guia de instalação</li>
              <li><Check className={styles.checkVermelho} />7 dias de garantia</li>
            </ul>
            <a href={LINK_AVULSO} className={styles.botaoContorno}>
              Quero um sistema avulso
            </a>
          </div>

          <div className={`${styles.plano} ${styles.planoDestaque}`}>
            <div className={styles.planoTopo}>
              <h3 className={styles.planoTitulo}>Pacote completo</h3>
              <span className={styles.etiquetaBranca}>Mais vantajoso</span>
            </div>
            <div className={styles.planoSub}>Os 18 sistemas</div>
            <div className={styles.planoPrecoLinha}>
              <div className={`${styles.planoPreco} ${styles.planoPrecoGrande}`}>R$&nbsp;97</div>
              <div className={styles.planoDe}>
                de <s>R$&nbsp;522</s>
              </div>
            </div>
            <div className={styles.planoNota}>pagamento único · você economiza R$&nbsp;425</div>
            <ul className={styles.planoLista}>
              <li><Check />Os 18 sistemas com código-fonte</li>
              <li><Check />Guia de instalação de cada um</li>
              <li><Check />Uso com a sua marca: nome, logo e cores</li>
              <li><Check />7 dias de garantia</li>
            </ul>
            <a href={LINK_PACOTE} className={`${styles.botaoBranco} ${styles.botaoPlano}`}>
              Quero os 18 sistemas por R$&nbsp;97
            </a>
          </div>
        </div>

        <div className={styles.garantia}>
          <Image
            className={styles.garantiaImagem}
            src="/images/sistemasdeia/ia-shield.webp"
            alt="Escudo de garantia em 3D"
            width={700}
            height={859}
            sizes="124px"
          />
          <div className={styles.garantiaTexto}>
            <h3 className={styles.garantiaTitulo}>Garantia de 7 dias.</h3>
            <p>Comprou e não era o que você esperava? Peça em até 7 dias e devolvemos o seu dinheiro.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.container} ${styles.secao} ${styles.secaoFinal}`}>
        <h2 className={`${styles.h2} ${styles.h2ComEspaco}`}>Dúvidas que todo mundo tem.</h2>
        <div className={styles.duvidas}>
          {DUVIDAS.map((duvida) => (
            <div key={duvida.pergunta} className={styles.duvida}>
              <h3 className={styles.duvidaPergunta}>{duvida.pergunta}</h3>
              <p>{duvida.resposta}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.rodape}>
        <div className={`${styles.container} ${styles.rodapeConteudo}`}>
          <div className={styles.rodapeMarca}>Balão da Informática</div>
          <div>{SITE_CONFIG.addressShort} · Campinas/SP · www.balao.info</div>
          <div className={styles.rodapeAviso}>
            Este produto não garante resultado financeiro. O resultado depende de como você usa cada sistema.
          </div>
        </div>
      </footer>

      <div className={styles.barraFixa}>
        <div className={`${styles.container} ${styles.barraConteudo}`}>
          <div className={styles.barraTexto}>
            <div className={styles.barraTitulo}>18 sistemas por R$&nbsp;97</div>
            <div className={styles.barraSub}>pagamento único · 7 dias de garantia</div>
          </div>
          <a href={LINK_PACOTE} className={styles.botaoBarra}>
            Quero agora
          </a>
        </div>
      </div>
    </div>
  );
}
