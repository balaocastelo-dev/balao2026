import Link from "next/link";
import Image from "next/image";
import { listVitrinePagesPublic } from "@/lib/vitrine/db";
import { pickPcHeroImage } from "@/lib/vitrine/core";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

function parsePriceToNumber(text: string): number {
  const raw = String(text || "").trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/R\$/gi, "").replace(/\s/g, "").replace(/[^\d,.\-]/g, "");
  if (!cleaned) return 0;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  let normalizedNum = cleaned;
  if (hasComma && hasDot) normalizedNum = cleaned.replace(/\./g, "").replace(",", ".");
  else if (hasComma && !hasDot) normalizedNum = cleaned.replace(",", ".");
  const n = Number.parseFloat(normalizedNum);
  return Number.isFinite(n) ? n : 0;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function priceTextFromRecord(p: any) {
  const extras = p?.extras && typeof p.extras === "object" ? p.extras : {};
  const direct = String(extras?.price_text || "").trim();
  if (direct) return direct;
  const mainPrice = extras?.main_product?.price ? String(extras.main_product.price).trim() : "";
  return mainPrice || "Sob consulta";
}

export default async function VitrineIndexPage() {
  const pages = await listVitrinePagesPublic().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Vitrine</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">Minhas páginas • Links em /p/&lt;slug&gt;</p>
        </div>
        <Link
          href="/gerador"
          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-[#E60012] text-white font-extrabold shadow-sm hover:bg-red-700"
        >
          Ir para o Gerador
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((p) => {
          const hero = (p as any)?.images?.hero || pickPcHeroImage({ categoria: p.categoria } as any);
          const priceText = priceTextFromRecord(p as any);
          const n = parsePriceToNumber(priceText);
          const installment = n ? `12x de ${formatBRL(n / 12)} sem juros` : null;
          const pix = n ? `no Pix: ${formatBRL(n * 0.95)} (5% off)` : null;
          const shareUrl = `https://www.balao.info/p/${p.slug}`;
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <Link href={`/p/${p.slug}`} className="block p-5 group">
                <div className="w-full h-44 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  <Image src={hero} alt="" width={480} height={320} className="w-full h-full object-contain" />
                </div>
                <div className="mt-4">
                  <div className="text-lg font-extrabold text-gray-900 group-hover:text-[#d71920] transition-colors">
                    {p.nome_pc}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{p.categoria}</div>
                </div>
              </Link>

              <div className="px-5 pb-5">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-center">
                  <div className="text-base font-extrabold text-[#d71920]">{priceText}</div>
                  {installment ? <div className="mt-1 text-xs font-bold text-gray-700">{installment}</div> : null}
                  {pix ? <div className="mt-1 text-xs font-bold text-gray-700">{pix}</div> : null}
                </div>

                <div className="mt-3 flex items-center justify-center">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <ShareButton title={String(p.nome_pc || "")} text="" url={shareUrl} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pages.length === 0 && (
        <div className="mt-10 text-center text-gray-600">
          Nenhuma página publicada ainda.
        </div>
      )}
    </div>
  );
}
