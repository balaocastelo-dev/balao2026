"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Cpu, Layers, Video, MapPin, Clock, Phone, ArrowRight, Play, Check, Shield } from "lucide-react";

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
  // Estado das seleções (Padrão = i5, 32GB, RTX 3080 = R$ 7.999)
  const [cpu, setCpu] = useState<"i5" | "ryzen7" | "i7">("i5");
  const [ram, setRam] = useState<"16gb" | "32gb" | "64gb">("32gb");
  const [gpu, setGpu] = useState<"rtx4060" | "rtx3080" | "rtx4070">("rtx3080");
  const [precoTotal, setPrecoTotal] = useState(7999);
  const [linkWhatsapp, setLinkWhatsapp] = useState("");
  
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Efeito para ativar o som do autoplay no primeiro clique do usuário
  useEffect(() => {
    const desmutarVideo = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        // Tentar dar play se tiver pausado por politicas do browser
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

  // Efeito para recalcular o preço total e gerar o link do WhatsApp
  useEffect(() => {
    const total = PRECOS.base + PRECOS.cpu[cpu] + PRECOS.ram[ram] + PRECOS.gpu[gpu];
    setPrecoTotal(total);

    const textoMensagem = `Olá Thiago! Montei um Super PC personalizado no configurador do site Balão:\n\n` +
      `- Processador: ${NOMES.cpu[cpu]}\n` +
      `- Memória RAM: ${NOMES.ram[ram]}\n` +
      `- Placa de Vídeo: ${NOMES.gpu[gpu]}\n` +
      `- Kit Base (Gabinete, Fonte 750W, SSD NVMe 1TB)\n\n` +
      `Total à vista no PIX: R$ ${total.toLocaleString("pt-BR")}\n\n` +
      `Gostaria de encomendar e agendar a retirada no Cambuí. Está disponível?`;

    setLinkWhatsapp(`https://wa.me/5519987510267?text=${encodeURIComponent(textoMensagem)}`);
  }, [cpu, ram, gpu]);

  // Função para setar uma configuração pronta rápida
  const aplicarCombo = (comboCpu: "i5" | "ryzen7" | "i7", comboRam: "16gb" | "32gb" | "64gb", comboGpu: "rtx4060" | "rtx3080" | "rtx4070") => {
    setCpu(comboCpu);
    setRam(comboRam);
    setGpu(comboGpu);
    
    // Rolar suavemente até o configurador
    const el = document.getElementById("configurador");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen antialiased">
      {/* Header / Navbar */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Balão da Informática"
              width={160}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#configurador" className="hover:text-red-650 transition">Configurador</a>
            <a href="#combos" className="hover:text-red-650 transition">Combos Recomendados</a>
            <a href="#diferenciais" className="hover:text-red-650 transition">Por que o Balão?</a>
            <a href="#localizacao" className="hover:text-red-650 transition">Retirada</a>
          </div>
          <div>
            <a
              href="https://wa.me/5519987510267?text=Olá Thiago! Gostaria de fazer um orçamento de Super PC na loja do Cambuí."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg shadow-red-600/10"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.077-4.517 10.08-10.073.002-2.693-1.04-5.224-2.937-7.124-1.9-1.897-4.425-2.94-7.113-2.94-5.56 0-10.082 4.519-10.085 10.077-.001 1.761.463 3.478 1.344 4.996l-.997 3.642 3.734-.977zm11.378-5.32c-.29-.145-1.714-.847-1.979-.942-.266-.097-.459-.145-.653.145-.193.29-.75.942-.919 1.134-.168.19-.338.214-.628.069-.29-.144-1.226-.452-2.336-1.444-.863-.77-1.447-1.721-1.616-2.011-.169-.29-.018-.447.127-.59.13-.13.29-.338.435-.507.145-.168.193-.29.29-.483.097-.193.048-.361-.024-.506-.072-.145-.653-1.573-.894-2.152-.235-.567-.474-.49-.653-.49-.17 0-.361-.019-.554-.019-.193 0-.507.072-.772.361-.266.29-1.014.99-1.014 2.413s1.014 2.798 1.159 2.991c.145.193 1.997 3.05 4.838 4.277.676.29 1.202.464 1.613.595.68.216 1.3.185 1.789.112.545-.081 1.712-.7 1.954-1.376.242-.676.242-1.256.17-1.376-.072-.121-.266-.193-.556-.338z" />
              </svg>
              Orçamento Rápido
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-red-650 text-xs font-bold uppercase tracking-wider">
                ⚡ Desempenho Profissional em Campinas
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-none">
                Monte seu Super PC <br />
                <span className="text-red-600">Gamer & Workstation</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-650 max-w-2xl mx-auto lg:mx-0">
                Elimine travamentos nas suas renderizações, edições em 4K e compilação de código. Monte sua máquina personalizada com peças selecionadas de primeira linha, montagem profissional e garantia física direto na nossa loja no Cambuí.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#configurador"
                  className="w-full sm:w-auto text-center bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20 text-lg"
                >
                  Configurar meu PC
                </a>
                <a
                  href="#combos"
                  className="w-full sm:w-auto text-center border border-gray-300 bg-white hover:bg-gray-50 px-8 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 text-gray-700 shadow-sm"
                >
                  Ver Combos Prontos
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="space-y-6 max-w-md w-full">
                {/* Card 1: Imagem */}
                <div className="relative bg-white border border-gray-200 p-4 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
                  <div className="aspect-video rounded-xl overflow-hidden border border-gray-150 relative">
                    <Image
                      src="/pc_campanha.jpg"
                      alt="Super PC Workstation Balão"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-red-650 shadow-sm">
                      🚀 Workstations Balão 2026
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-gray-950 text-sm">Super PC Custom</h3>
                      <p className="text-[10px] text-gray-500">Montagem premium e Cable Management</p>
                    </div>
                    <span className="bg-red-50 text-red-650 border border-red-100 text-[10px] px-2.5 py-1 rounded font-bold">100% Local</span>
                  </div>
                </div>

                {/* Card 2: Vídeo de Apresentação da Julia */}
                <div className="relative bg-white border border-gray-200 p-4 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
                  <h4 className="font-extrabold text-gray-950 text-sm mb-3 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    Apresentação da Julia (Assistente Virtual)
                  </h4>
                  <div className="aspect-video rounded-xl overflow-hidden border border-gray-150 bg-black relative">
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
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    🔊 Clique no ícone de som do player para ouvir a Julia!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIGURADOR INTERATIVO */}
      <section id="configurador" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950">Simule suas Peças em Tempo Real</h2>
            <p className="text-gray-650 text-base sm:text-lg">
              Selecione o processador, a memória e a placa de vídeo adequados para a sua necessidade. Veja o valor final na hora e envie direto para o WhatsApp do Thiago para reservar.
            </p>
          </div>

          {/* Painel do Configurador */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 lg:p-10 shadow-lg grid md:grid-cols-12 gap-8">
            {/* Seleção de Peças */}
            <div className="md:col-span-7 space-y-8">
              {/* CPU */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                  1. Processador (CPU)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    onClick={() => setCpu("i5")}
                    className={`border-2 p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${
                      cpu === "i5" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">Intel Core i5 (13ª Geração)</h4>
                      <p className="text-xs text-gray-500">Ideal para edição Full HD e tarefas ágeis do dia a dia</p>
                    </div>
                    <span className={`font-extrabold text-xs ${cpu === "i5" ? "text-red-650" : "text-gray-500"}`}>
                      {cpu === "i5" ? "Incluso no Base" : "Base"}
                    </span>
                  </div>
                  <div
                    onClick={() => setCpu("ryzen7")}
                    className={`border-2 p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${
                      cpu === "ryzen7" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">AMD Ryzen 7 Série 7000</h4>
                      <p className="text-xs text-gray-500">Excelente multitarefa, programação pesada e render</p>
                    </div>
                    <span className={`font-extrabold text-xs ${cpu === "ryzen7" ? "text-red-650" : "text-gray-750"}`}>
                      + R$ 800
                    </span>
                  </div>
                  <div
                    onClick={() => setCpu("i7")}
                    className={`border-2 p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${
                      cpu === "i7" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">Intel Core i7 (13ª Geração)</h4>
                      <p className="text-xs text-gray-500">Performance extrema para vídeo 4K, After Effects e 3D</p>
                    </div>
                    <span className={`font-extrabold text-xs ${cpu === "i7" ? "text-red-650" : "text-gray-750"}`}>
                      + R$ 1.400
                    </span>
                  </div>
                </div>
              </div>

              {/* RAM */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                  2. Memória RAM (DDR5 Dual Channel)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setRam("16gb")}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition ${
                      ram === "16gb" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <h4 className="font-bold text-base text-gray-900">16GB</h4>
                    <p className={`text-xs mt-1 ${ram === "16gb" ? "text-red-650 font-bold" : "text-gray-500"}`}>
                      - R$ 500
                    </p>
                  </div>
                  <div
                    onClick={() => setRam("32gb")}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition ${
                      ram === "32gb" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <h4 className="font-bold text-base text-gray-900">32GB</h4>
                    <p className={`text-xs mt-1 ${ram === "32gb" ? "text-red-655 font-bold" : "text-gray-500"}`}>
                      Recomendado
                    </p>
                  </div>
                  <div
                    onClick={() => setRam("64gb")}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition ${
                      ram === "64gb" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <h4 className="font-bold text-base text-gray-900">64GB</h4>
                    <p className={`text-xs mt-1 ${ram === "64gb" ? "text-red-655 font-bold" : "text-gray-750"}`}>
                      + R$ 800
                    </p>
                  </div>
                </div>
              </div>

              {/* GPU */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                  3. Placa de Vídeo (GPU)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    onClick={() => setGpu("rtx4060")}
                    className={`border-2 p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${
                      gpu === "rtx4060" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">NVIDIA GeForce RTX 4060 8GB</h4>
                      <p className="text-xs text-gray-500">Ótima eficiência energética, DLSS 3 e IA ativada</p>
                    </div>
                    <span className={`font-extrabold text-xs ${gpu === "rtx4060" ? "text-red-655" : "text-gray-750"}`}>
                      Base Custo
                    </span>
                  </div>
                  <div
                    onClick={() => setGpu("rtx3080")}
                    className={`border-2 p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${
                      gpu === "rtx3080" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">NVIDIA GeForce RTX 3080 12GB</h4>
                      <p className="text-xs text-gray-500">Brutal poder de render e largura de banda profissional (384-bit)</p>
                    </div>
                    <span className={`font-extrabold text-xs ${gpu === "rtx3080" ? "text-red-650" : "text-red-650 font-bold"}`}>
                      - R$ 200
                    </span>
                  </div>
                  <div
                    onClick={() => setGpu("rtx4070")}
                    className={`border-2 p-4 rounded-xl cursor-pointer transition flex justify-between items-center ${
                      gpu === "rtx4070" ? "border-red-650 bg-white" : "border-gray-200 bg-white hover:border-gray-305"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">NVIDIA GeForce RTX 4070 12GB</h4>
                      <p className="text-xs text-gray-500">Pronta para IA local, Ray Tracing pesado e VRAM alta</p>
                    </div>
                    <span className={`font-extrabold text-xs ${gpu === "rtx4070" ? "text-red-655" : "text-gray-750"}`}>
                      + R$ 399
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo e Fechamento */}
            <div className="md:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-lg font-black text-gray-950 border-b border-gray-150 pb-4 mb-4">
                  Resumo da Configuração
                </h3>
                
                <div className="space-y-4 text-sm text-gray-600 mb-8">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Gabinete/Fonte/SSD:</span>
                    <span className="font-bold text-gray-900">R$ 2.999</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="text-gray-400">Processador:</span>
                    <span className="font-bold text-gray-900">{NOMES.cpu[cpu]}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="text-gray-400">Memória RAM:</span>
                    <span className="font-bold text-gray-900">{NOMES.ram[ram]}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <span className="text-gray-400">Placa de Vídeo:</span>
                    <span className="font-bold text-gray-900">{NOMES.gpu[gpu]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-500">À vista no PIX:</span>
                  <span className="text-3xl font-black text-red-600">
                    R$ {precoTotal.toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-650" />
                  Garantia local de 1 ano + Montagem inclusa
                </p>
                
                <a
                  href={linkWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition text-base shadow-md shadow-red-600/10 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.077-4.517 10.08-10.073.002-2.693-1.04-5.224-2.937-7.124-1.9-1.897-4.425-2.94-7.113-2.94-5.56 0-10.082 4.519-10.085 10.077-.001 1.761.463 3.478 1.344 4.996l-.997 3.642 3.734-.977zm11.378-5.32c-.29-.145-1.714-.847-1.979-.942-.266-.097-.459-.145-.653.145-.193.29-.75.942-.919 1.134-.168.19-.338.214-.628.069-.29-.144-1.226-.452-2.336-1.444-.863-.77-1.447-1.721-1.616-2.011-.169-.29-.018-.447.127-.59.13-.13.29-.338.435-.507.145-.168.193-.29.29-.483.097-.193.048-.361-.024-.506-.072-.145-.653-1.573-.894-2.152-.235-.567-.474-.49-.653-.49-.17 0-.361-.019-.554-.019-.193 0-.507.072-.772.361-.266.29-1.014.99-1.014 2.413s1.014 2.798 1.159 2.991c.145.193 1.997 3.05 4.838 4.277.676.29 1.202.464 1.613.595.68.216 1.3.185 1.789.112.545-.081 1.712-.7 1.954-1.376.242-.676.242-1.256.17-1.376-.072-.121-.266-.193-.556-.338z" />
                  </svg>
                  Reservar via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMBOS PRONTOS RECOMENDADOS */}
      <section id="combos" className="py-24 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-red-655 font-bold uppercase tracking-wider text-xs">Custo-Benefício Fechado</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950">Combos Prontos Balão</h2>
            <p className="text-gray-600">Opções testadas e aprovadas para o melhor custo-benefício profissional.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Combo 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/50 hover:shadow-md transition duration-300 relative group">
              <div>
                <span className="absolute top-4 right-4 bg-green-50 text-green-600 border border-green-100 text-xs px-2.5 py-1 rounded-full font-bold">Mais Vendido</span>
                <h3 className="text-xl font-black text-gray-900 mb-2 mt-2">Workstation i5 Power</h3>
                <p className="text-sm text-gray-500 mb-6">Equilíbrio perfeito para edição de vídeo Full HD ágil, Photoshop e Illustrator fluídos.</p>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Intel Core i5 (13ª Ger.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-semibold text-gray-900">32GB RAM DDR5 Dual Channel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-semibold text-gray-900">RTX 3080 12GB (384-bit)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>SSD NVMe 1TB ultra rápido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Fonte 750W Eficiência 80 Plus</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Preço final PIX:</span>
                  <span className="text-2xl font-black text-red-600">R$ 7.999</span>
                </div>
                <button
                  onClick={() => aplicarCombo("i5", "32gb", "rtx3080")}
                  className="w-full text-center border border-red-600 text-red-650 hover:bg-red-50 py-3 rounded-xl font-bold transition text-sm flex items-center justify-center gap-2"
                >
                  Selecionar no Simulador
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Combo 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/50 hover:shadow-md transition duration-300 relative group">
              <div>
                <span className="absolute top-4 right-4 bg-rose-50 text-red-600 border border-rose-100 text-xs px-2.5 py-1 rounded-full font-bold">Ideal Programador</span>
                <h3 className="text-xl font-black text-gray-900 mb-2 mt-2">Workstation Ryzen Multitask</h3>
                <p className="text-sm text-gray-500 mb-6">Excelente poder de multitarefa para programadores de software e agências de marketing.</p>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-semibold text-gray-900">AMD Ryzen 7 Série 7000</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-semibold text-gray-900">32GB RAM DDR5 Dual Channel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>NVIDIA RTX 4060 8GB DLSS3</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>SSD NVMe 1TB ultra rápido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Fonte 750W Eficiência 80 Plus</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Preço final PIX:</span>
                  <span className="text-2xl font-black text-red-600">R$ 8.999</span>
                </div>
                <button
                  onClick={() => aplicarCombo("ryzen7", "32gb", "rtx4060")}
                  className="w-full text-center border border-red-600 text-red-650 hover:bg-red-50 py-3 rounded-xl font-bold transition text-sm flex items-center justify-center gap-2"
                >
                  Selecionar no Simulador
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Combo 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/50 hover:shadow-md transition duration-300 relative group">
              <div>
                <span className="absolute top-4 right-4 bg-amber-50 text-amber-600 border border-amber-100 text-xs px-2.5 py-1 rounded-full font-bold">Máximo Poder</span>
                <h3 className="text-xl font-black text-gray-900 mb-2 mt-2">Workstation i7 Ultra 4K</h3>
                <p className="text-sm text-gray-500 mb-6">Poder máximo para YouTubers de alta frequência, 3D brutíssimo e compilação maciça.</p>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-semibold text-gray-900">Intel Core i7 (13ª Ger.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-semibold text-gray-900">32GB RAM DDR5 Dual Channel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>NVIDIA RTX 4060 8GB DLSS3</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>SSD NVMe 1TB ultra rápido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Fonte 750W Eficiência 80 Plus</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-400">Preço final PIX:</span>
                  <span className="text-2xl font-black text-red-600">R$ 9.999</span>
                </div>
                <button
                  onClick={() => aplicarCombo("i7", "32gb", "rtx4060")}
                  className="w-full text-center border border-red-600 text-red-650 hover:bg-red-50 py-3 rounded-xl font-bold transition text-sm flex items-center justify-center gap-2"
                >
                  Selecionar no Simulador
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS BALÃO */}
      <section id="diferenciais" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-black text-gray-950">Por que escolher o Balão da Informática?</h2>
            <p className="text-gray-500">Garantimos a melhor experiência de compra e suporte técnico local de Campinas.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-650 text-xl font-bold">
                🛠️
              </div>
              <h4 className="text-lg font-bold text-gray-900">Montagem Profissional</h4>
              <p className="text-sm text-gray-500">
                Organização impecável de cabos (Cable Management), otimizando a ventilação interna e vida útil das peças.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-250 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-650 text-xl font-bold">
                🔍
              </div>
              <h4 className="text-lg font-bold text-gray-900">Testes de Stress Físico</h4>
              <p className="text-sm text-gray-500">
                Toda máquina montada passa por 4 horas de testes intensivos de benchmark (temperatura e desempenho) antes da entrega.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-650 text-xl font-bold">
                🏠
              </div>
              <h4 className="text-lg font-bold text-gray-900">Garantia Física Cambuí</h4>
              <p className="text-sm text-gray-500">
                Sem dor de cabeça com fretes ou Correios. Se precisar de suporte, resolvemos fisicamente direto na nossa loja.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-250 p-6 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-650 text-xl font-bold">
                🤝
              </div>
              <h4 className="text-lg font-bold text-gray-900">Negociação Direta</h4>
              <p className="text-sm text-gray-500">
                Atendimento consultivo e personalizado de dono para dono no WhatsApp oficial do Balão.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LOCALIZACAO & RETIRADA */}
      <section id="localizacao" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-gray-950">Retirada Física Segura</h2>
              <p className="text-gray-650">
                Prezamos pela transparência e proximidade com nossos clientes. Você pode vir e testar o seu computador customizado na nossa bancada de testes antes de realizar o PIX.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Endereço de Retirada</h5>
                    <p className="text-sm text-gray-500">Av. Anchieta, 789 - Cambuí, Campinas - SP</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Horário de Atendimento</h5>
                    <p className="text-sm text-gray-500">Segunda a Sexta: 09:00 às 18:00 | Sábado: 09:00 às 13:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Telefones & Canais</h5>
                    <p className="text-sm text-gray-500">(19) 3255-1661 / WhatsApp: (19) 98751-0267</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="https://goo.gl/maps/6NqKJTYTNLKuTy2k9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl text-sm font-bold transition text-gray-700 shadow-sm"
                >
                  <MapPin className="w-4 h-4 text-red-650" />
                  Abrir no Google Maps
                </a>
              </div>
            </div>

            <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden aspect-video shadow-premium flex flex-col items-center justify-center p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-extrabold text-gray-800">Balão da Informática - Cambuí</p>
              <p className="text-xs text-gray-500 mt-1">Av. Anchieta, 789 - Campinas/SP</p>
              <p className="text-[10px] text-gray-400 mt-4">Próximo ao Bosque dos Jequitibás</p>
              <a
                href="https://goo.gl/maps/6NqKJTYTNLKuTy2k9"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-transparent"
              ></a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-400 space-y-4">
          <p>BALÃO DA INFORMÁTICA - Av. Anchieta, 789 - Cambuí, Campinas/SP</p>
          <p>&copy; 2026 Balão da Informática. Todos os direitos reservados. Imagens meramente ilustrativas.</p>
        </div>
      </footer>
    </div>
  );
}
