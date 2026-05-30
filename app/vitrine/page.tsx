import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { listVitrinePagesPublic } from "@/lib/vitrine/db";
import { pickPcHeroImage } from "@/lib/vitrine/core";

export const dynamic = "force-dynamic";

function priceTextFromRecord(p: any) {
  const extras = p?.extras && typeof p.extras === "object" ? p.extras : {};
  const direct = String(extras?.price_text || "").trim();
  if (direct) return direct;
  const mainPrice = extras?.main_product?.price ? String(extras.main_product.price).trim() : "";
  return mainPrice || "Sob consulta";
}

export default async function VitrinePage() {
  const pages = await listVitrinePagesPublic().catch(() => []);

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Vitrine</h1>
            <p className="mt-2 text-sm text-gray-600">Páginas criadas no gerador</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((p) => {
            const hero = (p as any)?.images?.hero || pickPcHeroImage({ categoria: p.categoria } as any);
            const priceText = priceTextFromRecord(p as any);
            return (
              <Link
                key={p.id}
                href={`/p/${p.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  <div className="w-full h-48 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                    <Image src={hero} alt="" width={900} height={700} className="w-full h-full object-contain" />
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-extrabold text-gray-900 whitespace-normal break-words group-hover:text-[#E60012] transition-colors">
                      {p.nome_pc}
                    </div>
                    <div className="mt-2 text-lg font-extrabold text-[#E60012]">{priceText}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {pages.length === 0 ? <div className="mt-10 text-center text-gray-600">Nenhuma página publicada ainda.</div> : null}
      </div>
    </div>
  );
}
