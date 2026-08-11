'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

// --- CONFIGURAÇÃO DOS PRÊMIOS ---
// Imagens reais baixadas localmente
type Prize = {
  id: number;
  text: string;
  subtext?: string;
  color: string;
  type: 'win' | 'loss';
  probability: number;
  image: string | null;
  emoji?: string;
};

const PRIZES: Prize[] = [
  { 
    id: 1, 
    text: 'R$ 10,00 Pix', 
    color: '#00CC66', 
    type: 'win', 
    probability: 0.05, 
    image: '/images/prizes/10reais.jpg' 
  },
  { 
    id: 2, 
    text: 'Tente de Novo', 
    color: '#FF3333', 
    type: 'loss', 
    probability: 0.24, 
    image: null, 
    emoji: '😢'
  },
  { 
    id: 3, 
    text: 'Fone com Fio', 
    color: '#FF0055', 
    type: 'win', 
    probability: 0.05, 
    image: '/images/prizes/headset.jpg' 
  },
  { 
    id: 4, 
    text: 'R$ 2,00 no PIX', 
    color: '#FF00CC', 
    type: 'win', 
    probability: 0.20, 
    image: '/images/prizes/2reais.jpg' 
  },
  { 
    id: 5, 
    text: 'PS5', 
    color: '#9D00FF', 
    type: 'win', // Comemorar se ganhar (apenas via cheat)
    probability: 0, 
    image: '/images/prizes/ps5.jpg' 
  },
  { 
    id: 6, 
    text: '5% OFF', 
    color: '#FF9900', 
    type: 'win', 
    probability: 0.05, 
    image: '/images/prizes/bitcoin.svg' 
  },
  { 
    id: 7, 
    text: 'Não foi dessa vez', 
    color: '#888888', 
    type: 'loss', 
    probability: 0.24, 
    image: null,
    emoji: '😢'
  },
  { 
    id: 8, 
    text: 'Cabo USB', 
    color: '#CCFF00', 
    type: 'win', 
    probability: 0.05, 
    image: '/images/prizes/usb.jpg' 
  },
  { 
    id: 9, 
    text: 'PC Gamer', 
    color: '#00FFFF', 
    type: 'win', // Comemorar se ganhar (apenas via cheat)
    probability: 0, 
    image: '/images/prizes/pc.jpg' 
  },
  { 
    id: 10, 
    text: 'R$ 5,00 Pix', 
    color: '#00FF99', 
    type: 'win', 
    probability: 0.10, 
    image: '/images/prizes/5reais.jpg' 
  },
  { 
    id: 11, 
    text: '10% OFF', 
    color: '#0099FF', 
    type: 'win', 
    probability: 0.02, 
    image: '/images/prizes/discount10.jpg' 
  },
];

const WINNING_PRIZES = PRIZES.filter(p => p.probability > 0);

// --- LOGO COMPONENT (Placeholder SVG se a imagem não carregar) ---
const Logo = () => (
  <div className="flex justify-center mb-6">
    <picture>
      <source srcSet="/logo.png" type="image/png" />
      <img 
        src="/logo.png" 
        alt="Balão da Informática Logo" 
        className="h-24 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `<h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] tracking-tighter">Balão da<br/>Informática</h1>`;
        }}
      />
    </picture>
  </div>
);

// --- SOUND MANAGER AVANÇADO ---
const SoundManager = {
  ctx: null as AudioContext | null,
  masterGain: null as GainNode | null,
  spinOsc: null as OscillatorNode | null,
  spinGain: null as GainNode | null,
  isMuted: false,
  volume: 1.0,

  init: () => {
    if (typeof window !== 'undefined' && !SoundManager.ctx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      SoundManager.ctx = new AudioContext();
      SoundManager.masterGain = SoundManager.ctx.createGain();
      SoundManager.masterGain.connect(SoundManager.ctx.destination);
      
      // Carregar preferências
      const savedMute = localStorage.getItem('roleta_muted');
      const savedVol = localStorage.getItem('roleta_volume');
      if (savedMute !== null) SoundManager.isMuted = savedMute === 'true';
      if (savedVol !== null) SoundManager.volume = parseFloat(savedVol);
      
      SoundManager.updateVolume();
    }
  },

  updateVolume: () => {
    if (SoundManager.masterGain && SoundManager.ctx) {
      const targetVol = SoundManager.isMuted ? 0 : SoundManager.volume;
      SoundManager.masterGain.gain.setTargetAtTime(targetVol, SoundManager.ctx.currentTime, 0.1);
    }
  },

  setMute: (mute: boolean) => {
    SoundManager.isMuted = mute;
    localStorage.setItem('roleta_muted', mute.toString());
    SoundManager.updateVolume();
  },

  setVolume: (vol: number) => {
    SoundManager.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('roleta_volume', SoundManager.volume.toString());
    SoundManager.updateVolume();
  },

  // Som contínuo de "rumble" da roleta
  startSpinSound: () => {
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx || !SoundManager.masterGain) return;

    // Se já existe, parar anterior
    if (SoundManager.spinOsc) {
      SoundManager.stopSpinSound();
    }

    // Criar ruído rosa/marrom filtrado para simular rolamento mecânico
    const bufferSize = 2 * SoundManager.ctx.sampleRate;
    const noiseBuffer = SoundManager.ctx.createBuffer(1, bufferSize, SoundManager.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; 
    }

    const noise = SoundManager.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filtro para dar a característica "grave" de uma roda pesada
    const filter = SoundManager.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100; // Começa grave

    SoundManager.spinGain = SoundManager.ctx.createGain();
    SoundManager.spinGain.gain.value = 0; // Fade in

    noise.connect(filter);
    filter.connect(SoundManager.spinGain);
    SoundManager.spinGain.connect(SoundManager.masterGain);

    noise.start();
    SoundManager.spinOsc = noise as any; // Guardar referência (embora seja buffer source)
    
    // Guardar referências para modulação
    (SoundManager as any).spinFilter = filter;
  },

  updateSpinSound: (speed: number) => {
    if (!SoundManager.ctx || !(SoundManager as any).spinFilter || !SoundManager.spinGain) return;
    
    // Speed 0 a 1
    // Aumentar frequência de corte e volume com a velocidade
    const filter = (SoundManager as any).spinFilter as BiquadFilterNode;
    const gain = SoundManager.spinGain;

    const targetFreq = 100 + (speed * 800); // 100Hz a 900Hz
    const targetGain = 0.2 + (speed * 0.8); // Volume aumenta com velocidade

    filter.frequency.setTargetAtTime(targetFreq, SoundManager.ctx.currentTime, 0.1);
    gain.gain.setTargetAtTime(targetGain, SoundManager.ctx.currentTime, 0.1);
  },

  stopSpinSound: () => {
    if (SoundManager.spinGain && SoundManager.ctx) {
      // Fade out
      SoundManager.spinGain.gain.setTargetAtTime(0, SoundManager.ctx.currentTime, 0.5);
      setTimeout(() => {
        if (SoundManager.spinOsc) {
          try { (SoundManager.spinOsc as any).stop(); } catch (e) {}
          SoundManager.spinOsc = null;
        }
      }, 600);
    }
  },

  playTick: (speed: number) => { 
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx || !SoundManager.masterGain) return;
    
    const osc = SoundManager.ctx.createOscillator();
    const gain = SoundManager.ctx.createGain();
    osc.type = 'square'; // Click mais "mecânico"
    
    const baseFreq = 800 + (speed * 600); 
    osc.frequency.setValueAtTime(baseFreq, SoundManager.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, SoundManager.ctx.currentTime + 0.03);
    
    // Volume curto e seco
    gain.gain.setValueAtTime(0.3 * speed, SoundManager.ctx.currentTime); // Mais alto se rápido
    gain.gain.exponentialRampToValueAtTime(0.001, SoundManager.ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(SoundManager.masterGain);
    osc.start();
    osc.stop(SoundManager.ctx.currentTime + 0.05);
  },

  playWin: () => {
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx || !SoundManager.masterGain) return;
    const now = SoundManager.ctx.currentTime;
    
    // Fanfarra complexa
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    const times = [0, 0.15, 0.3, 0.45, 0.6, 0.75];
    
    notes.forEach((freq, i) => {
      const osc = SoundManager.ctx!.createOscillator();
      const gain = SoundManager.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + times[i]);
      
      gain.gain.setValueAtTime(0, now + times[i]);
      gain.gain.linearRampToValueAtTime(0.3, now + times[i] + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + 0.8);
      
      osc.connect(gain);
      gain.connect(SoundManager.masterGain!);
      osc.start(now + times[i]);
      osc.stop(now + times[i] + 1.0);
    });
  }
};

export default function RoletaPage() {
  const [step, setStep] = useState<'welcome' | 'challenge1' | 'challenge2' | 'roulette' | 'result'>('welcome');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof PRIZES[0] | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [leverPulled, setLeverPulled] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [ledRadiusPercent, setLedRadiusPercent] = useState(48);
  
  const wheelRef = useRef<HTMLDivElement>(null);

  // Inicializar estado do som
  useEffect(() => {
    SoundManager.init();
    setIsMuted(SoundManager.isMuted);
    setVolume(SoundManager.volume * 100);
  }, []);

  useEffect(() => {
    const calc = () => {
      if (!wheelRef.current) return;
      const rect = wheelRef.current.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      const computed = getComputedStyle(wheelRef.current);
      const borderWidth = parseFloat(computed.borderTopWidth || '12') || 12;
      const ledDiameter = 16;
      const ledScaleMax = 1.05;
      const outerR = size / 2;
      const innerR = outerR - borderWidth;
      const targetR = Math.max(0, innerR - (ledDiameter * ledScaleMax) / 2 - 1);
      const pct = (targetR / outerR) * 50;
      setLedRadiusPercent(pct);
    };
    calc();
    const onResize = () => calc();
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && wheelRef.current) {
      ro = new ResizeObserver(() => calc());
      ro.observe(wheelRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
    };
  }, []);
  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    SoundManager.setMute(newVal);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    SoundManager.setVolume(val / 100);
  };

  const handleStart = () => {
    SoundManager.init();
    setStep('challenge1');
  };

  const handleVerifyGoogle = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('challenge2'); }, 2000);
  };

  const handleVerifyInsta = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('roulette'); }, 2000);
  };

  const spinWheel = (e?: React.MouseEvent) => {
    if (!wheelRef.current) return;
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Iniciar som contínuo
    SoundManager.startSpinSound();

    let selectedPrize;

    // CHEAT MODE: Shift + Click libera prêmios "impossíveis" (PC Gamer ou PS5)
    if (e?.shiftKey) {
      const cheatPrizes = PRIZES.filter(p => p.id === 5 || p.id === 9); // IDs do PS5 e PC Gamer
      selectedPrize = cheatPrizes[Math.floor(Math.random() * cheatPrizes.length)];
    } else {
      const lastPrizeId = localStorage.getItem('last_prize_id');
      let availablePrizes = WINNING_PRIZES;
      if (lastPrizeId && WINNING_PRIZES.length > 1) {
        availablePrizes = WINNING_PRIZES.filter(p => p.id.toString() !== lastPrizeId);
      }

      const random = Math.random();
      const totalProb = availablePrizes.reduce((acc, p) => acc + p.probability, 0);
      let randomPointer = random * totalProb;
      selectedPrize = availablePrizes[0];
      
      for (const prize of availablePrizes) {
        randomPointer -= prize.probability;
        if (randomPointer <= 0) {
          selectedPrize = prize;
          break;
        }
      }
    }

    localStorage.setItem('last_prize_id', selectedPrize.id.toString());

    // CALCULO DE ROTAÇÃO PRECISO (para parar no MEIO da fatia)
    const sliceAngle = 360 / PRIZES.length;
    const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
    
    // O ponteiro está no topo (0 graus).
    // A fatia N começa em (N * sliceAngle) e termina em ((N+1) * sliceAngle).
    // O centro da fatia N é (N * sliceAngle) + (sliceAngle / 2).
    // Para alinhar o centro da fatia N no topo, precisamos rotacionar -centro.
    // Adicionamos voltas completas (360 * 8) para o efeito de giro.
    
    const centerOffset = (sliceAngle / 2); // Metade da fatia
    const targetRotationBase = (360 * 8) - (prizeIndex * sliceAngle) - centerOffset;
    
    // Adicionar pequena variação aleatória segura (max +/- 20% da fatia) para não parecer robótico, 
    // mas longe das bordas (que seriam +/- 50%).
    const safeRandomRange = sliceAngle * 0.2; 
    const randomOffset = (Math.random() * safeRandomRange * 2) - safeRandomRange;
    
    const targetRotation = targetRotationBase + randomOffset;

    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      duration: 8,
      ease: "power2.inOut",
      onUpdate: function() {
        const progress = this.progress();
        const speed = 1 - Math.pow(progress - 0.5, 2) * 4; 
        
        // Atualizar som contínuo
        SoundManager.updateSpinSound(speed);

        const currentRot = this.targets()[0]._gsap.rotation;
        if (Math.floor(currentRot) % Math.floor(sliceAngle) === 0) {
           const soundSpeed = progress > 0.8 ? (1 - progress) * 5 : 1; 
           SoundManager.playTick(soundSpeed);
        }
      },
      onComplete: () => {
        SoundManager.stopSpinSound();
        setIsSpinning(false);
        
        if (selectedPrize.type === 'win') {
           SoundManager.playWin();
           const colors = [selectedPrize.color, '#ffffff', '#ffd700'];
           confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: colors, disableForReducedMotion: true });
           setTimeout(() => {
               confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
               confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
           }, 300);
        }
        
        setResult(selectedPrize);
        setTimeout(() => setStep('result'), 1500);
      }
    });
  };

  const handleLeverClick = (e: React.MouseEvent) => {
    if (leverPulled || isSpinning) return;
    setLeverPulled(true);
    spinWheel(e);
    setTimeout(() => {
      setLeverPulled(false);
    }, 400);
  };

  const handleSpinButtonClick = () => {
    if (isSpinning) return;
    spinWheel();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col items-center justify-center p-4 relative"
         style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)' }}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-75"></div>
      </div>

      {/* Controle de Som Flutuante */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleMute} 
          className="p-3 bg-black/50 hover:bg-white/10 rounded-full transition-colors border border-slate-700 backdrop-blur-sm"
          title={isMuted ? "Ativar som" : "Silenciar"}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        
        {/* LOGO AREA */}
        <Logo />
        <div className="w-full bg-black/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.1)] transition-all duration-500">
        {/* CONTAINER PRINCIPAL */}
          {step === 'welcome' && (
            <div className="text-center animate-fadeIn max-w-md mx-auto">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/30 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Bem-vindo ao Clube de Vantagens!</h2>
                <p className="text-slate-300 text-lg">Gire a roleta e ganhe prêmios exclusivos na hora.</p>
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Bem-vindo ao Clube de Vantagens!</h2>
                <p className="text-slate-300 text-lg">Gire a roleta e ganhe prêmios exclusivos na hora.</p>
              </div>
              <button 
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-6 rounded-2xl text-2xl shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all transform hover:scale-105 active:scale-95"
              >
                QUERO JOGAR 🎰
              </button>
            </div>
          )}

          {(step === 'challenge1' || step === 'challenge2') && (
             <div className="text-center animate-fadeIn max-w-md mx-auto">
               <h2 className={`text-2xl font-bold mb-6 ${step === 'challenge1' ? 'text-cyan-400' : 'text-pink-500'}`}>
                 {step === 'challenge1' ? 'Etapa 1: Avaliação Google' : 'Etapa 2: Siga no Instagram'}
               </h2>
               <div className={`bg-white p-6 rounded-2xl mx-auto w-fit mb-8 shadow-[0_0_30px_${step === 'challenge1' ? 'rgba(0,255,255,0.3)' : 'rgba(255,0,128,0.3)'}]`}>
                 <QRCodeSVG 
                    value={step === 'challenge1' ? "https://g.page/r/CRDiroCe65RREAE/review" : "https://www.instagram.com/balaodainformatica_castelo/"} 
                    size={220} 
                 />
               </div>
               
               <button 
                 onClick={step === 'challenge1' ? handleVerifyGoogle : handleVerifyInsta}
                 disabled={loading}
                 className={`w-full font-bold py-4 rounded-xl transition-all text-xl ${
                   step === 'challenge1' 
                     ? 'bg-green-600 hover:bg-green-500 text-white' 
                     : 'bg-pink-600 hover:bg-pink-500 text-white'
                 }`}
               >
                 {loading ? 'Verificando...' : (step === 'challenge1' ? 'JÁ AVALIEI! ✅' : 'JÁ SEGUI! 🚀')}
               </button>
             </div>
          )}

          {step === 'roulette' && (
            <div className="text-center animate-fadeIn relative flex flex-col items-center">
              {!isMuted && !isSpinning && (
                <div className="absolute opacity-0 pointer-events-none w-0 h-0">
                  <iframe
                    src="https://www.youtube.com/embed/pct1uEhAqBQ?start=12&autoplay=1&loop=1&playlist=pct1uEhAqBQ&controls=0&modestbranding=1"
                    title="Circus music"
                    allow="autoplay; encrypted-media"
                  />
                </div>
              )}
              <div className="relative mb-6 md:mb-12 transform transition-transform hover:scale-[1.02] duration-500">
                {/* Indicador/Seta FIXO no topo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 z-40 w-16 h-16 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                   <svg viewBox="0 0 100 100" className="w-full h-full fill-red-600 stroke-white stroke-2">
                     <path d="M 50 100 L 20 20 L 80 20 Z" />
                   </svg>
                </div>

                <div className="absolute inset-0 z-20 pointer-events-none rounded-full hidden md:block">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const angle = (i / 36) * 2 * Math.PI;
                    const radius = ledRadiusPercent;
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    const delay = i % 2 === 0 ? '0s' : '0.5s';
                    
                    return (
                      <div
                        key={`light-${i}`}
                        className="absolute w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] transition-opacity duration-300"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: i % 3 === 0 ? '#ff0000' : (i % 3 === 1 ? '#00ff00' : '#ffff00'), // RGB Lights
                          boxShadow: `0 0 8px ${i % 3 === 0 ? '#ff0000' : (i % 3 === 1 ? '#00ff00' : '#ffff00')}`,
                          animation: `blinkLights 1s infinite alternate ${delay}`
                        }}
                      />
                    );
                  })}
                  <style>{`
                    @keyframes blinkLights {
                      0% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
                      100% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                    }
                    @keyframes leverPull {
                      0% { transform: translateY(0); }
                      40% { transform: translateY(32px); }
                      100% { transform: translateY(0); }
                    }
                  `}</style>
                </div>

                <div 
                  ref={wheelRef}
                  className="rounded-full border-[12px] border-yellow-600 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden relative will-change-transform bg-slate-900"
                  style={{ 
                    width: 'min(90vw, 70vh)',
                    height: 'min(90vw, 70vh)',
                    maxWidth: '780px',
                    maxHeight: '780px',
                    background: `conic-gradient(
                      ${PRIZES.map((p, i) => `${p.color} ${(i * 100) / PRIZES.length}% ${((i + 1) * 100) / PRIZES.length}%`).join(', ')}
                    )`,
                  }} 
                >
                  {/* Linhas Divisórias (Bordas entre prêmios) */}
                  {PRIZES.map((_, i) => {
                     const sliceAngle = 360 / PRIZES.length;
                     const rotation = i * sliceAngle;
                     return (
                       <div
                         key={`border-${i}`}
                         className="absolute top-0 left-1/2 w-[4px] h-1/2 bg-white origin-bottom z-20" // Borda grossa branca
                         style={{ 
                           transform: `translateX(-50%) rotate(${rotation}deg)` 
                         }}
                       />
                     );
                  })}

                  {/* Itens da Roleta */}
                  {PRIZES.map((prize, index) => {
                    const numPrizes = PRIZES.length;
                    const sliceAngle = 360 / numPrizes;
                    const rotation = sliceAngle * index + (sliceAngle / 2);
                    
                    // Cálculo preciso da largura da fatia baseado no número de prêmios
                    const halfAngle = 180 / numPrizes;
                    const tanVal = Math.tan(halfAngle * Math.PI / 180);
                    // Largura % do diâmetro = tan(halfAngle) * 100
                    // Adicionamos 0.5% extra para evitar linhas brancas entre fatias
                    const widthPercent = (tanVal * 100) + 0.5;
                    
                    return (
                      <div key={prize.id} className="absolute inset-0">
                        {/* 1. BACKGROUND DA FATIA (Imagem Triangular) */}
                        <div 
                          className="absolute top-0 left-1/2 h-[50%] z-10 origin-bottom overflow-hidden"
                          style={{ 
                            width: `${widthPercent}%`, 
                            marginLeft: `-${widthPercent / 2}%`, 
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: 'bottom center',
                            clipPath: 'polygon(0 0, 100% 0, 50% 100%)', // Formato Triangular
                          }}
                        >
                           <div className="relative w-full h-full">
                              {/* Fundo colorido base */}
                              <div className="absolute inset-0" style={{ backgroundColor: prize.color }}></div>
                              
                              {prize.image ? (
                                <img 
                                   src={prize.image} 
                                   alt={prize.text}
                                   className="w-full h-full object-cover transform scale-110" 
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center pt-12">
                                   <span className="text-4xl md:text-6xl filter drop-shadow-lg">{prize.emoji}</span>
                                 </div>
                              )}
                              
                              {/* Overlay gradiente para garantir leitura do texto */}
                              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/30"></div>
                           </div>
                        </div>

                        {/* 2. CONTEÚDO DA FATIA (Texto) */}
                        <div 
                          className="absolute w-full h-[50%] top-0 left-0 flex flex-col justify-start items-center pt-8 origin-bottom z-30 pointer-events-none"
                          style={{ 
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: 'bottom center' 
                          }}
                        >
                           <div className="flex flex-col items-center max-w-[25%] text-center">
                             <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wider leading-none break-words shadow-black">
                               {prize.text}
                             </span>
                             {prize.subtext ? (
                               <span className="text-[10px] font-bold text-yellow-300 mt-1 drop-shadow-md leading-tight">
                                 {prize.subtext}
                               </span>
                             ) : null}
                           </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Centro da Roleta (Hub) */}
                  <div className="absolute top-1/2 left-1/2 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center z-50 border-4 border-white">
                    <div className="w-3/4 h-3/4 bg-red-600 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-white font-bold text-xs md:text-sm">BALÃO</span>
                    </div>
                  </div>
                </div>
                
                {/* Alavanca (somente em telas grandes) */}
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center z-30">
                  <div
                    className="flex flex-col items-center"
                    style={leverPulled ? { animation: 'leverPull 0.5s ease-out' } : {}}
                  >
                    <div className="w-3 h-24 md:w-4 md:h-28 bg-gradient-to-b from-slate-200 to-slate-700 rounded-full border border-slate-500 shadow-lg" />
                    <button
                      onClick={handleLeverClick}
                      className="mt-2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-2 border-yellow-300 shadow-[0_0_20px_rgba(255,0,0,0.6)] flex items-center justify-center text-[10px] md:text-xs font-black text-white active:scale-95"
                    >
                      PUXAR
                    </button>
                  </div>
                </div>

                {/* Botão para telas pequenas */}
                <div className="mt-6 w-full flex md:hidden justify-center">
                  <button
                    onClick={handleSpinButtonClick}
                    disabled={isSpinning}
                    className="px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(0,255,255,0.3)] active:scale-95 disabled:opacity-60"
                  >
                    GIRAR 🎡
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="text-center animate-scaleIn">
              <h2 className={`text-4xl md:text-5xl font-black mb-4 drop-shadow-lg ${result.type === 'win' ? 'text-yellow-400' : 'text-slate-400'}`}>
                {result.type === 'win' ? 'PARABÉNS! 🎉' : 'QUE PENA! 😢'}
              </h2>
              
              <div className={`bg-gradient-to-br p-10 rounded-3xl border-4 shadow-[0_0_60px_rgba(255,215,0,0.4)] mb-8 relative overflow-hidden group max-w-lg mx-auto ${result.type === 'win' ? 'from-slate-800 to-black border-yellow-500' : 'from-slate-800 to-slate-900 border-slate-600 grayscale'}`}>
                <div className={`absolute inset-0 animate-pulse ${result.type === 'win' ? 'bg-yellow-500/10' : 'bg-red-500/5'}`}></div>
                
                {result.image ? (
                  <img 
                    src={result.image} 
                    alt={result.text}
                    className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transform group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-9xl mb-6 text-center">{result.emoji}</div>
                )}
                
                <h3 className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text uppercase tracking-widest relative z-10 ${result.type === 'win' ? 'bg-gradient-to-r from-yellow-300 to-orange-500' : 'bg-gradient-to-r from-slate-400 to-slate-200'}`}>
                  {result.text}
                </h3>
              </div>

              <p className="text-slate-400 mb-8 text-lg">
                {result.type === 'win' ? 'Tire um print desta tela e mostre ao vendedor!' : 'Não desanime! Tente novamente em breve.'}
              </p>

              <button 
                onClick={() => window.location.reload()}
                className="text-cyan-400 underline hover:text-cyan-300 text-lg"
              >
                Jogar Novamente
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-slate-500 text-sm text-center z-10">
        &copy; 2026 Balão da Informática Castelo.
      </footer>
    </div>
  );
}
