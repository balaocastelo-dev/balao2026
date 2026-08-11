import { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/db';
import { Category } from '@/lib/utils';
import { 
  Monitor, 
  Cpu, 
  Mouse, 
  Keyboard, 
  Headphones, 
  HardDrive, 
  Wifi, 
  Printer, 
  Gamepad2, 
  Laptop, 
  Smartphone,
  Cable,
  Server,
  Package
} from 'lucide-react';
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Departamentos e Categorias | Balão da Informática Campinas',
  description: 'Explore todos os departamentos de informática. Hardware, Periféricos, Computadores, Notebooks e muito mais. Encontre o que você precisa em Campinas.',
  keywords: ['departamentos informatica', 'categorias hardware', 'loja informatica campinas', 'comprar pc', 'peças computador'],
  alternates: {
    canonical: 'https://www.balao.info/departamentos',
  },
};

export const dynamic = 'force-dynamic';

// Mapa de ícones para categorias comuns
const iconMap: Record<string, any> = {
  'hardware': Cpu,
  'perifericos': Mouse,
  'computadores': Monitor,
  'notebooks': Laptop,
  'gamer': Gamepad2,
  'redes': Wifi,
  'impressao': Printer,
  'armazenamento': HardDrive,
  'cabos': Cable,
  'acessorios': Headphones,
  'servidores': Server,
  'celulares': Smartphone,
};

function getIconForCategory(slug: string) {
  const key = Object.keys(iconMap).find(k => slug.includes(k));
  return key ? iconMap[key] : Package;
}

export default async function DepartamentosPage() {
  const categories = await getCategories();
  
  // Organizar categorias em árvore
  const rootCategories = categories.filter(c => !c.parent_id && c.active).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId && c.active).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Departamentos', item: 'https://www.balao.info/departamentos' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      
      {/* Header Simples */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-gray-500 mt-2">Navegue por todas as nossas categorias de produtos</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rootCategories.map((category) => {
            const Icon = getIconForCategory(category.slug);
            const children = getChildren(category.id);

            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Link href={`/categoria/${category.slug}`} className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                    {category.name}
                  </Link>
                </div>
                
                <div className="p-6 flex-1">
                  {children.length > 0 ? (
                    <ul className="space-y-3">
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link 
                            href={`/categoria/${child.slug}`}
                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-500 mr-3 transition-colors"></span>
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Ver produtos em {category.name}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                   <Link 
                      href={`/categoria/${category.slug}`} 
                      className="text-blue-600 font-semibold text-sm hover:underline"
                   >
                      Ver tudo em {category.name}
                   </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
