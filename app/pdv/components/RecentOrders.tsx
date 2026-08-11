'use client';

import { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, User, CreditCard, Printer, Filter } from 'lucide-react';
import PrintReceiptModal from './PrintReceiptModal';

interface RecentOrder {
  id: string;
  customer_name: string;
  total: number;
  created_at: string;
  payment_method: string;
  origin: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchRecentOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/pdv/orders/recent';
      const params = new URLSearchParams();
      
      if (startDate) {
        // Append time to ensure full day coverage if needed, or just send date
        params.append('startDate', new Date(startDate).toISOString());
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append('endDate', end.toISOString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []); // Initial load

  const handleFilter = () => {
    fetchRecentOrders();
  };

  const handlePrint = async (orderId: string) => {
    try {
      // Fetch full order details including items
      const response = await fetch(`/api/pdv/orders/${orderId}`);
      if (response.ok) {
        const orderDetails = await response.json();
        setSelectedOrder(orderDetails);
        setIsPrintModalOpen(true);
      } else {
        alert('Erro ao carregar detalhes do pedido para impressão.');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      alert('Erro ao carregar detalhes do pedido.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'pix': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'credit_card': return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'debit_card': return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'cash': return <DollarSign className="w-4 h-4 text-yellow-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'Pix';
      case 'credit_card': return 'Cartão Crédito';
      case 'debit_card': return 'Cartão Débito';
      case 'cash': return 'Dinheiro';
      default: return method;
    }
  };

  return (
    <div className="flex min-h-[50vh] flex-col rounded-2xl border border-gray-200 bg-white p-4 md:h-full md:rounded-lg">
      <div className="flex flex-col gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-red-600" />
          Últimos Pedidos
        </h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleFilter}
            className="flex items-center justify-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-white transition-colors hover:bg-red-700 sm:rounded"
          >
            <Filter size={14} />
            Filtrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded p-3">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 py-8 flex-1 flex flex-col items-center justify-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
          {orders.map((order) => (
            <div key={order.id} className="group relative rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50 md:rounded-lg">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="max-w-full truncate text-sm font-medium text-gray-900 sm:max-w-[180px]" title={order.customer_name}>
                    {order.customer_name || 'Cliente não informado'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                  {formatCurrency(order.total)}
                </div>
              </div>

              <div className="flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getPaymentMethodIcon(order.payment_method)}
                    <span>{getPaymentMethodLabel(order.payment_method)}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {order.origin === 'pdv' ? 'PDV' : 'Site'}
                  </span>
                  <button
                    onClick={() => handlePrint(order.id)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Imprimir Comprovante"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isPrintModalOpen && (
        <PrintReceiptModal
          order={selectedOrder}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
}
