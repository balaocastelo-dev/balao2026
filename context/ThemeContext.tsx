'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type ThemeType = 'default' | 'pattern-1' | 'pattern-2' | 'pattern-3' | 'pattern-4' | 'pattern-5' | 'carnaval' | 'matrix' | 'custom-media';

interface ThemeConfig {
  customMediaUrl?: string;
  customMediaType?: 'image' | 'video';
  carnavalSound?: boolean;
  highContrast?: boolean;
  opacity?: number;
  blur?: number;
}

interface ThemeContextType {
  activeTheme: ThemeType;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeType, config?: ThemeConfig, persist?: boolean) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveThemeState] = useState<ThemeType>('default');
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load initial theme from localStorage and then DB
  useEffect(() => {
    const loadTheme = async () => {
      // 1. LocalStorage (Instant)
      const localTheme = localStorage.getItem('site_theme');
      const localConfig = localStorage.getItem('site_theme_config');
      
      if (localTheme) {
        setActiveThemeState(localTheme as ThemeType);
      }
      if (localConfig) {
        try {
          setThemeConfigState(JSON.parse(localConfig));
        } catch (e) {
          console.error("Error parsing theme config", e);
        }
      }

      // 2. Database (Global Sync)
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('active_theme, theme_preferences')
          .single();

        if (data && !error) {
          setActiveThemeState(data.active_theme as ThemeType);
          setThemeConfigState(data.theme_preferences || {});
          
          // Sync back to localStorage
          localStorage.setItem('site_theme', data.active_theme);
          localStorage.setItem('site_theme_config', JSON.stringify(data.theme_preferences || {}));
        } else if (error && error.code !== 'PGRST116') {
             // PGRST116 is "Row not found", implying table exists but empty or RLS.
             // If table doesn't exist, we might get a different error.
             console.warn("Could not fetch global theme settings:", error.message);
        }
      } catch (err) {
        console.error("Unexpected error loading theme:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (theme: ThemeType, config?: ThemeConfig, persist: boolean = true) => {
    // 1. Optimistic Update
    setActiveThemeState(theme);
    if (config) setThemeConfigState(config);
    
    // 2. LocalStorage (Always sync to local for immediate feel, or maybe only if persist?)
    // If we only preview, we might not want to mess up localStorage 'site_theme' which is the "persisted" local copy.
    // But for "Preview", we want the user to see it.
    // Let's use a separate key for "preview" or just overwrite? 
    // If we overwrite, on reload it stays. That's probably fine for "Preview" until they revert.
    localStorage.setItem('site_theme', theme);
    if (config) localStorage.setItem('site_theme_config', JSON.stringify(config));

    if (!persist) return;

    // 3. Database Update
    try {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ 
                id: 1, 
                active_theme: theme, 
                theme_preferences: config || themeConfig,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error("Failed to save theme globally:", error);
            // Optionally revert state if strict consistency is needed, 
            // but for themes, local persistence is a good fallback.
        }
    } catch (err) {
        console.error("Error saving theme to DB:", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, themeConfig, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
