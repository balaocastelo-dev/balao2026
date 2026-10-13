import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import SecaoEspecial from "@/components/landing/SecaoEspecial";
import ModeloTresD from "@/components/landing/ModeloTresD";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/pcgamer3d.ts. O modelo 3D (Sketchfab) só
// carrega quando a pessoa toca em "Girar o PC em 3D".
export const revalidate = 300;

const pagina = paginaPorSlug("pcgamer3d");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  const dados = await carregarDadosDaPagina(pagina);
  return (
    <PaginaDeCaptacao
      pagina={pagina}
      dados={dados}
      especiais={{
        "modelo-3d": (
          <SecaoEspecial
            id="modelo-3d"
            titulo="Gire o PC e olhe por dentro"
            texto="Arraste para girar e aproxime para ver onde fica cada peça. É o mesmo arranjo que a bancada usa para o ar entrar pela frente e sair por trás e por cima."
          >
            <ModeloTresD capa={pagina.hero.imagem.src} />
          </SecaoEspecial>
        ),
      }}
    />
  );
}
