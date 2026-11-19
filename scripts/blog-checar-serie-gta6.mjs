/**
 * Checagem editorial da série GTA 6: title, meta, H1, palavra-chave,
 * FAQ, dados estruturados, links e tom. O critério mora no teste.
 */
import { spawnSync } from "node:child_process";

const resultado = spawnSync("npx", ["vitest", "run", "__tests__/lib/serie-gta6-editorial.test.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(resultado.status ?? 1);
