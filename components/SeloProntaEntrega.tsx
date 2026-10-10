// Faixa "PRONTA ENTREGA" sobre a foto: produto do fornecedor local, que sai
// da loja no mesmo dia. Aparece quando `availability` é "Pronta entrega".

export function ehProntaEntrega(availability?: string | null): boolean {
  return String(availability || "").trim().toLowerCase() === "pronta entrega";
}

export default function SeloProntaEntrega({
  availability,
  tamanho = "normal",
}: {
  availability?: string | null;
  tamanho?: "pequeno" | "normal" | "grande";
}) {
  if (!ehProntaEntrega(availability)) return null;
  const classes =
    tamanho === "grande"
      ? "left-3 top-3 px-4 py-2 text-sm"
      : tamanho === "pequeno"
        ? "left-1.5 top-1.5 px-1.5 py-0.5 text-[8px]"
        : "left-2 top-2 px-2.5 py-1 text-[10px] sm:text-xs";
  return (
    <span
      className={`pointer-events-none absolute z-10 rounded-md bg-emerald-500 font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950/30 ring-2 ring-white/80 ${classes}`}
    >
      Pronta entrega
    </span>
  );
}

/** Foto de produto do mesmo tipo, não do item exato (endereço termina em #ilustrativa). */
export function ehImagemIlustrativa(url?: string | null): boolean {
  return String(url || "").endsWith("#ilustrativa");
}

export function AvisoImagemIlustrativa({ url, tamanho = "normal" }: { url?: string | null; tamanho?: "pequeno" | "normal" }) {
  if (!ehImagemIlustrativa(url)) return null;
  return (
    <span
      className={`pointer-events-none absolute bottom-1.5 right-1.5 z-10 rounded bg-black/60 font-semibold text-white ${
        tamanho === "pequeno" ? "px-1 py-0.5 text-[8px]" : "px-1.5 py-0.5 text-[10px]"
      }`}
    >
      Imagem ilustrativa
    </span>
  );
}
