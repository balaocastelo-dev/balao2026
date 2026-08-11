"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, 
  Printer, Minus, Calendar, Trash, ChevronDown, ChevronUp, Lock
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

// --- Types ---
interface ServiceOrder {
  id: string;
  osNumber: string;
  status: "Entrada" | "Reparo" | "Concluída";
  date: string; // YYYY-MM-DD
  
  // Entradas (Receitas)
  laborIncome: number;
  partsIncome: number;
  
  // Saídas (Custos diretos)
  laborExpense: number; 
  partsExpense: number;

  paymentMethod: "PIX" | "Cartão" | "Dinheiro";
}

interface OperationalExpense {
  id: string;
  description: string;
  value: number;
  category: "Salário" | "Insumo" | "Aluguel" | "Imposto" | "Outro";
  date: string;
}

interface FinancialSummary {
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  paymentMix: {
    PIX: number;
    Cartao: number;
    Dinheiro: number;
  };
  operationalExpensesTotal: number;
  directCostsTotal: number;
}

// --- Component ---
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function WeeklyClosing() {
  const { showToast } = useToast();
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // State
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [expenses, setExpenses] = useState<OperationalExpense[]>([]);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Date Filter State
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [uiStart, setUiStart] = useState("");
  const [uiEnd, setUiEnd] = useState("");
  
  // Form State - OS
  const [newOrder, setNewOrder] = useState<Partial<ServiceOrder>>({
    status: "Entrada",
    paymentMethod: "PIX",
    laborIncome: 0,
    partsIncome: 0,
    laborExpense: 0,
    partsExpense: 0,
    date: new Date().toISOString().split('T')[0]
  });

  // Form State - Expense
  const [newExpense, setNewExpense] = useState<Partial<OperationalExpense>>({
    category: "Outro",
    value: 0,
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Load from API on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check Auth
      if (sessionStorage.getItem("fechamento_auth") === "true") {
        setIsAuthenticated(true);
      }

      // Fetch Data
      const fetchData = async () => {
        try {
          const [resOrders, resExpenses] = await Promise.all([
            fetch('/api/weekly/orders'),
            fetch('/api/weekly/expenses')
          ]);

          if (resOrders.ok) {
            const data = await resOrders.json();
            if (Array.isArray(data)) setOrders(data);
          }
          
          if (resExpenses.ok) {
            const data = await resExpenses.json();
            if (Array.isArray(data)) setExpenses(data);
          }
        } catch (error) {
          console.error("Failed to fetch data", error);
          showToast("Erro ao carregar dados do servidor.");
        }
      };

      fetchData();
    }
  }, []);

  // Removed LocalStorage Effects

  // Calculations
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filterStart && o.date < filterStart) return false;
      if (filterEnd && o.date > filterEnd) return false;
      return true;
    });
  }, [orders, filterStart, filterEnd]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (filterStart && e.date < filterStart) return false;
      if (filterEnd && e.date > filterEnd) return false;
      return true;
    });
  }, [expenses, filterStart, filterEnd]);

  const summary: FinancialSummary = useMemo(() => {
    const directCosts = filteredOrders.reduce((sum, o) => sum + (o.laborExpense || 0) + (o.partsExpense || 0), 0);
    const revenue = filteredOrders.reduce((sum, o) => sum + (o.laborIncome || 0) + (o.partsIncome || 0), 0);
    const opExpenses = filteredExpenses.reduce((sum, e) => sum + (e.value || 0), 0);
    
    const paymentMix = filteredOrders.reduce((acc, order) => {
      const orderTotal = (order.laborIncome || 0) + (order.partsIncome || 0);
      if (order.paymentMethod === "PIX") acc.PIX += orderTotal;
      if (order.paymentMethod === "Cartão") acc.Cartao += orderTotal;
      if (order.paymentMethod === "Dinheiro") acc.Dinheiro += orderTotal;
      return acc;
    }, { PIX: 0, Cartao: 0, Dinheiro: 0 });

    return {
      grossRevenue: revenue,
      totalExpenses: directCosts + opExpenses,
      netProfit: revenue - (directCosts + opExpenses),
      paymentMix,
      directCostsTotal: directCosts,
      operationalExpensesTotal: opExpenses
    };
  }, [filteredOrders, filteredExpenses]);

  // Weeks Calculation
  const availableWeeks = useMemo(() => {
    const allDates = [...orders.map(o => o.date), ...expenses.map(e => e.date)].sort();
    if (allDates.length === 0) return [];

    const weeks: { start: string; end: string; label: string }[] = [];
    const processed = new Set<string>();

    allDates.forEach(dateStr => {
      if (!dateStr) return;
      const date = parseDate(dateStr);
      // Get Sunday of that week
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay());
      const startStr = start.toISOString().split('T')[0];

      if (processed.has(startStr)) return;
      processed.add(startStr);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const endStr = end.toISOString().split('T')[0];

      weeks.push({
        start: startStr,
        end: endStr,
        label: `Semana ${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`
      });
    });

    return weeks.sort((a, b) => b.start.localeCompare(a.start));
  }, [orders, expenses]);

  // Months Calculation
  const availableMonths = useMemo(() => {
    const allDates = [...orders.map(o => o.date), ...expenses.map(e => e.date)].sort();
    if (allDates.length === 0) return [];

    const months: { start: string; end: string; label: string }[] = [];
    const processed = new Set<string>();

    allDates.forEach(dateStr => {
      if (!dateStr) return;
      // Ajuste de fuso horário simples para garantir mês correto
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const key = `${year}-${month}`;

      if (processed.has(key)) return;
      processed.add(key);

      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0); // Last day of month

      // Format YYYY-MM-DD manually to avoid timezone issues
      const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      
      const monthName = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      months.push({
        start: startStr,
        end: endStr,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      });
    });

    return months.sort((a, b) => b.start.localeCompare(a.start));
  }, [orders, expenses]);

  // Daily Summary Calculation
  const dailySummary = useMemo(() => {
    const summary = new Map<string, {
      date: string;
      count: number;
      revenue: number;
      cost: number;
      orders: ServiceOrder[];
    }>();

    filteredOrders.forEach(order => {
      const date = order.date;
      if (!summary.has(date)) {
        summary.set(date, {
          date,
          count: 0,
          revenue: 0,
          cost: 0,
          orders: []
        });
      }
      
      const dayData = summary.get(date)!;
      const rev = (order.laborIncome || 0) + (order.partsIncome || 0);
      const cost = (order.laborExpense || 0) + (order.partsExpense || 0);
      
      dayData.count++;
      dayData.revenue += rev;
      dayData.cost += cost;
      dayData.orders.push(order);
    });

    return Array.from(summary.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredOrders]);


  // Handlers - Orders
  const handleAddOrder = async () => {
    if (!newOrder.osNumber) {
      showToast("Número da OS é obrigatório!");
      return;
    }
    
    // Optimistic Update
    const tempId = crypto.randomUUID();
    const order: ServiceOrder = {
      id: tempId,
      osNumber: newOrder.osNumber,
      status: newOrder.status as any || "Entrada",
      paymentMethod: newOrder.paymentMethod as any || "PIX",
      laborIncome: Number(newOrder.laborIncome) || 0,
      partsIncome: Number(newOrder.partsIncome) || 0,
      laborExpense: Number(newOrder.laborExpense) || 0,
      partsExpense: Number(newOrder.partsExpense) || 0,
      date: newOrder.date || new Date().toISOString().split('T')[0]
    };

    // Remove ID for creation (let DB handle it or use temp, but here we use UUID)
    // Actually we can send the ID to Supabase if we want, or let it generate.
    // Our SQL uses default gen_random_uuid(), but we can override.
    // Let's rely on backend response for ID to be safe, but for optimistic UI we need one.
    // We will wait for response to ensure persistence.
    
    try {
      const res = await fetch('/api/weekly/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order) // sending ID is fine as it's UUID
      });

      if (!res.ok) throw new Error("Falha ao salvar");
      
      const savedOrder = await res.json();
      setOrders([...orders, savedOrder]);
      
      setNewOrder({
        status: "Entrada",
        paymentMethod: "PIX",
        laborIncome: 0,
        partsIncome: 0,
        laborExpense: 0,
        partsExpense: 0,
        osNumber: "",
        date: new Date().toISOString().split('T')[0]
      });
      showToast("OS Adicionada e Salva!");
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar OS.");
    }
  };

  const removeOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/weekly/orders?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Falha ao remover");
      
      setOrders(orders.filter(o => o.id !== id));
      showToast("OS Removida.");
    } catch (e) {
      showToast("Erro ao remover OS.");
    }
  };

  // Handlers - Expenses
  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.value) {
      showToast("Descrição e valor são obrigatórios!");
      return;
    }

    const expense: OperationalExpense = {
      id: crypto.randomUUID(),
      description: newExpense.description!,
      value: Number(newExpense.value),
      category: newExpense.category as any || "Outro",
      date: newExpense.date || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/weekly/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });

      if (!res.ok) throw new Error("Falha ao salvar");
      
      const savedExpense = await res.json();
      setExpenses([...expenses, savedExpense]);
      
      setNewExpense({ category: "Outro", value: 0, description: "", date: new Date().toISOString().split('T')[0] });
      showToast("Despesa adicionada!");
    } catch (e) {
      showToast("Erro ao salvar despesa.");
    }
  };

  const removeExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/weekly/expenses?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Falha ao remover");
      
      setExpenses(expenses.filter(e => e.id !== id));
      showToast("Despesa removida.");
    } catch (e) {
      showToast("Erro ao remover despesa.");
    }
  };

  const toggleDay = (date: string) => {
    const newSet = new Set(expandedDays);
    if (newSet.has(date)) {
      newSet.delete(date);
    } else {
      newSet.add(date);
    }
    setExpandedDays(newSet);
  };

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleClearAll = async () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const expected = `56676009${day}${month}${year}`;

    const pwd = prompt("Digite a senha de segurança para apagar TUDO (Senha do dia):");
    if (pwd !== expected) {
      showToast("Senha incorreta! Ação cancelada.");
      return;
    }

    if (confirm("Tem certeza ABSOLUTA? Esta ação apagará TODOS os dados do banco de dados permanentemente.")) {
      try {
         const res = await fetch('/api/weekly/reset', { method: 'DELETE' });
         if (!res.ok) throw new Error("Falha ao apagar");
         
         setOrders([]);
         setExpenses([]);
         showToast("Todos os dados foram apagados do servidor.");
      } catch (e) {
         showToast("Erro ao apagar dados.");
      }
    }
  };

  const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const expected = `56676009${day}${month}${year}`;

    if (passwordInput === expected) {
      setIsAuthenticated(true);
      sessionStorage.setItem("fechamento_auth", "true");
      showToast("Acesso permitido!");
    } else {
      showToast("Senha incorreta.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full text-center">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h1>
          <p className="text-slate-500 mb-6">Digite a senha do dia para acessar o sistema.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Senha de Acesso"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Entrar
            </button>
          </form>
          <div className="mt-6 text-xs text-slate-400">
            Assistência Balão da Informática &copy; 2026
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 no-print">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Fechamento Semanal</h1>
            <p className="text-slate-500">Assistência Balão da Informática</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Period Selector */}
            {(availableWeeks.length > 0 || availableMonths.length > 0) && (
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                 <Calendar size={16} className="text-slate-400" />
                 <select 
                   className="text-xs text-slate-600 bg-transparent outline-none"
                   onChange={(e) => {
                     const [start, end] = e.target.value.split('|');
                     if (start && end) {
                       setFilterStart(start);
                       setFilterEnd(end);
                       setUiStart(start);
                       setUiEnd(end);
                     } else {
                       setFilterStart("");
                       setFilterEnd("");
                       setUiStart("");
                       setUiEnd("");
                     }
                   }}
                 >
                   <option value="|">Todo o Período</option>
                   
                   {availableMonths.length > 0 && (
                     <optgroup label="Meses">
                       {availableMonths.map((m, idx) => (
                         <option key={`m-${idx}`} value={`${m.start}|${m.end}`}>
                           {m.label}
                         </option>
                       ))}
                     </optgroup>
                   )}

                   {availableWeeks.length > 0 && (
                     <optgroup label="Semanas">
                       {availableWeeks.map((week, idx) => (
                         <option key={`w-${idx}`} value={`${week.start}|${week.end}`}>
                           {week.label}
                         </option>
                       ))}
                     </optgroup>
                   )}
                 </select>
              </div>
            )}

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase hidden md:inline">Período:</span>
              <input 
                type="date" 
                value={uiStart}
                onChange={e => setUiStart(e.target.value)}
                className="p-1 border rounded text-xs text-slate-600 w-24 md:w-auto"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="date" 
                value={uiEnd}
                onChange={e => setUiEnd(e.target.value)}
                className="p-1 border rounded text-xs text-slate-600 w-24 md:w-auto"
              />
              <button 
                onClick={() => { setFilterStart(uiStart); setFilterEnd(uiEnd); }}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                title="Atualizar Data"
              >
                Atualizar
              </button>
              {(filterStart || filterEnd) && (
                <button 
                  onClick={() => { 
                    setFilterStart(""); setFilterEnd(""); 
                    setUiStart(""); setUiEnd("");
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                >
                  <Minus size={14} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2 ml-auto xl:ml-0">
               <button onClick={handleClearAll} className="p-2 bg-red-100 text-red-600 border border-red-200 rounded hover:bg-red-200 flex items-center gap-2" title="Apagar Tudo">
                <Trash size={18} />
              </button>
              
              <button onClick={handlePrint} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                <Printer size={18} /> <span className="hidden md:inline">Imprimir</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- INPUT SECTIONS (No Print) --- */}
        <div className="grid md:grid-cols-3 gap-6 no-print">
          
          {/* OS Input */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="text-blue-500" /> Nova Ordem de Serviço
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input 
                type="date"
                value={newOrder.date}
                onChange={e => setNewOrder({...newOrder, date: e.target.value})}
                className="col-span-1 p-2 border rounded text-sm text-slate-600"
              />
              <input 
                type="text" 
                placeholder="Nº OS"
                value={newOrder.osNumber}
                onChange={e => setNewOrder({...newOrder, osNumber: e.target.value})}
                className="col-span-1 p-2 border rounded text-sm"
              />
              <select 
                value={newOrder.status}
                onChange={e => setNewOrder({...newOrder, status: e.target.value as any})}
                className="col-span-1 p-2 border rounded text-sm"
              >
                <option>Entrada</option>
                <option>Reparo</option>
                <option>Concluída</option>
              </select>
              <select 
                value={newOrder.paymentMethod}
                onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value as any})}
                className="col-span-2 md:col-span-1 p-2 border rounded text-sm"
              >
                <option>PIX</option>
                <option>Cartão</option>
                <option>Dinheiro</option>
              </select>
              
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-green-600">Entrada MO</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.laborIncome || ""}
                    onChange={e => setNewOrder({...newOrder, laborIncome: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-green-200 rounded text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-green-600">Entrada Peça</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.partsIncome || ""}
                    onChange={e => setNewOrder({...newOrder, partsIncome: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-green-200 rounded text-sm"
                  />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-red-500">Saída MO</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.laborExpense || ""}
                    onChange={e => setNewOrder({...newOrder, laborExpense: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-red-200 rounded text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-red-500">Saída Peça</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.partsExpense || ""}
                    onChange={e => setNewOrder({...newOrder, partsExpense: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-red-200 rounded text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddOrder}
                className="col-span-2 md:col-span-4 mt-2 bg-slate-900 text-white p-2 rounded hover:bg-slate-800 text-sm font-medium"
              >
                Adicionar OS
              </button>
            </div>
          </div>

          {/* Expenses Input */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Minus className="text-red-500" /> Despesa Avulsa
            </h2>
            <div className="space-y-3">
              <input 
                type="date"
                value={newExpense.date}
                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full p-2 border rounded text-sm text-slate-600"
              />
              <input 
                type="text" 
                placeholder="Descrição (ex: Aluguel)"
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  className="p-2 border rounded text-sm"
                >
                  <option>Salário</option>
                  <option>Insumo</option>
                  <option>Aluguel</option>
                  <option>Imposto</option>
                  <option>Outro</option>
                </select>
                <input 
                  type="number" 
                  placeholder="R$ 0.00"
                  value={newExpense.value || ""}
                  onChange={e => setNewExpense({...newExpense, value: parseFloat(e.target.value)})}
                  className="p-2 border rounded text-sm"
                />
              </div>
              <button 
                onClick={handleAddExpense}
                className="w-full bg-red-50 text-red-600 border border-red-200 p-2 rounded hover:bg-red-100 text-sm font-medium"
              >
                Lançar Despesa
              </button>
            </div>
          </div>

        </div>

        {/* --- REPORT CONTENT (Printable) --- */}
        <div id="report-content" className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 space-y-8 print:shadow-none print:border-none print:p-0">
          
          <div className="border-b pb-4 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Relatório de Fechamento</h2>
              <p className="text-slate-500 text-sm">
                {filterStart && filterEnd 
                  ? `Período: ${parseDate(filterStart).toLocaleDateString('pt-BR')} até ${parseDate(filterEnd).toLocaleDateString('pt-BR')}`
                  : `Gerado em ${new Date().toLocaleDateString('pt-BR')}`
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Balão da Informática</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <TrendingUp size={18} /> <span className="text-sm font-bold uppercase">Receita Bruta</span>
              </div>
              <p className="text-2xl font-bold text-green-800">{fmt(summary.grossRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">{filteredOrders.length} ordens de serviço</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <TrendingDown size={18} /> <span className="text-sm font-bold uppercase">Despesas Totais</span>
              </div>
              <p className="text-2xl font-bold text-red-800">{fmt(summary.totalExpenses)}</p>
              <div className="flex justify-between text-xs text-red-600 mt-1">
                <span>Diretas: {fmt(summary.directCostsTotal)}</span>
                <span>Op.: {fmt(summary.operationalExpensesTotal)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${summary.netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className={`flex items-center gap-2 mb-1 ${summary.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                <DollarSign size={18} /> <span className="text-sm font-bold uppercase">Lucro Líquido</span>
              </div>
              <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                {fmt(summary.netProfit)}
              </p>
              <p className={`text-xs mt-1 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Margem: {summary.grossRevenue ? ((summary.netProfit / summary.grossRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* --- ORDERS LIST (Daily Summary) --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center print:py-2">
                <h2 className="text-lg font-semibold text-slate-800 print:text-base">Resumo Diário de Serviços</h2>
                <div className="text-sm text-slate-500 print:hidden">
                  {filteredOrders.length} OS encontradas
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50 print:bg-transparent print:text-slate-600 print:border-b">
                    <tr>
                      <th className="px-4 py-3 w-8 print:hidden"></th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3 text-center">Qtd. OS</th>
                      <th className="px-4 py-3 text-right text-green-600">Receita</th>
                      <th className="px-4 py-3 text-right text-red-500">Custo</th>
                      <th className="px-4 py-3 text-right font-bold">Lucro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                    {dailySummary.map(day => {
                      const isExpanded = expandedDays.has(day.date);
                      return (
                        <React.Fragment key={day.date}>
                          {/* Day Summary Row */}
                          <tr 
                            className="hover:bg-slate-50 cursor-pointer print:font-bold print:bg-slate-100"
                            onClick={() => toggleDay(day.date)}
                          >
                            <td className="px-4 py-3 text-slate-400 print:hidden">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {parseDate(day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">{day.count}</td>
                            <td className="px-4 py-3 text-right text-green-600 font-medium">{fmt(day.revenue)}</td>
                            <td className="px-4 py-3 text-right text-red-500 font-medium">{fmt(day.cost)}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">{fmt(day.revenue - day.cost)}</td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                      <tr className={`${isExpanded ? 'table-row' : 'hidden print:table-row'} bg-slate-50 print:bg-white`}>
                            <td colSpan={6} className="p-0">
                              <div className="px-4 py-2 print:px-0">
                                <table className="w-full text-xs border-l-2 border-blue-500 print:border-none mb-2 print:text-[10px]">
                              <thead className="text-slate-400 bg-slate-100 print:hidden">
                                <tr>
                                  <th className="px-3 py-1 text-left">Data</th>
                                  <th className="px-3 py-1 text-left">OS</th>
                                  <th className="px-3 py-1 text-right">Rec.</th>
                                  <th className="px-3 py-1 text-right">Custo</th>
                                  <th className="px-3 py-1 text-right">Lucro</th>
                                  <th className="px-3 py-1 text-right print:hidden">Ação</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {day.orders.map(order => {
                                  const rev = (order.laborIncome || 0) + (order.partsIncome || 0);
                                  const cost = (order.laborExpense || 0) + (order.partsExpense || 0);
                                  return (
                                    <tr key={order.id} className="hover:bg-slate-200 print:hover:bg-transparent">
                                      <td className="px-3 py-1 text-slate-500 print:py-0.5">
                                        {parseDate(order.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                                      </td>
                                      <td className="px-3 py-1 font-medium text-slate-700 print:py-0.5">
                                        OS: {order.osNumber} <span className="text-slate-400 font-normal ml-2">({order.status})</span>
                                      </td>
                                      <td className="px-3 py-1 text-right text-green-600 print:py-0.5">{fmt(rev)}</td>
                                      <td className="px-3 py-1 text-right text-red-500 print:py-0.5">{fmt(cost)}</td>
                                      <td className="px-3 py-1 text-right font-bold text-slate-700 print:py-0.5">{fmt(rev - cost)}</td>
                                      <td className="px-3 py-1 text-right print:hidden">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); removeOrder(order.id); }} 
                                          className="text-slate-400 hover:text-red-500"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                    {dailySummary.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 text-slate-400">Nenhuma OS encontrada neste período.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses & Mix Table */}
            <div className="space-y-6">
              
              {/* Operational Expenses */}
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 border-b pb-2">Despesas Avulsas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-2 py-2">Data</th>
                        <th className="px-2 py-2">Desc.</th>
                        <th className="px-2 py-2">Cat.</th>
                        <th className="px-2 py-2">Valor</th>
                        <th className="px-2 py-2 text-right no-print">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenses.map(expense => (
                        <tr key={expense.id} className="hover:bg-slate-50">
                          <td className="px-2 py-2 text-slate-500 text-xs">
                             {expense.date ? parseDate(expense.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) : '-'}
                          </td>
                          <td className="px-2 py-2">{expense.description}</td>
                          <td className="px-2 py-2 text-xs">
                            <span className="px-2 py-1 bg-slate-100 rounded-full text-slate-600">{expense.category}</span>
                          </td>
                          <td className="px-2 py-2 font-bold text-red-600">{fmt(expense.value)}</td>
                          <td className="px-2 py-2 text-right no-print">
                            <button onClick={() => removeExpense(expense.id)} className="text-slate-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-4 text-slate-400">Nenhuma despesa encontrada.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Mix */}
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 border-b pb-2">Formas de Pagamento</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">PIX</div>
                    <div className="font-bold text-slate-700">{fmt(summary.paymentMix.PIX)}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Cartão</div>
                    <div className="font-bold text-slate-700">{fmt(summary.paymentMix.Cartao)}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Dinheiro</div>
                    <div className="font-bold text-slate-700">{fmt(summary.paymentMix.Dinheiro)}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
