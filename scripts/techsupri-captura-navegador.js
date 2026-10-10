// ============================================================
// Captura do catálogo da TechSupri pelo NAVEGADOR (techsupri.kyte.site).
//
// O site da Kyte bloqueia servidores, então a captura roda numa aba normal
// do Chrome da loja, aberta em qualquer página de categoria da TechSupri.
// Cole este arquivo no console da aba (ou rode pela extensão do Claude).
//
// O que faz, devagar e como gente:
//   1. passa por cada categoria do menu, rolando até carregar tudo;
//   2. abre a página de cada produto e lê nome, preço e categoria;
//   3. deixa em window.__linhas uma linha por produto, no formato que
//      scripts/techsupri-carga.ts entende:
//        <id sem -X5mQX>|<nome>|<preço>|<preço promocional>|<categoria>|<X se indisponível>
//
// Acompanhe com: window.__captura   ({ etapa, categorias, produtos })
// Funciona com a aba em segundo plano: a espera usa MessageChannel, que o
// Chrome não congela como faz com setTimeout em aba escondida.
// ============================================================

(async () => {
  const estado = (window.__captura = { etapa: "categorias", categorias: 0, produtos: 0, erro: null });
  const dormir = (ms) =>
    new Promise((ok) => {
      const fim = performance.now() + ms;
      const canal = new MessageChannel();
      canal.port1.onmessage = () => (performance.now() >= fim ? (canal.port1.close(), ok()) : canal.port2.postMessage(0));
      canal.port2.postMessage(0);
    });
  const rolar = () => {
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
    document.querySelectorAll("div,main,section").forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
        el.scrollTop = el.scrollHeight;
        el.dispatchEvent(new Event("scroll"));
      }
    });
    window.dispatchEvent(new Event("scroll"));
  };
  const extrair = (html) => {
    let rsc = "";
    for (const m of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) {
      try { rsc += JSON.parse(m[1]); } catch { /* pedaço que não é texto */ }
    }
    const k = rsc.indexOf('"product":{"_id"');
    if (k < 0) return null;
    const i = k + 10;
    let d = 0, texto = false, esc = false;
    for (let j = i; j < rsc.length; j++) {
      const c = rsc[j];
      if (texto) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') texto = false; continue; }
      if (c === '"') texto = true;
      else if (c === "{") d++;
      else if (c === "}" && --d === 0) { try { return JSON.parse(rsc.slice(i, j + 1)); } catch { return null; } }
    }
    return null;
  };

  try {
    const categorias = [...new Set([...document.querySelectorAll('a[href*="/c/"]')].map((a) => a.getAttribute("href")))];
    const links = new Map();
    for (const c of categorias) {
      const a = document.querySelector(`a[href="${c}"]`);
      if (!a) continue;
      if (location.pathname !== c) {
        a.click();
        for (let i = 0; i < 40 && location.pathname !== c; i++) await dormir(250);
        await dormir(2500);
      }
      let antes = -1, iguais = 0;
      for (let i = 0; i < 80 && iguais < 4; i++) {
        rolar();
        await dormir(1200);
        const n = document.querySelectorAll('a[href*="/p/"]').length;
        if (n === antes) iguais++; else { iguais = 0; antes = n; }
      }
      for (const x of document.querySelectorAll('a[href*="/p/"]')) links.set(x.getAttribute("href").split("/").pop(), x.getAttribute("href"));
      estado.categorias++;
    }

    estado.etapa = "produtos";
    const linhas = [];
    for (const [, href] of links) {
      const r = await fetch(href);
      if (r.status === 403 || r.status === 429) throw new Error(`o site respondeu ${r.status}; parei`);
      const p = extrair(await r.text());
      if (!p || !p.id) continue;
      const disponivel = p.active !== false && p.showOnCatalog !== false;
      linhas.push([
        p.id.replace("-X5mQX", ""), String(p.name).replace(/\|/g, "/").replace(/\s+/g, " ").trim(),
        p.salePrice ?? "", p.salePromotionalPrice || "", (p.category && p.category.name) || "", disponivel ? "" : "X",
      ].join("|"));
      estado.produtos++;
    }
    window.__linhas = linhas.sort();
    estado.etapa = "fim";
  } catch (e) {
    estado.erro = String(e);
    estado.etapa = "erro";
  }
})();
