"use client";

import { useEffect } from "react";

/**
 * A sessão do painel dura 12 horas. Se ela vence com o painel aberto e a
 * pessoa clica no menu, a tranca manda para a entrada — mas a moldura que já
 * estava na tela não sabe disso e continuaria mostrando o menu em volta de uma
 * área vazia. Recarregar a página resolve: a porta do painel assume e mostra a
 * tela de senha, guardando para onde voltar.
 */
export default function SessaoVencida() {
  useEffect(() => {
    window.location.reload();
  }, []);

  return (
    <p className="p-6 text-sm text-slate-600">
      A sessão do painel venceu. Abrindo a tela de entrada…
    </p>
  );
}
