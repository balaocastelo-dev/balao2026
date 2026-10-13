import Link from "next/link";
import { MessageCircle } from "lucide-react";
import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import SecaoEspecial from "@/components/landing/SecaoEspecial";
import FileiraDeProdutos from "@/components/catalogo/FileiraDeProdutos";
import { getCachedCategories, getCachedVitrinePcGamer } from "@/lib/cache";
import { RAIZ_PC_GAMER } from "@/lib/catalogo/pc-gamer";
import { SITE_CONFIG } from "@/lib/config";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/pcgamer.ts. As dez fileiras de PC gamer
// (lib/catalogo/pc-gamer.ts, pedido do Thiago em 11/10) continuam as mesmas:
// só PC gamer, separado por placa de vídeo, setups, Ryzen e elite.
export const revalidate = 300;

const pagina = paginaPorSlug("pcgamer");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  const [dados, vitrine, categorias] = await Promise.all([
    carregarDadosDaPagina(pagina),
    getCachedVitrinePcGamer().catch(() => ({ fileiras: [], total: 0 })),
    getCachedCategories().catch(() => []),
  ]);

  const fileiras = vitrine.fileiras;
  const slug = categorias.find((c) => c.full_path === RAIZ_PC_GAMER)?.slug || "computadores-pc-pc-gamer";
  // No topo flutuam as máquinas das últimas fileiras (as mais fortes).
  const destaques = [...fileiras].reverse().flatMap((f) => f.produtos.slice(0, 2));

  const blocoDasFileiras = (
    <SecaoEspecial
      id="vitrine"
      titulo="Escolha pela placa de vídeo, pelo processador ou pelo setup"
      texto="Só PC gamer, do básico ao de elite. Cada fileira junta as máquinas de uma faixa; toque no PC para ver a ficha completa."
    >
      {fileiras.length > 0 ? (
        <>
          <nav aria-label="Fileiras de PC gamer" className="mb-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {fileiras.map((f, i) => (
              <a key={f.id} href={`#fileira-${f.id}`} className="cpt-marca shrink-0 whitespace-nowrap hover:border-white">
                {i + 1}. {f.titulo}
              </a>
            ))}
          </nav>
          <div className="space-y-12 sm:space-y-16">
            {fileiras.map((f, i) => (
              <FileiraDeProdutos key={f.id} id={`fileira-${f.id}`} numero={i + 1} titulo={f.titulo} subtitulo={f.subtitulo} produtos={f.produtos} />
            ))}
          </div>
          <Link href={`/categoria/${slug}`} className="cpt-botao cpt-botao--linha mt-12">
            Ver os {vitrine.total.toLocaleString("pt-BR")} PCs gamer, com filtros por marca e preço
          </Link>
        </>
      ) : (
        <div className="rounded-[20px] border border-[var(--cpt-fio)] p-6 sm:p-8">
          <p className="cpt-corpo">Os PCs gamer não carregaram agora. Chame no WhatsApp e mandamos as configurações e os preços.</p>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Quero ver os PCs gamer disponíveis na Balão.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cpt-botao cpt-botao--acao mt-5"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Ver PCs gamer no WhatsApp
          </a>
        </div>
      )}
    </SecaoEspecial>
  );

  return (
    <PaginaDeCaptacao
      pagina={pagina}
      dados={dados}
      produtosDosEspeciais={destaques}
      especiais={{ "fileiras-pcgamer": blocoDasFileiras }}
    />
  );
}
