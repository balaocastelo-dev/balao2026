import Link from "next/link";
import Image from "next/image";
import { listVitrinePagesPublic } from "@/lib/vitrine/db";
import { pickPcHeroImage } from "@/lib/vitrine/core";

export const dynamic = "force-dynamic";

export default async function VitrineIndexPage() {
  const pages = await listVitrinePagesPublic().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Vitrine
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Páginas exclusivas de PCs selecionados pela Balão da Informática.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((p) => {
          const hero = pickPcHeroImage({ categoria: p.categoria } as any);
          return (
            <Link
              key={p.id}
              href={`/vitrine/${p.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-5">
                <div className="w-full h-44 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  <Image src={hero} alt="" width={480} height={320} className="w-full h-full object-contain" />
                </div>

                <div className="mt-4">
                  <div className="text-lg font-extrabold text-gray-900 group-hover:text-[#d71920] transition-colors">
                    {p.nome_pc}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{p.categoria}</div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#d71920]">
                    Ver detalhes
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </Link>
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
