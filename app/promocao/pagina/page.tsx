"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Cpu,
  Layers,
  Video,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Play,
  Check,
  Shield,
  MessageCircle,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/Header";
import { SITE_CONFIG } from "@/lib/config";

// Preços das Peças (Fechando nos combos ideais)
const PRECOS = {
  base: 2999, // Gabinete Premium, Fonte 750W 80 Plus, SSD NVMe 1TB, Placa-Mãe, Air Cooler, Montagem
  cpu: {
    i5: 1200,
    ryzen7: 2000,
    i7: 2600,
  },
  ram: {
    "16gb": 300,
    "32gb": 800,
    "64gb": 1600,
  },
  gpu: {
    rtx4060: 3200,
    rtx3080: 3000,
    rtx4070: 3599,
  },
};

const NOMES = {
  cpu: {
    i5: "Intel Core i5 (13ª Geração)",
    ryzen7: "AMD Ryzen 7 Série 7000",
    i7: "Intel Core i7 (13ª Geração)",
  },
  ram: {
    "16gb": "16GB RAM DDR5 High Speed",
    "32gb": "32GB RAM DDR5 High Speed",
    "64gb": "64GB RAM DDR5 High Speed",
  },
  gpu: {
    rtx4060: "NVIDIA GeForce RTX 4060 8GB",
    rtx3080: "NVIDIA GeForce RTX 3080 12GB",
    rtx4070: "NVIDIA GeForce RTX 4070 12GB",
  },
};

export default function PromocaoPagina() {
  const [cpu, setCpu] = useState<"i5" | "ryzen7" | "i7">("i5");
  const [ram, setRam] = useState<"16gb" | "32gb" | "64gb">("32gb");
  const [gpu, setGpu] = useState<"rtx4060" | "rtx3080" | "rtx4070">("rtx3080");
  const [precoTotal, setPrecoTotal] = useState(7999);
  const [linkWhatsapp, setLinkWhatsapp] = useState("");

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const desmutarVideo = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play().catch(() => {});
      }
      document.removeEventListener("click", desmutarVideo);
      document.removeEventListener("touchstart", desmutarVideo);
    };

    document.addEventListener("click", desmutarVideo);
    document.addEventListener("touchstart", desmutarVideo);

    return () => {
      document.removeEventListener("click", desmutarVideo);
      document.removeEventListener("touchstart", desmutarVideo);
    };
  }, []);

  useEffect(() => {
    const total = PRECOS.base + PRECOS.cpu[cpu] + PRECOS.ram[ram] + PRECOS.gpu[gpu];
    setPrecoTotal(total);

    const textoMensagem =
      `Olá Thiago! Montei um Super PC personalizado no configurador da Balão da Informática:\n\n` +
      `- Processador: ${NOMES.cpu[cpu]}\n` +
      `- Memória RAM: ${NOMES.ram[ram]}\n` +
      `- Placa de Vídeo: ${NOMES.gpu[gpu]}\n` +
      `- Kit Base (Gabinete Premium, Fonte 750W 80+, SSD NVMe 1TB)\n\n` +
      `Total à vista no PIX: R$ ${total.toLocaleString("pt-BR")}\n\n` +
      `Gostaria de encomendar e agendar a retirada no Cambuí. Está disponível?`;

    setLinkWhatsapp(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(textoMensagem)}`);
  }, [cpu, ram, gpu]);

  const aplicarCombo = (
    comboCpu: "i5" | "ryzen7" | "i7",
    comboRam: "16gb" | "32gb" | "64gb",
    comboGpu: "rtx4060" | "rtx3080" | "rtx4070"
  ) => {
    setCpu(comboCpu);
    setRam(comboRam);
    setGpu(comboGpu);

    const el = document.getElementById("configurador");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#090d16] text-white font-sans min-h-screen selection:bg-[#E60012] selection:text-white flex flex-col">
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Zap className="w-4 h-4" />
                  Desempenho Profissional em Campinas
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Monte seu Super PC <br />
                  <span className="text-[#E60012]">Gamer & Workstation</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Elimine travamentos em renderizações, edições em 4K e compilação de código. Monte sua máquina sob
                  medida com peças selecionadas de primeira linha, montagem profissional e garantia física na loja do Cambuí.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <a
                    href="#configurador"
                    className="w-full sm:w-auto text-center bg-[#E60012] hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition shadow-xl shadow-red-950/50 text-base sm:text-lg"
                  >
                    Configurar meu PC
                  </a>
                  <a
                    href="#combos"
                    className="w-full sm:w-auto text-center bg-[#161f32] hover:bg-slate-800 border border-slate-700 text-slate-200 px-8 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 text-base"
                  >
                    Ver Combos Prontos
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 relative flex justify-center">
                <div className="space-y-6 max-w-md w-full">
                  {/* Card 1: Imagem */}
                  <div className="bg-[#161f32] border border-slate-800 p-4 rounded-2xl shadow-xl">
                    <div className="aspect-video rounded-xl overflow-hidden relative border border-slate-800">
                      <Image
                        src="/pc_campanha.jpg"
                        alt="Super PC Workstation Balão"
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute bottom-3 left-3 bg-[#111827]/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold border border-slate-700 text-[#E60012]">
                        Workstations Balão 2026
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm">Super PC Custom</h3>
                        <p className="text-xs text-slate-400">Montagem premium e Cable Management</p>
                      </div>
                      <span className="bg-[#E60012]/20 text-[#E60012] border border-[#E60012]/30 text-xs px-2.5 py-1 rounded-lg font-bold">
                        100% Local
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Vídeo de Apresentação */}
                  <div className="bg-[#161f32] border border-slate-800 p-4 rounded-2xl shadow-xl">
                    <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E60012]"></span>
                      </span>
                      Apresentação da Julia (Assistente Virtual)
                    </h4>
                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black relative">
                      <video
                        ref={videoRef}
                        src="/video_avatar_campanha.mp4"
                        autoPlay
                        muted
                        loop
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONFIGURADOR INTERATIVO */}
        <section id="configurador" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Configurador em Tempo Real</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Monte e Simule sua Máquina</h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Selecione o processador, a memória e a placa de vídeo. Veja o valor final na hora e envie direto para o WhatsApp para reservar.
            </p>
          </div>

          {/* Painel do Configurador */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 lg:p-10 shadow-2xl grid md:grid-cols-12 gap-8">
            {/* Seleção de Peças */}
            <div className="md:col-span-7 space-y-6">
              {/* CPU */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                  1. Processador (CPU)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    onClick={() => setCpu("i5")}
                    className={`border-2 p-4 rounded-2xl cursor-pointer transition flex justify-between items-center ${
                      cpu === "i5"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">Intel Core i5 (13ª Geração)</div>
                      <div className="text-xs text-slate-400">Excelente para jogos competitivos e render leve</div>
                    </div>
                    <div className="text-xs font-black text-[#E60012]">+ R$ 1.200</div>
                  </div>

                  <div
                    onClick={() => setCpu("ryzen7")}
                    className={`border-2 p-4 rounded-2xl cursor-pointer transition flex justify-between items-center ${
                      cpu === "ryzen7"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">AMD Ryzen 7 Série 7000</div>
                      <div className="text-xs text-slate-400">Alta eficiência em multitarefas e edição 4K</div>
                    </div>
                    <div className="text-xs font-black text-[#E60012]">+ R$ 2.000</div>
                  </div>

                  <div
                    onClick={() => setCpu("i7")}
                    className={`border-2 p-4 rounded-2xl cursor-pointer transition flex justify-between items-center ${
                      cpu === "i7"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">Intel Core i7 (13ª Geração)</div>
                      <div className="text-xs text-slate-400">Potência máxima para 3D, After Effects e Unreal</div>
                    </div>
                    <div className="text-xs font-black text-[#E60012]">+ R$ 2.600</div>
                  </div>
                </div>
              </div>

              {/* RAM */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                  2. Memória RAM DDR5
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setRam("16gb")}
                    className={`border-2 p-3 rounded-2xl text-center cursor-pointer transition ${
                      ram === "16gb"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">16GB DDR5</div>
                    <div className="text-[10px] text-slate-400">+ R$ 300</div>
                  </div>

                  <div
                    onClick={() => setRam("32gb")}
                    className={`border-2 p-3 rounded-2xl text-center cursor-pointer transition ${
                      ram === "32gb"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">32GB DDR5</div>
                    <div className="text-[10px] text-[#E60012] font-bold">+ R$ 800</div>
                  </div>

                  <div
                    onClick={() => setRam("64gb")}
                    className={`border-2 p-3 rounded-2xl text-center cursor-pointer transition ${
                      ram === "64gb"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">64GB DDR5</div>
                    <div className="text-[10px] text-slate-400">+ R$ 1.600</div>
                  </div>
                </div>
              </div>

              {/* GPU */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                  3. Placa de Vídeo (GPU)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    onClick={() => setGpu("rtx4060")}
                    className={`border-2 p-4 rounded-2xl cursor-pointer transition flex justify-between items-center ${
                      gpu === "rtx4060"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">RTX 4060 8GB</div>
                      <div className="text-xs text-slate-400">DLSS 3, excelente custo-benefício em 1080p/1440p</div>
                    </div>
                    <div className="text-xs font-black text-[#E60012]">+ R$ 3.200</div>
                  </div>

                  <div
                    onClick={() => setGpu("rtx3080")}
                    className={`border-2 p-4 rounded-2xl cursor-pointer transition flex justify-between items-center ${
                      gpu === "rtx3080"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">RTX 3080 12GB (Desempenho Bruto)</div>
                      <div className="text-xs text-slate-400">Largura de banda e VRAM massivas para 4K</div>
                    </div>
                    <div className="text-xs font-black text-[#E60012]">+ R$ 3.000</div>
                  </div>

                  <div
                    onClick={() => setGpu("rtx4070")}
                    className={`border-2 p-4 rounded-2xl cursor-pointer transition flex justify-between items-center ${
                      gpu === "rtx4070"
                        ? "border-[#E60012] bg-[#161f32]"
                        : "border-slate-800 bg-[#161f32]/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">RTX 4070 12GB (Geração Ada Lovelace)</div>
                      <div className="text-xs text-slate-400">Máxima eficiência energética e suporte AV1</div>
                    </div>
                    <div className="text-xs font-black text-[#E60012]">+ R$ 3.599</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="md:col-span-5 flex flex-col justify-between bg-[#161f32] border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="space-y-4">
                <h3 className="font-black text-lg text-white border-b border-slate-800 pb-3">Resumo da Máquina</h3>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex justify-between">
                    <span className="text-slate-400">CPU:</span>
                    <span className="font-bold text-white text-right">{NOMES.cpu[cpu]}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">RAM:</span>
                    <span className="font-bold text-white text-right">{NOMES.ram[ram]}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">GPU:</span>
                    <span className="font-bold text-white text-right">{NOMES.gpu[gpu]}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Armazenamento:</span>
                    <span className="font-bold text-white">SSD NVMe 1TB Gen4</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Fonte:</span>
                    <span className="font-bold text-white">750W 80 Plus Gold</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Montagem:</span>
                    <span className="font-bold text-emerald-400">Inclusa (Grátis)</span>
                  </li>
                </ul>

                <div className="pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">Preço à vista no PIX (10% OFF):</div>
                  <div className="text-3xl font-black text-[#E60012]">
                    R$ {precoTotal.toLocaleString("pt-BR")}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">ou 10x sem juros no cartão de crédito</div>
                </div>
              </div>

              <a
                href={linkWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#E60012] hover:bg-red-700 text-white py-4 rounded-2xl font-black text-center transition flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Reservar Configuração no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* COMBOS RECOMENDADOS */}
        <section id="combos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Combos Recomendados Prontos</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Configurações pré-balanceadas por nossos técnicos para máxima performance por real investido.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
                  Gamer Competitivo
                </span>
                <h3 className="text-xl font-bold text-white">Core i5 + RTX 4060 + 16GB</h3>
                <p className="text-xs text-slate-400">
                  Ideal para Warzone, Valorant, CS2 e jogos em 1080p com taxas altíssimas de FPS.
                </p>
                <div className="text-2xl font-black text-[#E60012] pt-2">R$ 7.499</div>
              </div>
              <button
                onClick={() => aplicarCombo("i5", "16gb", "rtx4060")}
                className="w-full bg-[#161f32] hover:bg-slate-800 border border-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition"
              >
                Carregar este Combo
              </button>
            </div>

            <div className="bg-[#111827] border-2 border-[#E60012] rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3 right-6 bg-[#E60012] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Combo Mais Vendido
              </div>
              <div className="space-y-3">
                <span className="bg-[#E60012]/20 text-[#E60012] text-xs px-3 py-1 rounded-full font-bold">
                  Workstation 4K
                </span>
                <h3 className="text-xl font-bold text-white">Ryzen 7 + RTX 3080 + 32GB</h3>
                <p className="text-xs text-slate-300">
                  Perfeito para edição de vídeo 4K no Premiere, DaVinci Resolve e modelagem 3D.
                </p>
                <div className="text-2xl font-black text-[#E60012] pt-2">R$ 8.799</div>
              </div>
              <button
                onClick={() => aplicarCombo("ryzen7", "32gb", "rtx3080")}
                className="w-full bg-[#E60012] hover:bg-red-700 text-white font-black py-3 rounded-2xl text-xs transition"
              >
                Carregar este Combo
              </button>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
                  Extreme 3D & Unreal
                </span>
                <h3 className="text-xl font-bold text-white">Core i7 + RTX 4070 + 64GB</h3>
                <p className="text-xs text-slate-400">
                  Poder absoluto para Unreal Engine 5, arquitetura, Blender e jogos em 4K Ultra.
                </p>
                <div className="text-2xl font-black text-[#E60012] pt-2">R$ 10.798</div>
              </div>
              <button
                onClick={() => aplicarCombo("i7", "64gb", "rtx4070")}
                className="w-full bg-[#161f32] hover:bg-slate-800 border border-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition"
              >
                Carregar este Combo
              </button>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-[#111827] to-[#090d16] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E60012]">
              <MapPin className="w-4 h-4" />
              Retirada no Balcão • Cambuí Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Quer Montar com Outras Peças Específicas?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Fale com o Thiago no WhatsApp para orçamentos customizados com qualquer gabinete ou placa de vídeo.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá Thiago! Gostaria de cotar um PC personalizado com peças específicas."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Thiago no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
