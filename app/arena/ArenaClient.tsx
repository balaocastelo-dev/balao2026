'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vendedor, ArenaConfig, EventoMidia, Venda } from './types';
import { supabase } from '@/utils/supabase';
import { Trophy, Flag, Zap, Target, AlertCircle, RefreshCw, X, Clock, DollarSign, Flame } from 'lucide-react';

// Cores e Temas para os Corredores
const RANK_COLORS = [
  'from-yellow-400 via-orange-500 to-red-500', // 1º - Gold/Fire
  'from-slate-300 via-slate-400 to-slate-500', // 2º - Silver
  'from-amber-600 via-amber-700 to-amber-800', // 3º - Bronze
  'from-blue-500 via-indigo-500 to-purple-500', // Outros
];

type FilaEvento = {
  id: string;
  gif_url: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  vendedor_avatar?: string | null;
};

export default function ArenaClient({
  vendedoresIniciais,
  configInicial,
  eventosIniciais,
  vendasRecentesIniciais
}: {
  vendedoresIniciais: Vendedor[],
  configInicial: ArenaConfig | null,
  eventosIniciais: EventoMidia[],
  vendasRecentesIniciais?: Venda[]
}) {
  const [vendedores, setVendedores] = useState<Vendedor[]>(vendedoresIniciais || []);
  const [config, setConfig] = useState<ArenaConfig | null>(configInicial);
  const [eventosConfig, setEventosConfig] = useState<EventoMidia[]>(eventosIniciais || []);
  const [filaEventos, setFilaEventos] = useState<FilaEvento[]>([]);
  const [eventoAtual, setEventoAtual] = useState<FilaEvento | null>(null);
  const [shouldReload, setShouldReload] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const [vendasRecentes, setVendasRecentes] = useState<Venda[]>(vendasRecentesIniciais || []);

  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('CONNECTING');

  // Refs para acesso no callback do realtime
  const vendedoresRef = useRef(vendedores);
  const eventosConfigRef = useRef(eventosConfig);
  const vendasRecentesRef = useRef(vendasRecentes);
  const comboCounterRef = useRef<{ id: string, count: number }>({ id: '', count: 0 });

  useEffect(() => {
    vendedoresRef.current = vendedores;
  }, [vendedores]);

  useEffect(() => {
    eventosConfigRef.current = eventosConfig;
  }, [eventosConfig]);
  
  useEffect(() => {
    vendasRecentesRef.current = vendasRecentes;
  }, [vendasRecentes]);

  // Logs de Debug
  useEffect(() => {
    console.log('--- ARENA DEBUG ---');
    console.log('Vendedores Iniciais:', vendedoresIniciais);
    console.log('Config Inicial:', configInicial);
    console.log('Eventos Iniciais:', eventosIniciais);
    console.log('Vendas Recentes Iniciais:', vendasRecentesIniciais);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Definido' : 'Indefinido');
  }, [vendedoresIniciais, configInicial, eventosIniciais, vendasRecentesIniciais]);

  // Sincroniza estado com props (revalidatePath)
  useEffect(() => {
    if (vendedoresIniciais) {
      setVendedores(prevVendedores => {
        // Se for a primeira carga (prev vazio), não dispara eventos
        if (prevVendedores.length === 0) return vendedoresIniciais;

        let mudou = false;
        vendedoresIniciais.forEach((novo) => {
          const antigo = prevVendedores.find(v => v.id === novo.id);
          if (antigo && JSON.stringify(antigo) !== JSON.stringify(novo)) {
            mudou = true;
            // Só dispara eventos se a diferença de vendas for positiva
            if (novo.vendas_atual > antigo.vendas_atual) {
               processarEventos(novo);
            }
          }
        });
        
        // Verifica se houve novos vendedores (insert)
        const novosIds = vendedoresIniciais.map(v => v.id);
        const prevIds = prevVendedores.map(v => v.id);
        if (novosIds.length !== prevIds.length) mudou = true;

        return mudou ? vendedoresIniciais : prevVendedores;
      });
    }
  }, [vendedoresIniciais]);

  useEffect(() => {
    if (configInicial) setConfig(configInicial);
  }, [configInicial]);

  useEffect(() => {
    if (eventosIniciais) setEventosConfig(eventosIniciais);
  }, [eventosIniciais]);

  // Processamento da Fila de Eventos
  useEffect(() => {
    if (!eventoAtual && filaEventos.length > 0) {
      const proximo = filaEventos[0];
      setEventoAtual(proximo);
      setFilaEventos(prev => prev.slice(1));
    } else if (!eventoAtual && filaEventos.length === 0 && shouldReload) {
      // Inicia a animação de saída (Íris Fechando)
      setIsExiting(true);
    }
  }, [eventoAtual, filaEventos, shouldReload]);

  // Efeitos Sonoros
  useEffect(() => {
    if (!eventoAtual) return;

    let audioFile = '';
    
    // Tipos de evento que disparam corneta
    if (['nova_venda', 'combo_vendas', 'meta_batida', 'meta_global'].includes(eventoAtual.tipo)) {
      audioFile = '/sounds/horn.mp3';
    } 
    // Venda Alta dispara som de caixa registradora (dinheiro)
    else if (eventoAtual.tipo === 'venda_alta') {
      audioFile = '/sounds/cash.mp3';
    }
    // Tipos de evento que disparam carro de corrida
    else if (['ultrapassagem', 'lideranca'].includes(eventoAtual.tipo)) {
      audioFile = '/sounds/race-car.mp3';
    }

    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.volume = 1.0; // Volume máximo para garantir audibilidade
      
      // Tenta reproduzir (pode falhar se não houver interação do usuário antes, policy dos navegadores)
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Reprodução de áudio bloqueada ou falhou:', error);
          // Tenta forçar play se possível ou logar para debug
        });
      }
    }
  }, [eventoAtual]);

  // Desbloqueio de Áudio (Autoplay Policy)
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio('/sounds/horn.mp3');
      audio.volume = 0;
      audio.play().catch(() => {});
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Função para detectar e disparar eventos
  const processarEventos = (novoVendedor: Vendedor) => {
    const antigos = vendedoresRef.current;
    const antigoVendedor = antigos.find(v => v.id === novoVendedor.id);
    
    if (!antigoVendedor) return; // Novo vendedor (insert) não dispara eventos de mudança por enquanto

    const eventosDisparados: FilaEvento[] = [];
    const configsAtivas = eventosConfigRef.current.filter(e => e.ativo);

    // 1. Nova Venda
    const diff = novoVendedor.vendas_atual - antigoVendedor.vendas_atual;
    if (diff > 0) {
      // 1.1 Venda Alta (ex: > 5000 de diferença)
      if (diff >= 5000) {
        const configAlta = configsAtivas.find(e => e.evento_tipo === 'venda_alta');
        if (configAlta) {
          eventosDisparados.push({
            id: crypto.randomUUID(),
            gif_url: configAlta.gif_url,
            titulo: configAlta.titulo,
            mensagem: configAlta.mensagem_template?.replace('{vendedor}', novoVendedor.nome).replace('{valor}', `R$ ${diff.toLocaleString('pt-BR')}`) || `VENDAÇO de ${novoVendedor.nome}!`,
            tipo: 'venda_alta',
            vendedor_avatar: novoVendedor.avatar_url
          });
        }
      } else {
        // 1.2 Nova Venda Normal
        const config = configsAtivas.find(e => e.evento_tipo === 'nova_venda');
        if (config) {
          eventosDisparados.push({
            id: crypto.randomUUID(),
            gif_url: config.gif_url,
            titulo: config.titulo,
            mensagem: config.mensagem_template?.replace('{vendedor}', novoVendedor.nome).replace('{valor}', `R$ ${diff.toLocaleString('pt-BR')}`) || `Nova venda de ${novoVendedor.nome}!`,
            tipo: 'nova_venda',
            vendedor_avatar: novoVendedor.avatar_url
          });
        }
      }

      // 1.2 Combo de Vendas (3 seguidas do mesmo vendedor)
      if (comboCounterRef.current.id === novoVendedor.id) {
        comboCounterRef.current.count += 1;
      } else {
        comboCounterRef.current = { id: novoVendedor.id, count: 1 };
      }

      if (comboCounterRef.current.count >= 3) {
        const configCombo = configsAtivas.find(e => e.evento_tipo === 'combo_vendas');
        if (configCombo) {
          eventosDisparados.push({
            id: crypto.randomUUID(),
            gif_url: configCombo.gif_url,
            titulo: configCombo.titulo,
            mensagem: configCombo.mensagem_template?.replace('{vendedor}', novoVendedor.nome).replace('{count}', comboCounterRef.current.count.toString()) || `${novoVendedor.nome} está ON FIRE! ${comboCounterRef.current.count}x seguidas!`,
            tipo: 'combo_vendas',
            vendedor_avatar: novoVendedor.avatar_url
          });
        }
      }

      // 1.3 Meta Global Batida
      const totalMeta = antigos.reduce((acc, v) => acc + v.meta_valor, 0);
      const totalVendasAntigo = antigos.reduce((acc, v) => acc + v.vendas_atual, 0);
      const totalVendasNovo = totalVendasAntigo + diff;

      if (totalVendasAntigo < totalMeta && totalVendasNovo >= totalMeta) {
        const configGlobal = configsAtivas.find(e => e.evento_tipo === 'meta_global');
        if (configGlobal) {
          eventosDisparados.push({
            id: crypto.randomUUID(),
            gif_url: configGlobal.gif_url,
            titulo: configGlobal.titulo,
            mensagem: configGlobal.mensagem_template?.replace('{valor}', `R$ ${totalMeta.toLocaleString('pt-BR')}`) || `META GLOBAL BATIDA! PARABÉNS EQUIPE!`,
            tipo: 'meta_global',
            vendedor_avatar: novoVendedor.avatar_url
          });
        }
      }
    }

    // 2. Meta Batida
    if (antigoVendedor.vendas_atual < antigoVendedor.meta_valor && novoVendedor.vendas_atual >= novoVendedor.meta_valor) {
      const config = configsAtivas.find(e => e.evento_tipo === 'meta_batida');
      if (config) {
        eventosDisparados.push({
          id: crypto.randomUUID(),
          gif_url: config.gif_url,
          titulo: config.titulo,
          mensagem: config.mensagem_template?.replace('{vendedor}', novoVendedor.nome) || `${novoVendedor.nome} BATEU A META!`,
          tipo: 'meta_batida',
          vendedor_avatar: novoVendedor.avatar_url
        });
      }
    }

    // 3. Ranking (Ultrapassagem e Liderança)
    // Recalcula ranking antigo
    const rankingAntigo = [...antigos].sort((a, b) => {
      return b.vendas_atual - a.vendas_atual;
    });
    const indexAntigo = rankingAntigo.findIndex(v => v.id === novoVendedor.id);

    // Recalcula ranking novo (simulado)
    const novosVendedoresSimulados = antigos.map(v => v.id === novoVendedor.id ? novoVendedor : v);
    const rankingNovo = [...novosVendedoresSimulados].sort((a, b) => {
      return b.vendas_atual - a.vendas_atual;
    });
    const indexNovo = rankingNovo.findIndex(v => v.id === novoVendedor.id);

    if (indexAntigo !== -1 && indexNovo !== -1 && indexNovo < indexAntigo) {
      // Subiu no ranking
      if (indexNovo === 0) {
        // Assumiu Liderança
        const config = configsAtivas.find(e => e.evento_tipo === 'lideranca');
        if (config) {
          eventosDisparados.push({
            id: crypto.randomUUID(),
            gif_url: config.gif_url,
            titulo: config.titulo,
            mensagem: config.mensagem_template?.replace('{vendedor}', novoVendedor.nome) || `${novoVendedor.nome} assumiu a LIDERANÇA!`,
            tipo: 'lideranca',
            vendedor_avatar: novoVendedor.avatar_url
          });
        }
      } else {
        // Ultrapassagem normal
        const config = configsAtivas.find(e => e.evento_tipo === 'ultrapassagem');
        if (config) {
          eventosDisparados.push({
            id: crypto.randomUUID(),
            gif_url: config.gif_url,
            titulo: config.titulo,
            mensagem: config.mensagem_template?.replace('{vendedor}', novoVendedor.nome) || `${novoVendedor.nome} subiu para #${indexNovo + 1}!`,
            tipo: 'ultrapassagem',
            vendedor_avatar: novoVendedor.avatar_url
          });
        }
      }
    }

    if (eventosDisparados.length > 0) {
      setFilaEventos(prev => [...prev, ...eventosDisparados]);
      setShouldReload(true);
    }
  };

  // Ordenação e Estatísticas
  const { sortedVendedores, totalVendas, totalMeta, progressoGeral } = useMemo(() => {
    if (!vendedores || vendedores.length === 0) {
        return { sortedVendedores: [], totalVendas: 0, totalMeta: 0, progressoGeral: 0 };
    }

    const sorted = [...vendedores].sort((a, b) => {
      return b.vendas_atual - a.vendas_atual; // Maior valor primeiro
    });

    const totalVendas = vendedores.reduce((acc, v) => acc + v.vendas_atual, 0);
    const totalMeta = vendedores.reduce((acc, v) => acc + v.meta_valor, 0);
    const progressoGeral = totalMeta > 0 ? (totalVendas / totalMeta) * 100 : 0;

    return { sortedVendedores: sorted, totalVendas, totalMeta, progressoGeral };
  }, [vendedores]);

  // Polling de Fallback e Atualização de Segurança (a cada 5s)
  useEffect(() => {
    const fetchDados = async () => {
      // Se a conexão estiver saudável, evitamos polling excessivo (opcional, mas seguro manter)
      // if (connectionStatus === 'SUBSCRIBED') return;

      const { data: novosVendedores } = await supabase.from('arena_vendedores').select('*');
      
      if (novosVendedores) {
        setVendedores(prevVendedores => {
          let mudou = false;
          
          // Verifica mudanças e dispara eventos se necessário (fallback do realtime)
          novosVendedores.forEach((novo: any) => {
            const antigo = prevVendedores.find(v => v.id === novo.id);
            if (antigo && JSON.stringify(antigo) !== JSON.stringify(novo)) {
              mudou = true;
              // Só dispara eventos se a diferença de vendas for positiva
              if (novo.vendas_atual > antigo.vendas_atual) {
                 processarEventos(novo);
              }
            }
          });

          if (mudou) return novosVendedores as Vendedor[];
          return prevVendedores;
        });
      }

      const { data: novaConfig } = await supabase.from('arena_config').select('*').single();
      if (novaConfig) setConfig(novaConfig as ArenaConfig);

      const { data: novosEventos } = await supabase.from('arena_eventos_midia').select('*');
      if (novosEventos) setEventosConfig(novosEventos as EventoMidia[]);
    };

    const interval = setInterval(fetchDados, 5000); // 5 segundos
    fetchDados(); // Busca imediata

    return () => clearInterval(interval);
  }, [connectionStatus]); // Recria se o status mudar

  // Realtime Subscription
  useEffect(() => {
    console.log('Iniciando conexão Realtime...');
    const channel = supabase
      .channel('arena-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arena_vendedores' },
        (payload) => {
          console.log('⚡ Realtime Event (Vendedores):', payload);
          setLastUpdate(new Date().toLocaleTimeString());
          
          if (payload.eventType === 'INSERT') {
            setVendedores(prev => {
                const exists = prev.some(v => v.id === payload.new.id);
                if (exists) return prev;
                return [...prev, payload.new as Vendedor];
            });
          } else if (payload.eventType === 'UPDATE') {
            const novoVendedor = payload.new as Vendedor;
            // Detecta eventos ANTES de atualizar o estado
            processarEventos(novoVendedor);
            
            setVendedores(prev => prev.map(v => v.id === novoVendedor.id ? novoVendedor : v));
          } else if (payload.eventType === 'DELETE') {
            setVendedores(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arena_config' },
        (payload) => {
          console.log('⚡ Realtime Event (Config):', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setConfig(payload.new as ArenaConfig);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arena_eventos_midia' },
        (payload) => {
            console.log('⚡ Realtime Event (Eventos Midia):', payload);
            if (payload.eventType === 'INSERT') {
                setEventosConfig(prev => [...prev, payload.new as EventoMidia]);
            } else if (payload.eventType === 'UPDATE') {
                setEventosConfig(prev => prev.map(e => e.id === payload.new.id ? payload.new as EventoMidia : e));
            } else if (payload.eventType === 'DELETE') {
                setEventosConfig(prev => prev.filter(e => e.id !== payload.old.id));
            }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'arena_vendas' },
        (payload) => {
            console.log('⚡ Realtime Event (Vendas):', payload);
            const novaVenda = payload.new as Venda;
            // Encontrar vendedor para preencher dados visuais
            const vendedor = vendedoresRef.current.find(v => v.id === novaVenda.vendedor_id);
            const vendaCompleta = { ...novaVenda, vendedor };
            setVendasRecentes(prev => [vendaCompleta, ...prev].slice(0, 50));
        }
      )
      .subscribe((status) => {
        console.log('Status da Conexão:', status);
        setConnectionStatus(status);
      });

    return () => {
      console.log('Limpando canais...');
      supabase.removeChannel(channel);
    };
  }, []); // Dependências vazias pois usamos refs para acessar estados atualizados

  const handleCloseEvento = useCallback(() => {
    setEventoAtual(null);
  }, []);

  if (!config?.ativo) {
    return <WaitingScreen title={config?.titulo} status={connectionStatus} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      {/* Container com efeito Íris (Clip Path) */}
      <motion.div 
        className="min-h-screen bg-[#0f172a] text-white overflow-hidden flex flex-col font-sans relative"
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={{ clipPath: isExiting ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)' }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={(definition) => {
            if (isExiting) {
                window.location.reload();
            }
        }}
      >
      {/* Camada de Debug */}
      {connectionStatus !== 'SUBSCRIBED' && (
         <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 z-[100]">
            Status: {connectionStatus}
         </div>
      )}

      {/* Overlay de Eventos */}
      <AnimatePresence>
        {eventoAtual && (
          <EventOverlay 
            key={eventoAtual.id}
            evento={eventoAtual} 
            onClose={handleCloseEvento} 
          />
        )}
      </AnimatePresence>

      {/* Background Effects (Z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-slate-900/50" />
      </div>

      {/* Header (Z-50) */}
      <header className="relative z-50 p-6 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Título e Status */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-50 rounded-xl" />
              <div className="relative bg-slate-900 p-3 rounded-xl border border-white/10 shadow-inner">
                <Flag className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent uppercase italic">
                {config.titulo || 'Arena de Vendas'}
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-300/80">
                <span className={`relative flex h-2 w-2`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === 'SUBSCRIBED' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                {connectionStatus === 'SUBSCRIBED' ? 'AO VIVO' : 'CONECTANDO...'} {lastUpdate && `• ${lastUpdate}`}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <StatCard 
              icon={<Zap className="w-4 h-4 text-yellow-400" />}
              label="Vendas Totais"
              value={`R$ ${totalVendas.toLocaleString('pt-BR', { notation: 'compact' })}`}
              subtext={`${progressoGeral.toFixed(1)}% da Meta Global`}
            />
            <StatCard 
              icon={<Target className="w-4 h-4 text-red-400" />}
              label="Meta Equipe"
              value={`R$ ${totalMeta.toLocaleString('pt-BR', { notation: 'compact' })}`}
            />
          </div>
        </div>
      </header>



      {/* Container Principal */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar p-4 md:p-8 z-10">
        <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row gap-6 items-start">
          
          {/* Pista de Corrida (Esquerda) */}
          <div className="flex-1 space-y-4 pb-20 relative min-w-0 w-full">
          
          {/* Grid Lines Background */}
          <div className="absolute inset-0 z-[-1] pointer-events-none opacity-10" 
               style={{ 
                 backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                 backgroundSize: '100px 100px',
               }} 
          />

          <AnimatePresence initial={false}>
            {sortedVendedores.map((v, index) => (
              <RacerRow 
                key={v.id} 
                data={v} 
                rank={index + 1} 
                isLeader={index === 0}
              />
            ))}
          </AnimatePresence>

          {(!sortedVendedores || sortedVendedores.length === 0) && (
            <div className="text-center py-32 relative z-20 flex flex-col items-center">
              <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4 border border-white/5 animate-pulse">
                <AlertCircle className="w-12 h-12 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg font-light mb-4">Nenhum competidor encontrado.</p>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar Página
              </button>
            </div>
          )}
          </div>

          {/* Painel de Últimas Vendas (Lateral Direito - Desktop) */}
          <div className="w-full xl:w-96 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Últimas Vendas</h3>
                  <div className="text-[10px] text-emerald-400 font-mono">Tempo Real</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 pb-4 max-h-[80vh]">
              <AnimatePresence initial={false}>
                {vendasRecentes.map((venda, i) => (
                  <motion.div
                    key={venda.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-slate-800/60 hover:bg-slate-800/90 backdrop-blur-sm border border-white/5 hover:border-white/20 p-3 rounded-xl transition-all flex items-center gap-3 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50" />
                    <div className="relative w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600 group-hover:border-white/30 transition-colors flex-shrink-0">
                      {venda.vendedor?.avatar_url ? (
                        <img src={venda.vendedor.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
                          {venda.vendedor?.nome?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-200 text-sm truncate pr-2">
                          {venda.vendedor?.nome || 'Desconhecido'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                          {new Date(venda.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        <span className="font-bold text-emerald-400 text-sm font-mono">
                          {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {vendasRecentes.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  Aguardando vendas...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-50 py-4 px-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md text-center">
         <div className="text-slate-500 text-xs font-mono">
            {config.titulo || 'Arena'} • Atualização em Tempo Real • {lastUpdate || 'Carregando...'}
         </div>
      </footer>
    </motion.div>
    </div>
  );
}

// --- Componentes Auxiliares ---

function EventOverlay({ evento, onClose }: { evento: FilaEvento, onClose: () => void }) {
  // Fecha automaticamente após 8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative max-w-4xl w-full flex flex-col items-center text-center">
        {/* Título */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] uppercase tracking-tighter transform -rotate-2">
            {evento.titulo}
          </h2>
        </motion.div>

        {/* GIF Container */}
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.4)] bg-black flex items-center justify-center"
          >
            <img src={evento.gif_url} alt={evento.titulo} className="w-full h-full object-cover" />
          </motion.div>

          {/* Avatar do Vendedor (Aro Menor) */}
          {evento.vendedor_avatar && (
            <motion.div
              initial={{ scale: 0, opacity: 0, x: 20, y: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
              className="absolute -bottom-4 -right-4 md:bottom-0 md:right-0 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(0,0,0,0.6)] overflow-hidden z-20 bg-slate-800"
            >
              <img src={evento.vendedor_avatar} alt="Vendedor" className="w-full h-full object-cover" />
            </motion.div>
          )}
        </div>

        {/* Mensagem */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-slate-900/90 border border-white/20 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl"
        >
          <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
            {evento.mensagem}
          </p>
        </motion.div>
      </div>

      {/* Confete / Partículas (Simplificado) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: -20,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: 360
            }}
            transition={{ 
              duration: Math.random() * 2 + 2, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, subtext }: { icon: any, label: string, value: string, subtext?: string }) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl min-w-[160px] shadow-lg">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      {subtext && <div className="text-[10px] text-slate-500 font-mono mt-1">{subtext}</div>}
    </div>
  );
}

function RacerRow({ data, rank, isLeader }: { data: Vendedor, rank: number, isLeader: boolean }) {
  const progresso = data.meta_valor > 0 ? (data.vendas_atual / data.meta_valor) * 100 : 0;
  const progressoLimitado = Math.min(Math.max(progresso, 0), 100);
  const bateuMeta = progresso >= 100;

  // Emojis que nativamente apontam para a esquerda e precisam ser espelhados para a direita
  const FLIP_EMOJIS = ['🚗', '🚙', '🚕', '🛺', '🚌', '🚎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦽', '🦼', '🚲', '🛴'];
  const emoji = data.veiculo_emoji || '🏎️';
  const shouldFlip = FLIP_EMOJIS.includes(emoji);

  // Cores dinâmicas baseadas no Rank
  const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : RANK_COLORS[3];
  
  return (
    <motion.div
      layoutId={data.id} // Reordenação automática
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`relative group ${isLeader ? 'mb-8' : 'mb-3'}`}
      style={{ zIndex: 100 - rank }} // Garante que cards superiores fiquem por cima em sobreposições
    >
      {/* Efeito de destaque para o líder */}
      {isLeader && (
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-transparent blur-xl rounded-lg opacity-75 animate-pulse" />
      )}

      <div className="relative flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl pr-6 shadow-xl hover:border-white/20 transition-all hover:bg-slate-800/80">
        
        {/* Info Card (Esquerda) */}
        <div className="w-56 md:w-64 flex-shrink-0 flex items-center gap-4 bg-slate-800/90 p-3 rounded-xl border border-white/5 relative overflow-hidden z-20">
          {/* Rank Badge */}
          <div className={`absolute top-0 left-0 px-2 py-0.5 text-[10px] font-black italic text-white rounded-br-lg z-20 bg-gradient-to-br ${rankColor} shadow-sm`}>
            #{rank}
          </div>

          <div className="relative">
            <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${bateuMeta ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'border-slate-600'} relative z-10 bg-slate-700`}>
              {data.avatar_url ? (
                <img src={data.avatar_url} alt={data.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400 bg-slate-800">
                  {data.nome.charAt(0)}
                </div>
              )}
            </div>
            {bateuMeta && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 z-20 bg-yellow-400 text-black p-1 rounded-full shadow-lg border-2 border-slate-900"
              >
                <Trophy className="w-3 h-3" />
              </motion.div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white truncate text-sm leading-tight">{data.nome}</h3>
            <div className="flex flex-col mt-1">
              <span className="text-xs font-mono text-blue-300">R$ {data.vendas_atual.toLocaleString('pt-BR', { notation: 'compact' })}</span>
              <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${bateuMeta ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                  style={{ width: `${Math.min(progresso, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pista */}
        <div className="flex-1 relative h-16 flex items-center mx-4 z-10">
          {/* Trilho de fundo */}
          <div className="absolute inset-x-0 h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
            {/* Marcadores de Distância */}
            {[25, 50, 75].map(m => (
              <div key={m} className="absolute top-0 bottom-0 w-[1px] bg-white/10" style={{ left: `${m}%` }} />
            ))}
          </div>

          {/* Barra de Progresso Ativa */}
          <motion.div 
            className="absolute left-0 h-3 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progressoLimitado}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          >
            <div className={`w-full h-full bg-gradient-to-r ${
              bateuMeta 
                ? 'from-yellow-600 via-yellow-400 to-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.4)]' 
                : 'from-blue-900 via-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            }`} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] w-1/2 h-full -skew-x-12 animate-shimmer" />
          </motion.div>

          {/* Veículo */}
          <motion.div
            className="absolute z-20 flex flex-col items-center"
            initial={{ left: 0 }}
            animate={{ left: `${progressoLimitado}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
            style={{ x: '-50%', y: '-15%' }}
          >
            {/* Balão de Fala / Percentual */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-1 px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md border shadow-lg whitespace-nowrap ${
                bateuMeta 
                  ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' 
                  : 'bg-slate-800/90 border-slate-600 text-slate-300'
              }`}
            >
              {progresso.toFixed(0)}%
            </motion.div>

            {/* O Carro */}
            <div className="relative group cursor-pointer">
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                  rotate: isLeader ? [0, -1, 1, 0] : 0
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: isLeader ? 0.3 : 2, 
                  ease: "easeInOut" 
                }}
                className="text-4xl filter drop-shadow-2xl transform transition-transform hover:scale-110"
              >
                <div className={shouldFlip ? "scale-x-[-1]" : ""}>
                  {emoji}
                </div>
              </motion.div>
              
              {/* Efeitos Especiais (Fogo/Nitro) */}
              {isLeader && (
                <motion.div 
                  className="absolute top-1/2 -left-4 -translate-y-1/2 text-orange-500 text-lg mix-blend-screen"
                  animate={{ opacity: [0, 1, 0], x: [-5, -15], scale: [0.5, 1.5] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                >
                  <Flame className="w-6 h-6 rotate-90" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Meta Flag */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center gap-1 z-0">
            <div className="h-16 w-1 bg-white/10" />
            <div className="absolute top-0 transform -translate-y-full text-xs font-black text-white/20 uppercase tracking-widest rotate-90 origin-bottom-left ml-3">
              Finish
            </div>
          </div>
        </div>

        {/* Info Meta (Direita) */}
        <div className="w-24 text-right hidden md:block z-20">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Meta</div>
          <div className="text-sm font-bold text-slate-300">
            {data.meta_valor > 0 ? (data.meta_valor / 1000).toFixed(0) + 'k' : '-'}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function WaitingScreen({ title, status }: { title?: string, status: string }) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a]" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-8 relative z-10 max-w-2xl"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-32 h-32 mx-auto bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] p-1"
        >
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-yellow-500/50">
            <Trophy className="w-14 h-14 text-yellow-500" />
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            {title || 'ARENA'}
          </h1>
          <p className="text-xl text-blue-300/80 font-light tracking-widest uppercase">
            Aguardando Início da Temporada
          </p>
          <div className="text-sm text-slate-500 font-mono">
            Status: {status}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
