/**
 * Token de máquina da VPS, comparado em tempo constante.
 *
 * Mesmo BETO_TOKEN das outras rotas de worker: é a mesma máquina, e mais
 * um segredo para configurar seria mais um segredo para esquecer de girar.
 */
export function tokenDaVpsConfere(req: Request): boolean {
  const esperado = (process.env.BETO_TOKEN || "").trim();
  if (!esperado) return false;
  const veio = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!veio || veio.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < esperado.length; i++) {
    diferenca |= esperado.charCodeAt(i) ^ veio.charCodeAt(i);
  }
  return diferenca === 0;
}
