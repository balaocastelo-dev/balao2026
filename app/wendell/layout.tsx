import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Página não indexável",
};

export default function WendellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
