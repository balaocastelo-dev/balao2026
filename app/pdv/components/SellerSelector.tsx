'use client';

import { useState, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';

interface Vendedor {
  id: string;
  nome: string;
  avatar_url: string | null;
  veiculo_emoji: string;
}

interface SellerSelectorProps {
  onSellerSelect: (sellerId: string | null) => void;
  selectedSeller: string | null;
}

export default function SellerSelector({ onSellerSelect, selectedSeller }: SellerSelectorProps) {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const response = await fetch('/api/arena/vendedores');
        if (response.ok) {
          const data = await response.json();
          setVendedores(data);
        }
      } catch (error) {
        console.error('Erro ao buscar vendedores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendedores();
  }, []);

  const selectedVendedor = vendedores.find(v => v.id === selectedSeller);

  if (loading) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Vendedor Responsável
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedVendedor ? (
            <>
              {selectedVendedor.avatar_url ? (
                <img
                  src={selectedVendedor.avatar_url}
                  alt={selectedVendedor.nome}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-500" />
                </div>
              )}
              <div className="flex flex-col items-start">
                <span className="text-gray-900 font-medium">
                  {selectedVendedor.veiculo_emoji} {selectedVendedor.nome}
                </span>
                <span className="text-xs text-gray-500">
                  Cód: {selectedVendedor.id.slice(0, 8)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-gray-500">Selecionar vendedor...</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-[60vh] overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => {
                onSellerSelect(null);
                setIsOpen(false);
              }}
              className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
            >
              Nenhum vendedor
            </button>
            
            {vendedores.map((vendedor) => (
              <button
                key={vendedor.id}
                onClick={() => {
                  onSellerSelect(vendedor.id);
                  setIsOpen(false);
                }}
                className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                {vendedor.avatar_url ? (
                  <img
                    src={vendedor.avatar_url}
                    alt={vendedor.nome}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={12} className="text-gray-500" />
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-900">
                    {vendedor.veiculo_emoji} {vendedor.nome}
                  </span>
                  <span className="text-xs text-gray-500">
                    Cód: {vendedor.id.slice(0, 8)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}