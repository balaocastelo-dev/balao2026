"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
    User as UserIcon, 
    Package, 
    LogOut, 
    Gift, 
    Search, 
    Calendar, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    Loader2,
    Copy,
    Check
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

export default function ContaPage() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "coupons" | "profile">("orders");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [ordersFilter, setOrdersFilter] = useState({ status: "", search: "", startDate: "", endDate: "" });

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [addingCoupon, setAddingCoupon] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    } else if (user) {
      setIsLoading(false);
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'coupons') fetchCoupons();
    }
  }, [user, router, isLoading, activeTab]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // --- Orders Logic ---
  const fetchOrders = async (page = 1) => {
    setLoadingOrders(true);
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: "20",
            ...ordersFilter
        });
        const res = await fetch(`/api/user/orders?${params}`);
        const data = await res.json();
        if (data.orders) {
            setOrders(data.orders);
            setOrdersPagination(data.pagination);
        }
    } catch (error) {
        console.error("Failed to fetch orders", error);
        showToast("Erro ao carregar pedidos.", "error");
    } finally {
        setLoadingOrders(false);
    }
  };

  const handleOrderFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setOrdersFilter({ ...ordersFilter, [e.target.name]: e.target.value });
  };

  const applyOrderFilters = (e: React.FormEvent) => {
      e.preventDefault();
      fetchOrders(1);
  };

  // --- Coupons Logic ---
  const fetchCoupons = async () => {
      setLoadingCoupons(true);
      try {
          const res = await fetch('/api/user/coupons');
          const data = await res.json();
          if (data.coupons) {
              setCoupons(data.coupons);
          }
      } catch (error) {
          console.error("Failed to fetch coupons", error);
      } finally {
          setLoadingCoupons(false);
      }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!couponCode) return;
      
      setAddingCoupon(true);
      try {
          const res = await fetch('/api/user/coupons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: couponCode })
          });
          const data = await res.json();
          
          if (res.ok) {
              showToast(data.message || "Cupom adicionado!", "success");
              setCouponCode("");
              fetchCoupons();
          } else {
              showToast(data.error || "Erro ao adicionar cupom.", "error");
          }
      } catch (error) {
          showToast("Erro de conexão.", "error");
      } finally {
          setAddingCoupon(false);
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast("Código copiado!", "success");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#E60012]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-red-50 p-3 rounded-full">
                    <UserIcon className="text-[#E60012]" size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
                    <p className="text-gray-500">{user?.email}</p>
                </div>
            </div>
            <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-[#E60012] transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
            >
                <LogOut size={20} />
                <span>Sair</span>
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-8">
                    <nav className="flex flex-col">
                        <button 
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'orders' ? 'border-[#E60012] bg-red-50 text-[#E60012]' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Package size={20} />
                            <span className="font-medium">Meus Pedidos</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('coupons')}
                            className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'coupons' ? 'border-[#E60012] bg-red-50 text-[#E60012]' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Gift size={20} />
                            <span className="font-medium">Meus Cupons</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'profile' ? 'border-[#E60012] bg-red-50 text-[#E60012]' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
                        >
                            <UserIcon size={20} />
                            <span className="font-medium">Dados Pessoais</span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
                
                {/* --- ORDERS TAB --- */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Package className="text-[#E60012]" />
                                Histórico de Pedidos
                            </h2>
                        </div>

                        {/* Filters */}
                        <form onSubmit={applyOrderFilters} className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    name="search"
                                    placeholder="Nº do pedido"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-[#E60012] outline-none"
                                    value={ordersFilter.search}
                                    onChange={handleOrderFilterChange}
                                />
                            </div>
                            <select 
                                name="status"
                                className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-[#E60012] outline-none"
                                value={ordersFilter.status}
                                onChange={handleOrderFilterChange}
                            >
                                <option value="">Todos os status</option>
                                <option value="pending">Pendente</option>
                                <option value="paid">Pago</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregue</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                            <input 
                                type="date" 
                                name="startDate"
                                className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-[#E60012] outline-none"
                                value={ordersFilter.startDate}
                                onChange={handleOrderFilterChange}
                            />
                            <button 
                                type="submit"
                                className="bg-[#E60012] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Filter size={16} />
                                Filtrar
                            </button>
                        </form>

                        {/* Orders List */}
                        {loadingOrders ? (
                            <div className="text-center py-12">
                                <Loader2 className="animate-spin mx-auto text-[#E60012] mb-2" />
                                <p className="text-gray-500">Carregando pedidos...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                <Package className="mx-auto text-gray-300 mb-3" size={48} />
                                <p className="text-gray-500">Nenhum pedido encontrado.</p>
                                <Link href="/" className="text-[#E60012] font-bold hover:underline mt-2 inline-block">
                                    Ir às compras
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {order.status === 'pending' ? 'Pendente' :
                                                         order.status === 'paid' ? 'Pago' :
                                                         order.status === 'shipped' ? 'Enviado' :
                                                         order.status === 'delivered' ? 'Entregue' :
                                                         order.status === 'cancelled' ? 'Cancelado' : order.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{order.items?.length || 0} itens</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="font-bold text-lg text-gray-900">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                                </span>
                                                <div className="flex gap-2">
                                                    {/* Link para detalhes se houver página de detalhes */}
                                                    <button className="text-sm text-[#E60012] hover:underline font-medium">
                                                        Ver Detalhes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {ordersPagination.totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                <button 
                                    onClick={() => fetchOrders(ordersPagination.page - 1)}
                                    disabled={ordersPagination.page === 1}
                                    className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-600 flex items-center">
                                    Página {ordersPagination.page} de {ordersPagination.totalPages}
                                </span>
                                <button 
                                    onClick={() => fetchOrders(ordersPagination.page + 1)}
                                    disabled={ordersPagination.page === ordersPagination.totalPages}
                                    className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* --- COUPONS TAB --- */}
                {activeTab === 'coupons' && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Gift className="text-[#E60012]" />
                                Meus Cupons
                            </h2>
                        </div>

                        {/* Add Coupon Form */}
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-8">
                            <h3 className="font-bold text-gray-900 mb-2">Adicionar Novo Cupom</h3>
                            <p className="text-sm text-gray-600 mb-4">Tem um código promocional? Adicione-o à sua carteira para usar na próxima compra.</p>
                            <form onSubmit={handleAddCoupon} className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Digite o código do cupom"
                                    className="flex-1 px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none uppercase font-mono"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20))}
                                    maxLength={20}
                                />
                                <button 
                                    type="submit"
                                    disabled={addingCoupon || !couponCode}
                                    className="bg-[#E60012] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {addingCoupon ? <Loader2 className="animate-spin" size={20} /> : "Aplicar"}
                                </button>
                            </form>
                        </div>

                        {/* Coupons List */}
                        {loadingCoupons ? (
                            <div className="text-center py-12">
                                <Loader2 className="animate-spin mx-auto text-[#E60012] mb-2" />
                                <p className="text-gray-500">Carregando cupons...</p>
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                <Gift className="mx-auto text-gray-300 mb-3" size={48} />
                                <p className="text-gray-500">Você não possui cupons salvos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {coupons.map((userCoupon) => {
                                    const isExpired = userCoupon.coupon.expiration_date && new Date(userCoupon.coupon.expiration_date) < new Date();
                                    const isUsed = userCoupon.status === 'used';
                                    const isValid = !isExpired && !isUsed && userCoupon.coupon.status === 'active';

                                    return (
                                        <div key={userCoupon.id} className={`border rounded-xl p-5 relative overflow-hidden transition-all ${isValid ? 'border-gray-200 bg-white hover:border-red-200 hover:shadow-sm' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className={`text-2xl font-bold ${isValid ? 'text-[#E60012]' : 'text-gray-400'}`}>
                                                        {userCoupon.coupon.discount_type === 'percentage' 
                                                            ? `${userCoupon.coupon.discount_value}% OFF` 
                                                            : `R$ ${userCoupon.coupon.discount_value.toFixed(2)} OFF`}
                                                    </span>
                                                    <p className="text-sm text-gray-500 mt-1">{userCoupon.coupon.description || "Desconto especial"}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    isValid ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                    {isUsed ? 'Utilizado' : isExpired ? 'Expirado' : 'Disponível'}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between border border-dashed border-gray-200">
                                                <code className="font-mono font-bold text-gray-700">{userCoupon.coupon.code}</code>
                                                <button 
                                                    onClick={() => copyToClipboard(userCoupon.coupon.code)}
                                                    className="text-gray-400 hover:text-[#E60012] transition-colors"
                                                    title="Copiar código"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar size={12} />
                                                {userCoupon.coupon.expiration_date 
                                                    ? `Válido até ${new Date(userCoupon.coupon.expiration_date).toLocaleDateString('pt-BR')}`
                                                    : 'Sem validade definida'}
                                            </div>
                                            
                                            {userCoupon.coupon.min_purchase_value > 0 && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Pedido mínimo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(userCoupon.coupon.min_purchase_value)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <UserIcon className="text-[#E60012]" size={24} />
                            <h3 className="text-xl font-bold text-gray-900">Dados Pessoais</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                                    {user?.email}
                                </div>
                            </div>
                            <div className="pt-4">
                                <p className="text-sm text-gray-500">
                                    Para alterar sua senha ou outros dados, entre em contato com o suporte.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}
