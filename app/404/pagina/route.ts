const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Página não encontrada</title>
</head>
<body>
  <h1>404</h1>
  <p>Página não encontrada</p>
  <p><a href="/">Voltar para o início</a></p>
</body>
</html>`;

export function GET() {
  return new Response(HTML, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "no-store",
    },
  });
}

export function HEAD() {
  return new Response(null, {
    status: 404,
    headers: {
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "no-store",
    },
  });
}
