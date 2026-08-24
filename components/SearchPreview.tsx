import Image from "next/image";
import { Product } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SearchPreviewProps {
  products: Product[];
  searchQuery?: string;
  onSelect: (product: Product) => void;
}

export default function SearchPreview({ products, searchQuery = "", onSelect }: SearchPreviewProps) {
  if (products.length === 0) return null;

  const highlightText = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === query.toLowerCase();
          return isMatch ? (
            <strong key={i} className="text-black font-extrabold bg-yellow-100 px-0.5 rounded">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </>
    );
  };

  return (
    <div className="site-surface absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between border-b border-[var(--site-border)] bg-[var(--site-panel-muted)] p-2 text-xs font-semibold uppercase tracking-wider text-[var(--site-muted)]">
        <span>Sugestões de Produtos</span>
        <span className="rounded bg-[var(--site-panel-soft)] px-1.5 py-0.5 text-[10px] text-[var(--site-muted)]">{products.length} encontrados</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelect(product)}
            className="group flex cursor-pointer items-center gap-4 border-b border-[var(--site-border)] p-3 transition-colors last:border-0 hover:bg-[var(--site-panel-muted)]"
          >
            <div className="relative h-12 w-12 flex-shrink-0 rounded-md border border-[var(--site-border)] bg-[var(--site-panel-soft)] p-1">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate text-sm font-medium text-[var(--site-text)] transition-colors group-hover:text-[#E60012]">
                {highlightText(product.name, searchQuery)}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[var(--site-muted)]">{product.category?.split("/").pop()?.trim()}</span>
                <span className="text-xs font-bold text-[#E60012]">{product.price}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--site-muted)] group-hover:text-[#E60012]" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 border-t border-[var(--site-border)] bg-[var(--site-panel-muted)] p-2 text-center text-xs text-[var(--site-muted)]">
        Pressione <kbd className="rounded border border-[var(--site-border)] bg-[var(--site-panel-soft)] px-1 py-0.5 font-sans text-[10px]">Enter</kbd> para ver todos os resultados
      </div>
    </div>
  );
}
