"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Model Viewer is loaded via CDN for performance (no extra bundle)
// We use a simple 3D CSS transform as fallback for the hero PC

export default function Home3DHero({ produtoDestaque }: { produtoDestaque?: any }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Magnetic cursor effect for CTA
    const cta = document.querySelector("[data-magnetic]") as HTMLElement;
    if (!cta) return;
    const handleMove = (e: MouseEvent) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      cta.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    };
    const handleLeave = () => {
      cta.style.transform = "translate(0,0)";
    };
    cta.addEventListener("mousemove", handleMove);
    cta.addEventListener("mouseleave", handleLeave);
    return () => {
      cta.removeEventListener("mousemove", handleMove);
      cta.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#090d16] via-[#111827] to-[#1f2937] border border-slate-700/60 shadow-2xl">
      {/* Prismatic background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(230,0,18,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_3s_linear_infinite]" />

      <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-8 p-6 md:p-10 items-center">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 bg-[#E60012] text-white px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Ao vivo • 1288 produtos
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-[0.9]">
            Monte seu
            <span className="block bg-gradient-to-r from-[#E60012] to-[#ff4d5a] bg-clip-text text-transparent">
              Setup dos Sonhos
            </span>
            <span className="block text-2xl md:text-3xl text-slate-300 font-bold mt-1">em 3D e retire hoje</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
            Gire, aproxime e monte seu PC em 3D real. 1000 hardwares, 100 PCs gamer e setup completo com <strong className="text-white">40% OFF</strong> e <strong className="text-white">12x sem juros</strong>. Pronta entrega no Cambuí.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              data-magnetic
              href="/categoria/hardware"
              className="bg-[#E60012] hover:bg-[#cc0010] text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-[#E60012]/20 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              Explorar em 3D <span>→</span>
            </Link>
            <Link
              href="https://wa.me/5519987510267?text=Quero%20montar%20meu%20PC%20em%203D"
              target="_blank"
              className="bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            >
              💬 Falar no WhatsApp
            </Link>
          </div>
          <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> 4.9★ Google (1.2k avaliações)</span>
            <span className="hidden sm:inline">•</span>
            <span>Retirada em 2h no Cambuí</span>
          </div>
        </motion.div>

        {/* Right: 3D Showcase - CSS 3D + Glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative lg:h-[420px] flex items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          {/* Glass card with 3D tilt */}
          <div
            className="relative w-full max-w-[420px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] p-6 shadow-2xl"
            style={{ transformStyle: "preserve-3d" }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const rotateX = (y - centerY) / 10;
              const rotateY = (centerX - x) / 10;
              e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
            }}
          >
            {/* Prismatic border */}
            <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-[#E60012]/20 via-transparent to-blue-500/20 opacity-60 pointer-events-none" />
            <div className="absolute -inset-[1px] rounded-[1.5rem] bg-gradient-to-r from-[#E60012]/50 via-white/10 to-blue-500/50 opacity-20 blur-sm -z-10" />

            <div className="relative flex flex-col items-center text-center">
              <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/10">
                {/* Simulated 3D PC with CSS */}
                <div className="relative w-40 h-28 bg-gradient-to-br from-[#1f2937] to-[#111827] rounded-lg border border-slate-600/50 shadow-2xl flex items-center justify-center" style={{ transform: "rotateX(10deg) rotateY(-10deg)", transformStyle: "preserve-3d" }}>
                  <div className="absolute inset-2 bg-gradient-to-br from-[#E60012]/20 to-transparent rounded-md" />
                  <span className="text-4xl">🖥️</span>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-[#E60012] to-blue-500 rounded-full blur-sm" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/50 blur-md rounded-full" />
                </div>
                <div className="absolute top-2 right-2 bg-[#E60012] text-white text-[10px] font-black px-2 py-1 rounded-full">3D • Arraste</div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full border border-white/10">360° • Zoom</div>
              </div>
              <h3 className="mt-4 text-white font-black text-lg">PC Gamer RTX 4060</h3>
              <p className="text-slate-300 text-xs">Ryzen 5 • 16GB • SSD 512GB • 240Hz</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-white font-black text-xl">R$ 4.899</span>
                <span className="text-slate-400 text-xs line-through">R$ 6.599</span>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">-26%</span>
              </div>
              <Link href="/product/pc-gamer-rtx-4060" className="mt-4 w-full bg-white text-[#111827] py-2.5 rounded-xl font-black text-sm hover:bg-slate-100 transition-colors">
                Ver em 3D e AR →
              </Link>
              <p className="mt-2 text-[10px] text-slate-400">Toque e arraste para girar • Pinça para zoom • AR no celular</p>
            </div>
          </div>

          {/* Floating specs with glass */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -right-2 lg:-right-6 top-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl hidden md:block"
            style={{ transform: "translateZ(20px)" }}
          >
            <p className="text-white text-xs font-bold">⚡ 240 FPS</p>
            <p className="text-slate-300 text-[10px]">Valorant • Fortnite</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute -left-2 lg:-left-6 bottom-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl hidden md:block"
            style={{ transform: "translateZ(20px)" }}
          >
            <p className="text-white text-xs font-bold">❄️ 65°C máx</p>
            <p className="text-slate-300 text-[10px]">Water Cooler 240mm</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
