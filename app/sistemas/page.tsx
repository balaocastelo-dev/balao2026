import { Suspense } from "react";
import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import SecaoEspecial from "@/components/landing/SecaoEspecial";
import SistemasLeadForm from "@/components/SistemasLeadForm";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/sistemas.ts. O formulário lê a origem da
// visita na URL (utm): fica dentro de Suspense para o resto da página sair
// pronto do servidor.
export const revalidate = 300;

const pagina = paginaPorSlug("sistemas");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  const dados = await carregarDadosDaPagina(pagina);
  return (
    <PaginaDeCaptacao
      pagina={pagina}
      dados={dados}
      especiais={{
        "formulario-sistemas": (
          <SecaoEspecial
            id="formulario"
            painel
            titulo="Conte o seu projeto"
            texto="Prefere escrever com calma? Preencha aqui e a equipe responde pelo e-mail ou pelo WhatsApp que você deixar."
          >
            <div className="max-w-3xl">
              <Suspense fallback={null}>
                <SistemasLeadForm />
              </Suspense>
            </div>
          </SecaoEspecial>
        ),
      }}
    />
  );
}
