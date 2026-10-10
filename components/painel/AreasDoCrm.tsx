"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import PainelOperacao from "@/components/crm/comando/PainelOperacao";
import Clientes from "@/components/crm/comando/Clientes";
import Ajustes from "@/components/crm/comando/Ajustes";
import Equipe from "@/components/crm/comando/Equipe";
import { usePonteDoPainel } from "@/lib/painel/ponte";

// As áreas de gestão do CRM, abertas direto no painel.
//
// São os mesmos módulos do Centro de Comando que existe dentro do atendimento
// — o que se grava aqui aparece lá, e o contrário. A diferença é o caminho:
// daqui não é preciso abrir a caixa de conversas para chegar neles.

function Cabecalho({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-900">{titulo}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{texto}</p>
      </div>
      <Link
        href="/painel/crm"
        prefetch={false}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#E60012]"
      >
        <MessagesSquare size={16} />
        Abrir o atendimento
      </Link>
    </div>
  );
}

function Area({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl p-3 sm:p-5 lg:p-6">{children}</div>;
}

export function AreaAtendimento() {
  const router = useRouter();
  const { ponte, pronta } = usePonteDoPainel({ comNomesDaEquipe: true });

  return (
    <Area>
      <Cabecalho
        titulo="Números do atendimento"
        texto="O movimento do WhatsApp da loja: quem está esperando resposta, quanto tempo a loja leva para responder e como o funil anda."
      />
      {pronta ? (
        <PainelOperacao
          ponte={ponte}
          aoEscolherSegmento={(chave) =>
            router.push(`/painel/clientes?segmento=${encodeURIComponent(chave)}`)
          }
        />
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Carregando…
        </p>
      )}
    </Area>
  );
}

export function AreaClientes({ segmento }: { segmento?: string }) {
  const { ponte } = usePonteDoPainel();

  return (
    <Area>
      <Cabecalho
        titulo="Clientes"
        texto="Todo mundo que já conversou com a loja, separado por interesse, etiqueta e tempo sem resposta. Clicar em um cliente abre a conversa no atendimento."
      />
      <Clientes ponte={ponte} segmentoInicial={segmento || ""} />
    </Area>
  );
}

export function AreaRespostas() {
  const { ponte } = usePonteDoPainel();

  return (
    <Area>
      <Cabecalho
        titulo="Respostas e etiquetas"
        texto="As respostas rápidas e as etiquetas valem para a equipe inteira: o que for cadastrado aqui aparece no atendimento de todos os vendedores."
      />
      <Ajustes ponte={ponte} />
    </Area>
  );
}

export function AreaEquipe() {
  const { ponte } = usePonteDoPainel();
  return <Equipe ponte={ponte} />;
}
