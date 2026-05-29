import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { getProducts } from "@/lib/db";
import type { Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Premium | PCs de Alta Performance e Montagem Profissional",
  description:
    "Linha Premium do Balão da Informática: PCs gamer, workstations e máquinas sob medida com montagem profissional, testes completos e suporte real em Campinas.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Premium | Balão da Informática",
    description:
      "PCs premium montados por especialistas. Escolha uma máquina em estoque ou peça um projeto sob medida via WhatsApp.",
    type: "website",
    url: "https://www.balao.info/premium",
  },
};

export const dynamic = "force-dynamic";

function normalize(text: string) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parsePriceBRL(price: string): number {
  const raw = (price || "").toString();
  const cleaned = raw
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

function ProductTile({
  product,
  eyebrow,
}: {
  product: Product;
  eyebrow?: string;
}) {
  const href = `/product/${product.id}`;
  const imgSrc = product.image || "/logo.png";
  const priceNum = parsePriceBRL(product.price);
  const priceLabel = priceNum > 0 ? formatCurrency(priceNum) : product.price || "Consultar";

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur transition-all hover:border-white/20 hover:-translate-y-0.5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-5 sm:p-6 flex flex-col gap-4">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-900 p-3 sm:p-4">
          <Image
            src={imgSrc}
            alt={product.name || "Produto"}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="flex flex-col gap-2">
          {eyebrow ? (
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {eyebrow}
            </div>
          ) : null}
          <div className="text-lg sm:text-xl font-black tracking-tight text-white line-clamp-2">
            {product.name}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-zinc-400 text-sm line-clamp-1">{product.category}</div>
            <div className="text-white font-black">{priceLabel}</div>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-zinc-400">Ver detalhes</span>
          <ArrowRight className="w-4 h-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

export default async function PremiumPage() {
  const products = await getProducts();
  const pcGamerOnly = products.filter((p) => {
    const t = normalize(`${p?.name || ""} ${p?.category || ""}`);
    return t.includes("pc gamer") || t.includes("pcgamer");
  });
  const sorted = [...pcGamerOnly].sort((a, b) => {
    const priceA = parsePriceBRL(a.price);
    const priceB = parsePriceBRL(b.price);
    if (priceA === 0 && priceB === 0) return 0;
    if (priceA === 0) return 1;
    if (priceB === 0) return -1;
    return priceB - priceA;
  });
  const featured = sorted.slice(0, 5);
  const stock = sorted.slice(5, 17);

  const whatsAppDefault = buildWhatsAppLink(
    "Olá! Quero montar um PC Premium no Balão da Informática. Pode me ajudar com uma configuração ideal para meu uso e orçamento?"
  );

  return (
    <div className="bg-black text-white">
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(230,0,18,0.20),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(167,139,250,0.18),transparent_45%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        <div className="container mx-auto px-4 py-14 sm:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="w-4 h-4 text-white/80" />
                Montagem premium em Campinas/SP
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                Seu PC{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Premium
                </span>{" "}
                começa aqui.
              </h1>

              <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-xl">
                Escolha uma máquina do nosso estoque ou peça um projeto sob medida. Montagem profissional, testes completos
                e suporte de verdade.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#estoque"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-6 py-3 font-black tracking-tight hover:bg-zinc-200 transition-colors"
                >
                  Ver PCs em estoque
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href={whatsAppDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-black tracking-tight hover:bg-white/10 transition-colors"
                >
                  Falar no WhatsApp
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: BadgeCheck, title: "Acabamento premium", desc: "Cable management e estética impecável." },
                  { icon: ShieldCheck, title: "Testes completos", desc: "Validação de estabilidade antes da entrega." },
                  { icon: Wrench, title: "Projeto sob medida", desc: "Compatibilidade e upgrades planejados." },
                  { icon: PackageCheck, title: "Loja física", desc: "Campinas com suporte e pós-venda." },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-white/80" />
                      <div className="text-sm font-black">{item.title}</div>
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              {featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featured.map((p, idx) => (
                    <div key={p.id} className={idx === 0 ? "sm:col-span-2" : ""}>
                      <ProductTile product={p} eyebrow={idx === 0 ? "PC gamer premium" : "PC gamer"} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                  <div className="text-2xl font-black tracking-tight">Sem PCs gamer cadastrados</div>
                  <div className="text-sm text-zinc-300 mt-2 leading-relaxed">
                    Cadastre produtos com a categoria ou nome contendo “PC Gamer” para aparecerem aqui, do mais caro para
                    o mais barato.
                  </div>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/admin/produtos"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-6 py-3 font-black hover:bg-zinc-200 transition-colors"
                    >
                      Cadastrar produtos
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                      href={whatsAppDefault}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-black hover:bg-white/10 transition-colors"
                    >
                      Pedir orçamento
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-sm font-black tracking-tight">Quer um projeto único?</div>
                    <div className="text-sm text-zinc-300">
                      Diga seu uso e orçamento. A gente monta uma proposta com peças do nosso estoque.
                    </div>
                  </div>
                  <a
                    href={buildWhatsAppLink(
                      "Olá! Quero um projeto exclusivo Premium. Meu uso é: (jogos/trabalho/edição). Meu orçamento é: (R$). Pode montar uma proposta com peças do estoque?"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-3 font-black hover:bg-red-700 transition-colors"
                  >
                    Montar comigo
                    <Cpu className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="estoque" className="py-14 sm:py-20 bg-zinc-950 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Seu próximo PC</div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Destaques do estoque</h2>
            </div>
            <Link
              href="/pcgamer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-black hover:bg-white/10 transition-colors"
            >
              Ver PC Gamer
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stock.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-lg font-black">Não achou o ideal?</div>
                <div className="text-sm text-zinc-300">
                  A gente monta um PC Premium com as peças certas para seu uso e orçamento.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/monteseupc"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-6 py-3 font-black hover:bg-zinc-200 transition-colors"
                >
                  Montar agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={whatsAppDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-black hover:bg-white/10 transition-colors"
                >
                  Orçar no WhatsApp
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-black border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Linhas premium</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Escolha a base. Personalize o resto.</h2>
            <p className="text-zinc-300 mt-3 max-w-3xl mx-auto">
              Quatro linhas autorais do Balão da Informática para acelerar sua escolha. Depois, ajustamos com peças do
              nosso estoque, do seu jeito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Balão Gamer",
                desc: "FPS alto, visual gamer e upgrades planejados. Ideal para quem joga competitivo e quer um setup bonito.",
                cta: "Quero um PC Gamer Premium",
              },
              {
                title: "Balão Workstation",
                desc: "Estabilidade e performance para AutoCAD, Revit, render e produtividade. Configuração pensada para trabalho.",
                cta: "Quero uma Workstation Premium",
              },
              {
                title: "Balão Creator",
                desc: "Edição, lives e criação de conteúdo com fluidez. Peças selecionadas para multitarefa e exportação rápida.",
                cta: "Quero um PC Creator Premium",
              },
              {
                title: "Balão Extreme",
                desc: "Projeto exclusivo para quem quer o máximo: potência, acabamento e estética de vitrine.",
                cta: "Quero um projeto Extreme",
              },
            ].map((line) => (
              <div
                key={line.title}
                className="rounded-3xl border border-white/10 bg-zinc-950 p-6 hover:border-white/20 transition-colors"
              >
                <div className="text-xl font-black tracking-tight">{line.title}</div>
                <div className="text-sm text-zinc-300 mt-2 leading-relaxed">{line.desc}</div>
                <a
                  href={buildWhatsAppLink(
                    `Olá! ${line.cta} no Balão da Informática. Meu uso é: (jogos/trabalho/edição). Meu orçamento é: (R$). Pode sugerir uma configuração com peças do estoque?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white text-black px-5 py-3 font-black hover:bg-zinc-200 transition-colors w-full justify-center"
                >
                  Orçar agora
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-zinc-950 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Processo premium</div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
                Montagem profissional, do primeiro orçamento ao pós-venda.
              </h2>
              <p className="text-zinc-300 mt-4 leading-relaxed">
                Você não compra só peças. Você recebe uma máquina pronta, validada e acompanhada por quem monta e dá
                suporte.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Entendimento do uso",
                  desc: "Jogos, trabalho ou criação. A configuração nasce do seu objetivo, não de um template genérico.",
                },
                {
                  title: "Peças do estoque",
                  desc: "Priorizamos disponibilidade e custo-benefício, com alternativas equivalentes quando necessário.",
                },
                {
                  title: "Montagem e acabamento",
                  desc: "Organização, airflow e estética. Sem improviso, sem gambiarra.",
                },
                {
                  title: "Testes e validação",
                  desc: "Estabilidade antes de entregar. O objetivo é ligar e usar sem dor de cabeça.",
                },
              ].map((step, idx) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-white/10 bg-black p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black tracking-tight">{step.title}</div>
                    <div className="text-xs font-black text-white/70 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-300 mt-3 leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-black border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">FAQ</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Dúvidas rápidas</h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-white/10 rounded-3xl border border-white/10 bg-zinc-950 overflow-hidden">
            {[
              {
                q: "Os produtos mostrados aqui são do meu estoque do site?",
                a: "Sim. Esta página lista produtos carregados do mesmo catálogo do site. Se você cadastrar/atualizar no painel, aqui atualiza junto.",
              },
              {
                q: "Posso pedir um PC sob medida mesmo escolhendo um destaque?",
                a: "Pode. Os destaques servem como base. A gente ajusta peça por peça conforme seu uso, estética e orçamento.",
              },
              {
                q: "Vocês verificam compatibilidade e estabilidade?",
                a: "Sim. A proposta passa por validação de compatibilidade e a montagem passa por testes antes da entrega.",
              },
              {
                q: "Entregam só em Campinas?",
                a: "Atendemos Campinas e região, e também enviamos para outras cidades. O melhor caminho é falar no WhatsApp para validar entrega e prazo.",
              },
            ].map((item) => (
              <details key={item.q} className="group p-6">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <div className="text-lg font-black">{item.q}</div>
                  <div className="text-white/70 group-open:rotate-45 transition-transform">+</div>
                </summary>
                <div className="mt-3 text-zinc-300 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-zinc-950 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)] p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Último passo</div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
                  Bora montar sua próxima máquina?
                </h2>
                <p className="text-zinc-300 mt-3 max-w-2xl leading-relaxed">
                  Fale com um especialista e receba uma proposta coerente com seu uso, seu orçamento e as peças do nosso
                  estoque.
                </p>
              </div>
              <a
                href={whatsAppDefault}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-8 py-4 font-black text-lg hover:bg-red-700 transition-colors"
              >
                Chamar no WhatsApp
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
