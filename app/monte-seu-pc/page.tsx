import { getProducts } from "@/lib/db";
import PCBuilderV2 from "@/components/PCBuilderV2";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateOrganizationSchema } from "@/components/JsonLd";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Cpu, Settings, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MonteSeuPCPage() {
  const products = await getProducts();

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Monte seu PC", item: "https://www.balao.info/monte-seu-pc" },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 font-sans">
      <JsonLd data={[generateOrganizationSchema(), generateBreadcrumbSchema(breadcrumbItems)]} />
      <Header />

      <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
              <Settings size={48} className="text-red-400" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">
                MONTE SEU <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">PC</span>
              </h1>
              <p className="text-zinc-200 text-lg max-w-2xl">
                Selecione componentes na ordem correta, com compatibilidade rigorosa de socket, RAM e dimensionamento de fonte.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-20">
        <ErrorBoundary>
          <PCBuilderV2 products={products} />
        </ErrorBoundary>
      </div>

      <div className="container mx-auto px-4 py-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <Cpu size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Compatibilidade Rigorosa</h3>
            <p className="text-zinc-500 text-sm">Socket, DDR4/DDR5 e potência recomendada de fonte filtrados automaticamente.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
              <Settings size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Fluxo Sequencial</h3>
            <p className="text-zinc-500 text-sm">Escolha na ordem: CPU → Placa-mãe → RAM → SSD/NVMe → GPU → Fonte → Gabinete.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
              <Wrench size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Montagem Profissional</h3>
            <p className="text-zinc-500 text-sm">Valor dinâmico por categoria: Office, Gamer Básico ou Alto Nível.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
