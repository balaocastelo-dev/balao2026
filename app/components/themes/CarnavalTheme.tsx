'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'confetti' | 'serpentine';
}

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const CarnavalTheme = ({ soundEnabled }: { soundEnabled?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (soundEnabled) {
        if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/carnaval-loop.mp3');
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
        }
        audioRef.current.play().catch(() => {
            console.log("Autoplay blocked, waiting for interaction");
        });
    } else {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
  }, [soundEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        type: Math.random() > 0.8 ? 'serpentine' : 'confetti'
      };
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particles.length < 150 && Math.random() < 0.1) {
        particles.push(createParticle());
      }

      particles.forEach((p, index) => {
        // Physics
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotationSpeed;

        // Mouse wind effect
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.001;
          p.vy += dy * 0.001;
        }

        // Draw
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.type === 'confetti') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 3;
          ctx.moveTo(-p.size, 0);
          ctx.bezierCurveTo(-p.size / 2, p.size, p.size / 2, -p.size, p.size, 0);
          ctx.stroke();
        }

        ctx.restore();

        // Reset if out of bounds
        if (p.y > canvas.height + 20) {
          particles.splice(index, 1);
        }
      });

      animationFrameId = requestAnimationFrame(update);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    update();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[50]"
    />
  );
};

export default CarnavalTheme;
