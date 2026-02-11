'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import CarnavalTheme from './themes/CarnavalTheme';
import MatrixTheme from './themes/MatrixTheme';

const ThemeRenderer = () => {
  const { activeTheme, themeConfig } = useTheme();

  if (activeTheme === 'default') return null;

  // Render Themes
  return (
    <>
      {/* Background Layers */}
      <div className="fixed inset-0 z-[-1] pointer-events-none transition-all duration-500">
        
        {/* Pattern 1: Geometric Dots */}
        {activeTheme === 'pattern-1' && (
          <div className="w-full h-full bg-slate-50 opacity-20" style={{
            backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        )}

        {/* Pattern 2: Diagonal Stripes */}
        {activeTheme === 'pattern-2' && (
          <div className="w-full h-full bg-blue-50 opacity-20" style={{
             backgroundImage: 'repeating-linear-gradient(45deg, #606dbc 0, #606dbc 10px, #465298 10px, #465298 20px)'
          }} />
        )}

        {/* Pattern 3: Emojis (Balloon) */}
        {activeTheme === 'pattern-3' && (
          <div className="w-full h-full bg-red-50 opacity-10 flex flex-wrap content-start justify-center gap-12 p-8 overflow-hidden">
             {Array.from({ length: 100 }).map((_, i) => (
                <span key={i} className="text-4xl select-none">🎈</span>
             ))}
          </div>
        )}

        {/* Pattern 4: Tech Grid */}
        {activeTheme === 'pattern-4' && (
           <div className="w-full h-full bg-gray-900" style={{
             backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} />
        )}

        {/* Pattern 5: Abstract Waves */}
        {activeTheme === 'pattern-5' && (
           <div className="w-full h-full bg-indigo-900 opacity-90" style={{
               background: 'radial-gradient(circle at 50% 50%, #2a2a72, #009ffd)'
           }} />
        )}

        {/* Custom Media */}
        {activeTheme === 'custom-media' && themeConfig.customMediaUrl && (
          <>
            {themeConfig.customMediaType === 'video' ? (
              <video 
                src={themeConfig.customMediaUrl} 
                autoPlay 
                loop 
                muted 
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center opacity-50"
                style={{ backgroundImage: `url(${themeConfig.customMediaUrl})` }}
              />
            )}
          </>
        )}
      </div>

      {/* Overlay Themes (Canvas) */}
      {activeTheme === 'carnaval' && <CarnavalTheme />}
      {activeTheme === 'matrix' && <MatrixTheme />}
    </>
  );
};

export default ThemeRenderer;
