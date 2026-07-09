"use client";

import { useEffect, useRef, useState } from "react";

const FLAG_COLORS = [
  { bg: "#E63946", accent: "#FFD166" },
  { bg: "#2A9D8F", accent: "#E9C46A" },
  { bg: "#E76F51", accent: "#F4A261" },
  { bg: "#264653", accent: "#2A9D8F" },
  { bg: "#F4A261", accent: "#E76F51" },
  { bg: "#E9C46A", accent: "#2A9D8F" },
  { bg: "#FFD166", accent: "#E63946" },
];

const FLAG_COUNT = 18;

function Flag({
  index,
  colors,
  delay,
}: {
  index: number;
  colors: { bg: string; accent: string };
  delay: number;
}) {
  return (
    <div
      className="bandeirinha-flag"
      style={{
        animationDelay: `${delay}s`,
        left: `${(index / FLAG_COUNT) * 100}%`,
      }}
    >
      <svg
        viewBox="0 0 60 80"
        className="h-16 w-12 sm:h-20 sm:w-14 md:h-24 md:w-16 drop-shadow-lg"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
      >
        {/* Triângulo principal */}
        <polygon
          points="30,0 60,0 30,80"
          fill={colors.bg}
        />
        {/* Triângulo secundário */}
        <polygon
          points="0,0 30,0 30,80"
          fill={colors.accent}
        />
        {/* Detalhe central */}
        <circle cx="30" cy="30" r="6" fill={colors.accent} opacity="0.8" />
        <circle cx="30" cy="50" r="4" fill={colors.bg} opacity="0.6" />
        {/* Barra superior */}
        <rect x="0" y="0" width="60" height="3" fill="#8B4513" rx="1" />
      </svg>
    </div>
  );
}

export default function FestasJuninas() {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;
    audio.loop = true;

    const playAudio = () => {
      audio.play().catch(() => {});
      setHasInteracted(true);
    };

    if (hasInteracted) {
      if (muted) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    }
  }, [muted, hasInteracted]);

  const toggleMute = () => {
    setMuted((prev) => !prev);
    setHasInteracted(true);
  };

  return (
    <>
      {/* Bandeirinhas */}
      <div className="bandeirinhas-container">
        <div className="bandeirinhas-string">
          {Array.from({ length: FLAG_COUNT }).map((_, i) => (
            <Flag
              key={i}
              index={i}
              colors={FLAG_COLORS[i % FLAG_COLORS.length]}
              delay={Math.random() * 0.5}
            />
          ))}
        </div>
      </div>

      {/* Botão de música */}
      <button
        onClick={toggleMute}
        className="festas-music-btn"
        aria-label={muted ? "Ativar música de festa junina" : "Desativar música"}
        title={muted ? "Ativar música" : "Desativar música"}
      >
        <span className="text-lg">{muted ? "🔇" : "🎵"}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {muted ? "Ligar som" : "Sanfona"}
        </span>
      </button>

      {/* Áudio de sanfona */}
      <audio ref={audioRef} preload="auto" loop>
        <source src="/sanfona-festa-junina.mp3" type="audio/mpeg" />
        <source src="/sanfona-festa-junina.ogg" type="audio/ogg" />
      </audio>

      <style jsx>{`
        .bandeirinhas-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 60px;
          z-index: 9999;
          pointer-events: none;
          overflow: hidden;
        }

        .bandeirinhas-string {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
        }

        .bandeirinha-flag {
          position: absolute;
          top: 0;
          transform-origin: top center;
          animation: balancar 2s ease-in-out infinite;
        }

        @keyframes balancar {
          0%,
          100% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }

        .festas-music-btn {
          position: fixed;
          bottom: 80px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          background: linear-gradient(135deg, #8B4513, #A0522D);
          color: #FFD166;
          padding: 10px 14px;
          border-radius: 16px;
          border: 2px solid #FFD166;
          box-shadow: 0 4px 20px rgba(139, 69, 19, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
          animation: pulse-sanfona 2s ease-in-out infinite;
        }

        .festas-music-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(139, 69, 19, 0.7);
        }

        @keyframes pulse-sanfona {
          0%,
          100% {
            box-shadow: 0 4px 20px rgba(139, 69, 19, 0.5);
          }
          50% {
            box-shadow: 0 4px 30px rgba(255, 209, 102, 0.6);
          }
        }
      `}</style>
    </>
  );
}
