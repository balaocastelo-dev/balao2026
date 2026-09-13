import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import JsonLd, { generateHomeAiAndGoogleSchema } from "@/components/JsonLd";
import { getCachedProducts } from "@/lib/cache";
import { SITE_CONFIG } from "@/lib/config";
import type { Product } from "@/lib/utils";
import {
  MessageCircle, MapPin, Clock, ShieldCheck, Wrench, HardDrive,
  Apple, Smartphone, Cpu, RefreshCw, ArrowRight, Check, X, Store, Star,
} from "lucide-react";

export const revalidate = 60;

/* ------------------------------------------------------------------ *
 * PENDENTE DE CONFIRMAÇÃO DO THIAGO
 * Preencher com o que aparece HOJE no perfil do Google. Enquanto for
 * null, a home simplesmente não exibe o número — melhor omitir do que
 * publicar uma contagem que o cliente confere e não bate.
 * ------------------------------------------------------------------ */
const PROVA_SOCIAL = {
  googleNota: 4.8 as number | null,
  googleAvaliacoes: 839 as number | null,
  anosDeMercado: 25,
  instagramSeguidores: "20 mil",
};

/* Avaliações públicas do perfil do Google, transcritas literalmente.
 * Só entram aqui depoimentos reais e verificáveis — nada reescrito. */
const AVALIACOES = [
  {
    nome: "José Paulo Olímpio",
    quando: "3 meses atrás",
    texto:
      "Levei minha impressora toda falhada, até achei que não tinha conserto. Porém voltou consertada e funcionando perfeitamente, paguei apenas a mão de obra. Recomendo.",
  },
  {
    nome: "Caroline Bianca",
    quando: "3 meses atrás",
    texto:
      "Resolveram em 1 hora meu problema! Precisei de uma nova fonte de computador, em 1 horinha recebi. Excelente atendimento.",
  },
  {
    nome: "Winderson Oliveira",
    quando: "3 meses atrás",
    texto:
      "Precisei de um adaptador de rede com certa urgência e fui muito bem atendido pela equipe. Foram atenciosos, prestativos e ainda fizeram a entrega diretamente no meu trabalho.",
  },
  {
    nome: "Gilberto Filho",
    quando: "3 meses atrás",
    texto:
      "Loja top, preços justos, atendimento ótimo, Thiago e sua equipe são muito prestativos, super recomendo.",
  },
];

/* Fotos reais da loja. Vazio = a seção usa um bloco neutro em vez de
 * imagem de IA. Render de IA contradiz o argumento "loja física real". */
const FOTOS_LOJA: { src: string; alt: string }[] = [];

const WPP = SITE_CONFIG.whatsapp.number;
const wpp = (msg: string) => `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`;

const SERVICOS = [
  { icone: Apple, titulo: "Reparo Apple", desc: "MacBook, iMac, iPad e Apple Watch. Diagnóstico na bancada, não por telefone.", href: "/reparoapple", msg: "Olá! Preciso de reparo em um aparelho Apple." },
  { icone: HardDrive, titulo: "Recuperação de dados", desc: "HD que não liga, SSD que sumiu, pendrive corrompido. Avaliação antes de cobrar.", href: "/recuperacaodados", msg: "Olá! Preciso recuperar dados de um disco." },
  { icone: Smartphone, titulo: "Troca de tela e bateria", desc: "iPhone e notebook. Preço fechado antes do serviço, sem surpresa no balcão.", href: "/telaiphone", msg: "Olá! Quero orçamento de troca de tela." },
  { icone: Cpu, titulo: "Montagem e upgrade de PC", desc: "Você escolhe o uso e o orçamento; a gente monta, testa e entrega funcionando.", href: "/montagempc", msg: "Olá! Quero montar um PC sob medida." },
  { icone: Wrench, titulo: "Manutenção", desc: "PC lento, esquentando ou travando. Limpeza, pasta térmica e troca de peça.", href: "/manutencao", msg: "Olá! Meu computador está com problema." },
  { icone: RefreshCw, titulo: "Seminovos e consignação", desc: "Compramos, vendemos e deixamos o seu à venda na loja, com garantia.", href: "/seminovos", msg: "Olá! Quero saber sobre seminovos/consignação." },
];

const COMPARATIVO = [
  { ponto: "Ver o equipamento ligado antes de pagar", loja: true, online: false },
  { ponto: "Retirar hoje, sem esperar frete", loja: true, online: false },
  { ponto: "Falar com uma pessoa, não com um robô", loja: true, online: false },
  { ponto: "Levar de volta se der problema", loja: true, online: false },
  { ponto: "Serviço técnico no mesmo lugar da compra", loja: true, online: false },
  { ponto: "Configuração feita para o seu uso", loja: true, online: false },
];

export const metadata: Metadata = {
  title: "Loja de Informática no Cambuí, Campinas | Balão da Informática",
  description:
    "Loja física no Cambuí: você vê o equipamento ligado antes de pagar e retira na hora. Assistência técnica, reparo Apple, recuperação de dados, montagem de PC e atendimento humano no WhatsApp.",
  alternates: { canonical: "https://www.balao.info" },
  openGraph: {
    title: "Balão da Informática | Loja física no Cambuí, Campinas",
    description:
      "Equipamento ligado na sua frente antes de pagar, assistência técnica no mesmo lugar e atendimento humano no WhatsApp.",
    url: "https://www.balao.info",
    type: "website",
  },
};

export default async function Home() {
  let produtos: Product[] = [];
  try {
    produtos = (await getCachedProducts()).slice(0, 8);
  } catch {
    produtos = [];
  }

  const temProvaGoogle =
    PROVA_SOCIAL.googleNota !== null && PROVA_SOCIAL.googleAvaliacoes !== null;

  return (
    <div data-home-theme="light" className="bg-white">
      <JsonLd data={generateHomeAiAndGoogleSchema()} />
      <Header />

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E60012]/20 bg-[#E60012]/5 px-3 py-1 text-xs font-semibold text-[#E60012]">
            <Store size={14} /> Loja física no Cambuí — Av. Anchieta, 789
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 md:text-6xl">
            Você vê o computador{" "}
            <span className="text-[#E60012]">ligado na sua frente</span>{" "}
            antes de pagar.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Loja de 300 m² no Cambuí, em Campinas há {PROVA_SOCIAL.anosDeMercado} anos.
            Compra, assistência técnica e pós-venda no mesmo balcão — com uma pessoa
            do outro lado do WhatsApp, não um formulário de chamado.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={wpp(SITE_CONFIG.whatsapp.messageDefault)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:brightness-95"
            >
              <MessageCircle size={20} /> Falar com a loja agora
            </a>
            <a
              href={SITE_CONFIG.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 px-6 py-4 text-base font-bold text-neutral-800 transition hover:border-neutral-900"
            >
              <MapPin size={20} /> Como chegar
            </a>
          </div>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 border-t border-neutral-100 pt-8 md:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Na região desde</dt>
              <dd className="mt-1 text-2xl font-bold text-neutral-900">1999</dd>
            </div>
            {temProvaGoogle && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-neutral-500">Google</dt>
                <dd className="mt-1 text-2xl font-bold text-neutral-900">
                  {String(PROVA_SOCIAL.googleNota).replace(".", ",")}
                  <span className="ml-1 text-sm font-normal text-neutral-500">
                    · {PROVA_SOCIAL.googleAvaliacoes} avaliações
                  </span>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Retirada</dt>
              <dd className="mt-1 text-2xl font-bold text-neutral-900">No mesmo dia</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Atendimento</dt>
              <dd className="mt-1 text-2xl font-bold text-neutral-900">Humano</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ========================== SERVIÇOS ========================== */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
            O que a loja da esquina faz e o site grande não faz
          </h2>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Serviço técnico é o motivo de existir uma loja física. Todos abaixo
            são feitos aqui no Cambuí, por gente que você conhece pelo nome.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICOS.map((s) => {
              const Icone = s.icone;
              return (
                <div
                  key={s.titulo}
                  className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-[#E60012]/40 hover:shadow-lg"
                >
                  <Icone size={24} className="text-[#E60012]" />
                  <h3 className="mt-4 text-lg font-bold text-neutral-900">{s.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{s.desc}</p>
                  <div className="mt-5 flex items-center gap-4">
                    <a
                      href={wpp(s.msg)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#25D366] hover:underline"
                    >
                      <MessageCircle size={16} /> Chamar no WhatsApp
                    </a>
                    <Link
                      href={s.href}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-900"
                    >
                      Detalhes <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================= COMPARATIVO ======================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
            Quando vale a pena comprar aqui
          </h2>
          <p className="mt-3 text-neutral-600">
            Comprar em site grande faz sentido quando você já sabe exatamente o
            que quer e não tem pressa. Fora isso, a conta muda:
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200">
            <div className="grid grid-cols-[1fr_auto_auto] gap-px bg-neutral-200 text-sm">
              <div className="bg-neutral-50 px-5 py-3 font-semibold text-neutral-500" />
              <div className="bg-neutral-50 px-4 py-3 text-center font-bold text-[#E60012]">Balão</div>
              <div className="bg-neutral-50 px-4 py-3 text-center font-semibold text-neutral-500">Só online</div>
              {COMPARATIVO.map((l) => (
                <div key={l.ponto} className="contents">
                  <div className="bg-white px-5 py-4 text-neutral-800">{l.ponto}</div>
                  <div className="flex items-center justify-center bg-white px-4 py-4">
                    {l.loja ? <Check size={18} className="text-[#25D366]" /> : <X size={18} className="text-neutral-300" />}
                  </div>
                  <div className="flex items-center justify-center bg-white px-4 py-4">
                    {l.online ? <Check size={18} className="text-[#25D366]" /> : <X size={18} className="text-neutral-300" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= COMO FUNCIONA ====================== */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Como funciona</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Você chama no WhatsApp", d: "Conta o que precisa. Responde uma pessoa da loja, no horário comercial." },
              { n: "2", t: "A gente confere e orça", d: "Estoque, prazo e preço fechado antes de qualquer serviço começar." },
              { n: "3", t: "Retira no Cambuí ou recebe", d: "Entrega no mesmo dia em Campinas e região, ou retirada no balcão." },
            ].map((p) => (
              <li key={p.n} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E60012] text-sm font-bold text-white">{p.n}</span>
                <h3 className="mt-4 font-bold text-neutral-900">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =========================== PRODUTOS ========================= */}
      {produtos.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Em destaque</h2>
              <Link href="/vitrine" className="inline-flex items-center gap-1 text-sm font-bold text-[#E60012] hover:underline">
                Ver a vitrine <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {produtos.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <p className="mt-6 text-sm text-neutral-500">
              Não achou o que procura?{" "}
              <a href={wpp("Olá! Procuro um produto que não achei no site.")} className="font-semibold text-[#25D366] hover:underline">
                Pergunta no WhatsApp
              </a>{" "}
              — boa parte do estoque não está publicada.
            </p>
          </div>
        </section>
      )}

      {/* ========================= AVALIAÇÕES ========================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              O que os clientes escreveram
            </h2>
            {temProvaGoogle && (
              <p className="text-sm text-neutral-500">
                <span className="font-bold text-neutral-900">
                  {String(PROVA_SOCIAL.googleNota).replace(".", ",")}
                </span>{" "}
                de 5 em {PROVA_SOCIAL.googleAvaliacoes} avaliações no Google
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {AVALIACOES.map((a) => (
              <figure key={a.nome} className="rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex gap-0.5 text-[#E60012]" aria-label="5 de 5 estrelas">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mt-4 text-[15px] leading-relaxed text-neutral-700">
                  “{a.texto}”
                </blockquote>
                <figcaption className="mt-4 text-sm text-neutral-500">
                  <span className="font-semibold text-neutral-900">{a.nome}</span> · {a.quando} · Google
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== LOJA FÍSICA ======================= */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Passa aqui</h2>
            <p className="mt-3 text-neutral-600">
              Tem café, tem bancada e tem gente pra explicar sem pressa.
            </p>
            <ul className="mt-8 space-y-5">
              <li className="flex gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0 text-[#E60012]" />
                <div>
                  <p className="font-semibold text-neutral-900">{SITE_CONFIG.address}</p>
                  <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#E60012] hover:underline">
                    Abrir no Google Maps
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-[#E60012]" />
                <p className="text-neutral-800">{SITE_CONFIG.openingHoursDisplay}</p>
              </li>
              <li className="flex gap-3">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#E60012]" />
                <p className="text-neutral-800">
                  CNPJ {SITE_CONFIG.cnpj} — nota fiscal em toda compra e serviço.
                </p>
              </li>
            </ul>
            <a
              href={wpp("Olá! Queria confirmar se vocês estão abertos agora.")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:brightness-95"
            >
              <MessageCircle size={20} /> Falar com a loja
            </a>
          </div>

          <div>
            {FOTOS_LOJA.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {FOTOS_LOJA.map((f) => (
                  <div key={f.src} className="relative aspect-square overflow-hidden rounded-2xl">
                    <Image src={f.src} alt={f.alt} fill className="object-cover" sizes="(max-width:768px) 50vw, 300px" />
                  </div>
                ))}
              </div>
            ) : (
              /* Sem foto real ainda. Bloco neutro em vez de render de IA:
                 imagem gerada contradiz o argumento de loja física. */
              <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-8 text-center">
                <p className="max-w-xs text-sm text-neutral-400">
                  Espaço reservado para as fotos e vídeos reais da loja.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================= */}
      <section className="bg-[#E60012]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Descreve o problema. A gente responde.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Orçamento de serviço, consulta de estoque ou ajuda pra escolher —
            tudo pelo mesmo número.
          </p>
          <a
            href={wpp(SITE_CONFIG.whatsapp.messageDefault)}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#E60012] shadow-xl transition hover:bg-neutral-50"
          >
            <MessageCircle size={20} /> {SITE_CONFIG.whatsapp.display}
          </a>
        </div>
      </section>
    </div>
  );
}
