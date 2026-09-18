"use client";

import { useEffect, useRef } from "react";

/**
 * Blog do Soro (app.trysoro.com) embutido no site.
 *
 * O embed do Soro escreve dentro de uma `div` com id fixo `soro-blog`. Duas
 * coisas o quebram se não forem tratadas aqui:
 *
 * 1. NAVEGAÇÃO INTERNA. Num site Next, entrar no /blog vindo de outra página
 *    não recarrega o documento. Uma tag `<script>` solta no JSX roda uma vez
 *    e, na segunda visita, a div fica vazia. Por isso o script é injetado no
 *    efeito, e removido ao sair — assim toda entrada na página é uma carga
 *    nova, como se fosse um F5.
 *
 * 2. ID DUPLICADO. O id é fixo, então só pode existir UM destes na página.
 *    Montar dois (por engano, ou por um layout que repete) faria o Soro
 *    escrever num e deixar o outro vazio, sem erro nenhum.
 */

const ID_DA_CAIXA = "soro-blog";
const URL_DO_EMBED =
  "https://app.trysoro.com/api/embed/71c5ae65-e641-4dca-928b-d80ac924512b";

export default function SoroBlog() {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = URL_DO_EMBED;
    script.defer = true;
    script.dataset.soro = "1";
    document.body.appendChild(script);

    return () => {
      script.remove();
      // Limpa o que o Soro escreveu: sem isto, voltar para a página
      // mostraria o conteúdo antigo por cima do novo.
      if (caixa.current) caixa.current.innerHTML = "";
    };
  }, []);

  return <div id={ID_DA_CAIXA} ref={caixa} />;
}
