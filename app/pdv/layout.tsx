import type { Metadata } from "next";
import "./pdv.css";

export const metadata: Metadata = {
  title: "Caixa",
  robots: { index: false, follow: false },
};

export default function PdvLayout({ children }: { children: React.ReactNode }) {
  return <div className="pdv h-full min-h-0">{children}</div>;
}
