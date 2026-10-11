/*
 * Balão da Informática — captura do catálogo de fornecedor na Kyte.
 *
 * Roda NA PÁGINA DO FORNECEDOR, no navegador da loja (o site da Kyte recusa
 * servidores). Lê nome, preço, categoria e foto de cada produto e leva tudo
 * para www.balao.info/painel/precos/receber, onde o Thiago confere e aperta
 * "Importar". Nada é gravado sem essa confirmação.
 *
 * Duas versões de catálogo da Kyte:
 *  - <loja>.catalog.kyte.site: a página já traz todos os produtos (rápido);
 *  - <loja>.kyte.site/pt-BR: passa por cada categoria e abre cada produto,
 *    devagar e como gente (de 15 a 30 minutos para uns 800 produtos).
 *
 * Como usar: o favorito "Enviar ao Balão" (painel > Preços por fonte) carrega
 * este arquivo. Andamento em window.__balaoCaptura.
 */
(function () {
  if (window.__balaoCaptura && window.__balaoCaptura.rodando) return;
  var DESTINO = "https://www.balao.info/api/captura-fornecedor";
  var FOTOS = "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o";
  var estado = (window.__balaoCaptura = { rodando: true, etapa: "começando", produtos: 0, total: 0, erro: null });

  // ---------- aviso na tela ----------
  var caixa = document.createElement("div");
  caixa.setAttribute("style", "position:fixed;z-index:2147483647;right:16px;bottom:16px;max-width:340px;padding:14px 16px;border-radius:12px;background:#111827;color:#fff;font:14px/1.4 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4)");
  document.body.appendChild(caixa);
  function mostrar(texto) {
    estado.etapa = texto;
    caixa.innerHTML = '<strong style="color:#f87171">Balão</strong> · ' + texto;
  }
  mostrar("lendo o catálogo…");

  // Espera que funciona com a aba em segundo plano (setTimeout fica congelado).
  function dormir(ms) {
    return new Promise(function (ok) {
      var fim = performance.now() + ms;
      var canal = new MessageChannel();
      canal.port1.onmessage = function () {
        if (performance.now() >= fim) { canal.port1.close(); ok(); } else canal.port2.postMessage(0);
      };
      canal.port2.postMessage(0);
    });
  }

  function foto(valor) {
    if (!valor) return null;
    if (typeof valor === "object") valor = valor.url || valor.image || valor.src || null;
    if (typeof valor !== "string") return null;
    if (valor.charAt(0) === "/" && valor.charAt(1) !== "/") return FOTOS + valor;
    return /^https:\/\//.test(valor) ? valor : null;
  }

  function normal(p, url) {
    var categoria = p.category && typeof p.category === "object" ? p.category.name : p.categoryName;
    return {
      id: String(p._id || p.id || ""),
      name: String(p.name || "").replace(/\s+/g, " ").trim(),
      salePrice: p.salePrice == null ? null : Number(p.salePrice),
      salePromotionalPrice: p.salePromotionalPrice ? Number(p.salePromotionalPrice) : null,
      category: { name: categoria ? String(categoria).trim() : null },
      active: p.active !== false,
      showOnCatalog: p.showOnCatalog !== false,
      stockActive: !!p.stockActive,
      stock: p.stock == null ? null : p.stock,
      stockStatus: p.stockStatus || null,
      image: foto(p.image) || foto(p.imageLarge) || foto(p.imageMedium),
      gallery: (Array.isArray(p.gallery) ? p.gallery : []).map(foto).filter(Boolean).slice(0, 6),
      url: url,
    };
  }

  // ---------- catálogo antigo: tudo já está na página ----------
  function produtosDaPagina() {
    var loja = window.__NEXT_REDUX_STORE__ && window.__NEXT_REDUX_STORE__.getState && window.__NEXT_REDUX_STORE__.getState();
    var todos = loja && loja.products && loja.products.allProducts;
    return Array.isArray(todos) ? todos : [];
  }
  // Os produtos chegam alguns segundos depois de a página abrir: espera até
  // a lista parar de crescer (até 30 s) antes de desistir.
  async function doCatalogo() {
    if (!window.__NEXT_REDUX_STORE__ && !/\.catalog\.kyte\.site$/.test(location.host)) return null;
    var antes = -1, iguais = 0;
    for (var t = 0; t < 60 && iguais < 4; t++) {
      var n = produtosDaPagina().length;
      if (n > 0 && n === antes) iguais++; else { iguais = 0; antes = n; }
      if (iguais < 4) await dormir(500);
    }
    var todos = produtosDaPagina();
    if (todos.length === 0) return null;
    return todos.map(function (p) { return normal(p, location.origin + "/"); });
  }

  // ---------- catálogo novo: categoria por categoria ----------
  function rolar() {
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
    document.querySelectorAll("div,main,section").forEach(function (el) {
      if (el.scrollHeight > el.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
        el.scrollTop = el.scrollHeight;
        el.dispatchEvent(new Event("scroll"));
      }
    });
    window.dispatchEvent(new Event("scroll"));
  }

  function produtoDaPagina(html) {
    var rsc = "";
    var re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
    var m;
    while ((m = re.exec(html))) { try { rsc += JSON.parse(m[1]); } catch (e) { /* pedaço que não é texto */ } }
    var k = rsc.indexOf('"product":{"_id"');
    if (k < 0) return null;
    var i = k + 10, d = 0, texto = false, esc = false;
    for (var j = i; j < rsc.length; j++) {
      var c = rsc[j];
      if (texto) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') texto = false; continue; }
      if (c === '"') texto = true;
      else if (c === "{") d++;
      else if (c === "}" && --d === 0) { try { return JSON.parse(rsc.slice(i, j + 1)); } catch (e) { return null; } }
    }
    return null;
  }

  async function doCatalogoNovo() {
    var categorias = Array.from(new Set(Array.from(document.querySelectorAll('a[href*="/c/"]')).map(function (a) { return a.getAttribute("href"); })));
    if (categorias.length === 0) throw new Error("não achei o menu de categorias. Abra uma categoria do catálogo e clique de novo no favorito.");
    var links = new Map();
    for (var n = 0; n < categorias.length; n++) {
      var c = categorias[n];
      var a = document.querySelector('a[href="' + c + '"]');
      if (!a) continue;
      if (location.pathname !== c) {
        a.click();
        for (var t = 0; t < 40 && location.pathname !== c; t++) await dormir(250);
        await dormir(2500);
      }
      var antes = -1, iguais = 0;
      for (var v = 0; v < 80 && iguais < 4; v++) {
        rolar();
        await dormir(1200);
        var qtd = document.querySelectorAll('a[href*="/p/"]').length;
        if (qtd === antes) iguais++; else { iguais = 0; antes = qtd; }
      }
      document.querySelectorAll('a[href*="/p/"]').forEach(function (x) { links.set(x.getAttribute("href").split("/").pop(), x.getAttribute("href")); });
      mostrar("categoria " + (n + 1) + " de " + categorias.length + " · " + links.size + " produtos achados");
    }
    estado.total = links.size;
    var saida = [];
    for (var item of links) {
      var href = item[1];
      var r = await fetch(href);
      if (r.status === 403 || r.status === 429) throw new Error("o site do fornecedor respondeu " + r.status + "; parei para não insistir.");
      var p = produtoDaPagina(await r.text());
      if (p && (p.id || p._id)) saida.push(normal(p, new URL(href, location.origin).href));
      estado.produtos = saida.length;
      if (saida.length % 10 === 0) mostrar("lendo produtos: " + saida.length + " de " + links.size);
    }
    return saida;
  }

  function enviar(produtos) {
    mostrar(produtos.length + " produtos lidos. Abrindo o painel do Balão…");
    estado.etapa = "enviando";
    var form = document.createElement("form");
    form.method = "POST";
    form.action = DESTINO;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";
    var campo = document.createElement("input");
    campo.type = "hidden";
    campo.name = "dados";
    campo.value = JSON.stringify({ host: location.host, loja: document.title, produtos: produtos });
    form.appendChild(campo);
    document.body.appendChild(form);
    form.submit();
  }

  (async function () {
    try {
      var produtos = await doCatalogo();
      if (!produtos) produtos = await doCatalogoNovo();
      produtos = produtos.filter(function (p) { return p.id && p.name; });
      if (produtos.length === 0) throw new Error("não achei nenhum produto nesta página.");
      estado.produtos = produtos.length;
      enviar(produtos);
    } catch (e) {
      estado.erro = String((e && e.message) || e);
      estado.rodando = false;
      mostrar("não deu certo: " + estado.erro);
    }
  })();
})();
