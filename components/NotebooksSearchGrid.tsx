'use client';

import { useState } from 'react';
import { Product } from '@/lib/utils';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';

interface NotebooksSearchGridProps {
  initialProducts: Product[];
}

export default function NotebooksSearchGrid({ initialProducts }: NotebooksSearchGridProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = initialProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedProducts = filteredProducts.slice(0, 20);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-blue-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-zinc-900 border border-blue-500/50 rounded-full text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] text-lg"
          placeholder="Busque por modelo, processador ou marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results Count */}
      <div className="text-center text-slate-400 text-sm">
        Mostrando {displayedProducts.length} de {filteredProducts.length} resultados encontrados
      </div>

      {/* Product Grid */}
      {displayedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-xl">Nenhum notebook encontrado com esse termo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
