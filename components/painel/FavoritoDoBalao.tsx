"use client";

// O favorito "Enviar ao Balão": arrastado para a barra de favoritos do
// Chrome, e clicado na página do catálogo do fornecedor, lê o catálogo e
// traz para o painel (public/captura-fornecedor.js).
//
// O endereço "javascript:" é posto direto no elemento: o React não aceita
// esse tipo de link como propriedade.

import { useEffect, useRef } from "react";
import { Bookmark } from "lucide-react";

const CODIGO =
  "javascript:(function(){var s=document.createElement('script');s.src='https://www.balao.info/captura-fornecedor.js?v='+Date.now();document.body.appendChild(s);})();";

export default function FavoritoDoBalao() {
  const link = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    link.current?.setAttribute("href", CODIGO);
  }, []);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
      <a
        ref={link}
        onClick={(e) => e.preventDefault()}
        className="inline-flex cursor-grab items-center gap-1.5 rounded-md bg-[#E60012] px-3 py-1.5 text-sm font-bold text-white"
        title="Arraste para a barra de favoritos"
      >
        <Bookmark size={14} /> Enviar ao Balão
      </a>
      <span className="flex-1 text-xs text-gray-600">
        Arraste este botão para a barra de favoritos do Chrome (uma vez só). Para atualizar um fornecedor: abra o catálogo dele e
        clique no favorito. O catálogo é lido no seu navegador e você confirma a importação aqui no painel.
      </span>
    </div>
  );
}
