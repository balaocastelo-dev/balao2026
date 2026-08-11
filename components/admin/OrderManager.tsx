"use client";

import { useState, useEffect } from "react";
import { Order, OrderItem } from "@/lib/db";
import { MessageCircle, Mail, Trash2, CheckCircle, Truck, Package, XCircle, Search, Eye, Copy, X } from "lucide-react";
import Image from "next/image";

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Failed to delete order", error);
    }
  };

  const copyOrderData = (order: Order) => {
    const text = `
PEDIDO #${order.id.slice(0, 8)}
DATA: ${new Date(order.created_at).toLocaleDateString('pt-BR')}
--------------------------------
CLIENTE:
Nome: ${order.customer_name}
Email: ${order.customer_email}
WhatsApp: ${order.customer_whatsapp}

ENDEREÇO DE ENTREGA:
${order.address.street}, ${order.address.number}
${order.address.complement ? `Complemento: ${order.address.complement}` : ''}
${order.address.city} - ${order.address.state}
CEP: ${order.address.cep}

ITENS DO PEDIDO:
${order.items?.map(i => `- ${i.quantity}x ${i.product_name} | ${formatCurrency(i.price)} un.`).join('\n')}

TOTAL: ${formatCurrency(order.total)}
STATUS: ${getStatusLabel(order.status)}
    `.trim();

    navigator.clipboard.writeText(text);
    alert("Dados do pedido copiados para a área de transferência!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Pedidos</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar pedido..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E60012]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando pedidos...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-visible"> {/* overflow-visible for hover popup */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 relative group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</div>
                    <div>{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2 overflow-hidden">
                        {order.items?.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden">
                            {item.product_image ? (
                                <Image
                                    src={item.product_image}
                                    alt={item.product_name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                    onError={(e) => {
                                        // Fallback to icon if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                        // We can't easily inject React component here, so we rely on the parent div showing the background
                                        // Better approach: use a state or a separate component. 
                                        // For simplicity in this map, let's use a conditional render wrapper component concept inline if possible, 
                                        // but since we can't use hooks inside callback, we'll use a component.
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package size={20} />
                                </div>
                            )}
                            {/* Fallback element that shows if image is hidden/missing */}
                            {item.product_image && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 -z-10">
                                    <Package size={20} />
                                </div>
                            )}
                        </div>
                        ))}
                        {order.items && order.items.length > 4 && (
                            <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-600">
                                +{order.items.length - 4}
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{order.customer_name || 'N/A'}</div>
                    <div className="text-gray-500 text-xs">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {/* View Details Button */}
                       <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>

                      {/* WhatsApp Action */}
                      {order.customer_whatsapp && (
                        <a 
                          href={`https://wa.me/${order.customer_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${order.customer_name}, referente ao seu pedido #${order.id.slice(0, 8)} no Balão da Informática...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                          title="WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>
                      )}
                      
                      {/* Email Action */}
                      {order.customer_email && (
                        <a 
                          href={`mailto:${order.customer_email}?subject=Pedido #${order.id.slice(0, 8)} - Balão da Informática`}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Email"
                        >
                          <Mail size={18} />
                        </a>
                      )}

                      {/* Status Actions */}
                      <div className="relative group/status">
                        <button className="text-gray-500 hover:text-gray-700 p-1">
                            <CheckCircle size={18} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover/status:block border border-gray-200">
                            <button onClick={() => handleStatusChange(order.id, 'paid')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                              <CheckCircle size={14} className="text-green-500" /> Marcar como Pago
                            </button>
                            <button onClick={() => handleStatusChange(order.id, 'shipped')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                              <Truck size={14} className="text-gray-500" /> Marcar como Enviado
                            </button>
                            <button onClick={() => handleStatusChange(order.id, 'delivered')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                              <Package size={14} className="text-purple-500" /> Marcar como Entregue
                            </button>
                            <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                              <XCircle size={14} className="text-red-500" /> Cancelar Pedido
                            </button>
                          </div>
                      </div>

                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Pedido #{selectedOrder.id.slice(0, 8)}</h3>
                <p className="text-gray-500 text-sm">{new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
              {/* Status Bar */}
              <div className="bg-gray-50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Status Atual:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => copyOrderData(selectedOrder)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    <Copy size={16} />
                    Copiar Dados
                  </button>
                  {selectedOrder.customer_whatsapp && (
                    <a 
                      href={`https://wa.me/${selectedOrder.customer_whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b pb-2">Dados do Cliente</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="block text-sm text-gray-500">Nome Completo</span>
                      <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Email</span>
                      <a href={`mailto:${selectedOrder.customer_email}`} className="font-medium text-red-600 hover:underline">
                        {selectedOrder.customer_email}
                      </a>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">WhatsApp / Telefone</span>
                      <span className="font-medium text-gray-900">{selectedOrder.customer_whatsapp}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 border-b pb-2">Endereço de Entrega</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-1">
                    <p className="font-medium text-base text-gray-900">
                      {selectedOrder.address.street}, {selectedOrder.address.number}
                    </p>
                    {selectedOrder.address.complement && (
                      <p>Complemento: {selectedOrder.address.complement}</p>
                    )}
                    <p>{selectedOrder.address.city} - {selectedOrder.address.state}</p>
                    <p>CEP: {selectedOrder.address.cep}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 border-b pb-2">Itens do Pedido</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Un.</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 relative border rounded bg-gray-100">
                                <Image 
                                  src={item.product_image || "/placeholder.png"} 
                                  alt={item.product_name} 
                                  fill
                                  unoptimized
                                  className="object-cover rounded"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900" title={item.product_name}>
                                  {item.product_name.length > 40 ? item.product_name.substring(0, 40) + '...' : item.product_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      {selectedOrder.coupon_code && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-right font-medium text-green-600">
                            Desconto (Cupom: {selectedOrder.coupon_code}):
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-green-600">
                            - {formatCurrency(selectedOrder.discount_value || 0)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">Total do Pedido:</td>
                        <td className="px-6 py-4 text-right font-bold text-xl text-[#E60012]">
                          {formatCurrency(selectedOrder.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
