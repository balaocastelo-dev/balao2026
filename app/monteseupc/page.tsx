import { getProducts } from "@/lib/db";
import PCBuilder from "@/components/PCBuilder";
import { Monitor, Cpu, Settings } from "lucide-react";
import Header from "@/components/Header";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";

// Force dynamic rendering to ensure we get fresh products
export const dynamic = 'force-dynamic';

export default async function MonteSeuPCPage() {
  const products = await getProducts();

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Monte Seu PC', item: 'https://www.balao.info/monteseupc' }
  ];

  return (
    <div className="min-h-screen bg-zinc-100 font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white py-12 md:py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
              <Settings size={48} className="text-red-400" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">
                MONTE SEU <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">PC GAMER</span>
              </h1>
              <p className="text-zinc-200 text-lg max-w-2xl">
                Escolha cada componente, verifique a compatibilidade e monte a máquina perfeita para o seu orçamento e estilo de jogo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-20">
        <PCBuilder products={products} />
      </div>
      
      {/* Footer Info Section */}
      <div className="container mx-auto px-4 py-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <Cpu size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Montagem Profissional</h3>
            <p className="text-zinc-500 text-sm">Seu PC é montado por especialistas com organização de cabos impecável.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
              <Monitor size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Testado no Limite</h3>
            <p className="text-zinc-500 text-sm">Realizamos testes de estresse para garantir estabilidade e performance.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
              <Settings size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Garantia Total</h3>
            <p className="text-zinc-500 text-sm">Garantia em todos os componentes e suporte técnico especializado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
