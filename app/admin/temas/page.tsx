'use client';

import React, { useState } from 'react';
import { useTheme, ThemeType } from '@/context/ThemeContext';
import { 
    Check, 
    Monitor, 
    Palette, 
    PartyPopper, 
    Code, 
    Image as ImageIcon, 
    Video, 
    RefreshCcw, 
    Save, 
    Upload,
    Database,
    AlertTriangle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ThemesPage() {
    const { activeTheme, themeConfig, setTheme } = useTheme();
    const [previewMode, setPreviewMode] = useState(false);
    const [customFile, setCustomFile] = useState<File | null>(null);
    const [dbSetupLoading, setDbSetupLoading] = useState(false);
    const [dbSetupMessage, setDbSetupMessage] = useState('');
    const supabase = createClient();

    const themes: { id: ThemeType; name: string; icon: React.ReactNode; description: string }[] = [
        { id: 'default', name: 'Padrão do Sistema', icon: <Monitor size={24} />, description: 'Tema limpo e original do site.' },
        { id: 'pattern-1', name: 'Pontilhismo', icon: <Palette size={24} />, description: 'Padrão geométrico de pontos.' },
        { id: 'pattern-2', name: 'Listras Diagonais', icon: <Palette size={24} />, description: 'Listras modernas em tons de azul.' },
        { id: 'pattern-3', name: 'Festa de Balões', icon: <span className="text-2xl">🎈</span>, description: 'Emojis de balões flutuantes.' },
        { id: 'pattern-4', name: 'Tech Grid', icon: <Code size={24} />, description: 'Grid tecnológico escuro.' },
        { id: 'pattern-5', name: 'Ondas Abstratas', icon: <Palette size={24} />, description: 'Gradiente radial suave.' },
        { id: 'carnaval', name: 'Carnaval Animado', icon: <PartyPopper size={24} />, description: 'Confetes, serpentinas e interatividade.' },
        { id: 'matrix', name: 'Matrix Rain', icon: <Code size={24} />, description: 'Chuva de código verde neon.' },
        { id: 'custom-media', name: 'Mídia Personalizada', icon: <ImageIcon size={24} />, description: 'Use sua própria imagem ou vídeo.' },
    ];

    const handlePreview = (themeId: ThemeType) => {
        setTheme(themeId, themeConfig, false); // false = no persist
        setPreviewMode(true);
    };

    const handleApply = async () => {
        await setTheme(activeTheme, themeConfig, true); // true = persist
        setPreviewMode(false);
        alert('Tema aplicado com sucesso para todos os usuários!');
    };

    const handleReset = () => {
        setTheme('default', {}, true);
        setPreviewMode(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 50 * 1024 * 1024) {
            alert('Arquivo muito grande. Máximo 50MB.');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            alert('Formato inválido.');
            return;
        }

        setCustomFile(file);
        
        // Upload to Supabase Storage
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `theme-media-${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('carousel-images') // Reusing existing bucket or create new
                .upload(fileName, file);

            if (error) {
                console.error('Upload failed:', error);
                alert('Erro no upload: ' + error.message);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('carousel-images')
                .getPublicUrl(fileName);

            const type = file.type.startsWith('video') ? 'video' : 'image';
            
            // Apply preview immediately
            setTheme('custom-media', { 
                customMediaUrl: publicUrl,
                customMediaType: type
            }, false);
            
        } catch (err) {
            console.error(err);
            alert('Erro ao processar arquivo.');
        }
    };

    const handleRunDbSetup = async () => {
        setDbSetupLoading(true);
        setDbSetupMessage('');
        try {
            // Attempt to call the setup route
            const res = await fetch('/api/admin/setup-db');
            const data = await res.json();
            
            if (data.success) {
                setDbSetupMessage('Banco de dados configurado com sucesso!');
            } else {
                setDbSetupMessage('Nota: ' + (data.note || data.error));
            }
        } catch (e: any) {
            setDbSetupMessage('Erro ao conectar: ' + e.message);
        } finally {
            setDbSetupLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto pb-32">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Temas</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <RefreshCcw size={18} />
                        Resetar Padrão
                    </button>
                    {previewMode && (
                        <button 
                            onClick={handleApply}
                            className="px-6 py-2 bg-[#E60012] text-white hover:bg-[#c4000f] rounded-lg flex items-center gap-2 shadow-lg animate-pulse font-bold"
                        >
                            <Save size={18} />
                            Aplicar Alterações
                        </button>
                    )}
                </div>
            </div>

            {/* DB Fix Section (Hidden if working, but shown for safety based on user request) */}
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3 text-yellow-800">
                    <AlertTriangle size={20} />
                    <span>Se houver erros de "Tabela não encontrada" (user_coupons ou site_settings), clique aqui para corrigir.</span>
                </div>
                <button 
                    onClick={handleRunDbSetup}
                    disabled={dbSetupLoading}
                    className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg flex items-center gap-2 text-sm font-medium"
                >
                    <Database size={16} />
                    {dbSetupLoading ? 'Configurando...' : 'Reparar Banco de Dados'}
                </button>
            </div>
            {dbSetupMessage && (
                <div className="mb-8 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg whitespace-pre-wrap">
                    {dbSetupMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                    <div 
                        key={theme.id}
                        className={`
                            relative bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all cursor-pointer group
                            ${activeTheme === theme.id ? 'border-[#E60012] ring-2 ring-[#E60012]/20' : 'border-transparent hover:border-gray-300'}
                        `}
                        onClick={() => handlePreview(theme.id)}
                    >
                        {/* Preview Area (Miniature) */}
                        <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-50">
                                {/* Simulate background logic here purely for visual if needed, 
                                    but the icon is enough for admin UI simplicity. 
                                    The REAL preview happens on the whole page when clicked! */}
                            </div>
                            <div className="z-10 text-gray-500 group-hover:text-[#E60012] transition-colors scale-150">
                                {theme.icon}
                            </div>
                            
                            {activeTheme === theme.id && (
                                <div className="absolute top-2 right-2 bg-[#E60012] text-white p-1 rounded-full shadow-sm">
                                    <Check size={16} />
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-gray-900">{theme.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
                        </div>

                        {/* Custom Controls for Specific Themes */}
                        {theme.id === 'custom-media' && activeTheme === 'custom-media' && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                <label className="block w-full cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*,video/*"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                                        <Upload size={20} />
                                        <span>Clique para enviar (Max 50MB)</span>
                                    </div>
                                </label>
                                {themeConfig.customMediaUrl && (
                                    <p className="text-xs text-green-600 mt-2 text-center truncate">
                                        Mídia carregada!
                                    </p>
                                )}
                            </div>
                        )}
                        
                         {theme.id === 'carnaval' && activeTheme === 'carnaval' && (
                            <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={themeConfig.carnavalSound}
                                        onChange={(e) => setTheme('carnaval', { ...themeConfig, carnavalSound: e.target.checked }, false)}
                                        className="rounded text-[#E60012] focus:ring-[#E60012]"
                                    />
                                    Ativar sons de festa
                                </label>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Instruções</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    <li>Clique em um card para <strong>visualizar</strong> o tema imediatamente nesta tela.</li>
                    <li>Para confirmar e ativar para <strong>todos os usuários</strong>, clique no botão "Aplicar Alterações" no topo.</li>
                    <li>Temas animados (Carnaval, Matrix) podem consumir mais bateria em dispositivos móveis.</li>
                    <li>Arquivos de mídia personalizados são otimizados automaticamente.</li>
                </ul>
            </div>
        </div>
    );
}
