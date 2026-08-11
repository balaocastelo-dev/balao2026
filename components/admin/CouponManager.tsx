"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Lock, Gift } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiration_date?: string;
  max_uses?: number;
  current_uses: number;
  status: 'active' | 'inactive';
  min_purchase_value: number;
}

const HOLIDAY_MODELS = [
    { name: "Natal", code: "NATAL2026", type: "percentage", value: 10, min: 200 },
    { name: "Black Friday", code: "BLACKFRIDAY", type: "percentage", value: 30, min: 0 },
    { name: "Ano Novo", code: "ANONOVO", type: "fixed", value: 50, min: 500 },
    { name: "Dia das Mães", code: "MAE10", type: "percentage", value: 10, min: 100 },
    { name: "Dia dos Pais", code: "PAI10", type: "percentage", value: 10, min: 100 },
    { name: "Dia dos Namorados", code: "LOVE", type: "percentage", value: 15, min: 150 },
    { name: "Páscoa", code: "PASCOA", type: "fixed", value: 20, min: 200 },
    { name: "Halloween", code: "HALLOWEEN", type: "percentage", value: 13, min: 0 },
    { name: "Cyber Monday", code: "CYBER", type: "percentage", value: 25, min: 0 },
    { name: "Aniversário", code: "NIVERLOJA", type: "percentage", value: 20, min: 0 },
];

export default function CouponManager() {
    const [authorized, setAuthorized] = useState(false);
    const [password, setPassword] = useState("");
    
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon>>({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        status: "active",
        min_purchase_value: 0
    });

    useEffect(() => {
        if (authorized) fetchCoupons();
    }, [authorized]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "56676009") {
            setAuthorized(true);
        } else {
            alert("Senha incorreta");
        }
    };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/coupons");
            const data = await res.json();
            if (Array.isArray(data)) setCoupons(data);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const url = "/api/coupons";
            const method = currentCoupon.id ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentCoupon)
            });
            
            if (res.ok) {
                setIsEditing(false);
                fetchCoupons();
                setCurrentCoupon({
                    code: "",
                    discount_type: "percentage",
                    discount_value: 0,
                    status: "active",
                    min_purchase_value: 0
                });
            } else {
                const err = await res.json();
                alert("Erro ao salvar: " + err.error);
            }
        } catch (error) {
            alert("Erro de conexão");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja desativar este cupom?")) return;
        try {
            await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
            fetchCoupons();
        } catch (error) {
            alert("Erro ao excluir");
        }
    };

    const applyModel = (model: any) => {
        setCurrentCoupon({
            ...currentCoupon,
            code: model.code,
            discount_type: model.type,
            discount_value: model.value,
            min_purchase_value: model.min,
            status: "active"
        });
    };

    if (!authorized) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Lock size={48} className="text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-4">Acesso Restrito</h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">Esta área é protegida para garantir a segurança das promoções.</p>
                <form onSubmit={handleLogin} className="flex gap-2">
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="border p-2 rounded text-black"
                        placeholder="Senha de acesso"
                    />
                    <button type="submit" className="bg-[#E60012] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">Entrar</button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Gift className="text-[#E60012]" />
                    Gerenciamento de Cupons
                </h2>
                <button 
                    onClick={() => {
                        setCurrentCoupon({
                            code: "",
                            discount_type: "percentage",
                            discount_value: 0,
                            status: "active",
                            min_purchase_value: 0
                        });
                        setIsEditing(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Novo Cupom
                </button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4 text-gray-800 border-b pb-2">
                        {currentCoupon.id ? "Editar Cupom" : "Novo Cupom"}
                    </h3>
                    
                    {/* Modelos */}
                    {!currentCoupon.id && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <label className="text-sm font-bold text-gray-500 block mb-2">Modelos Rápidos (Datas Comemorativas):</label>
                            <div className="flex flex-wrap gap-2">
                                {HOLIDAY_MODELS.map(model => (
                                    <button 
                                        key={model.name}
                                        onClick={() => applyModel(model)}
                                        className="text-xs bg-white text-[#E60012] border border-[#E60012] px-3 py-1.5 rounded-full hover:bg-[#E60012] hover:text-white transition-all font-medium"
                                    >
                                        {model.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cupom</label>
                            <input 
                                value={currentCoupon.code}
                                onChange={e => setCurrentCoupon({...currentCoupon, code: e.target.value.toUpperCase()})}
                                className="w-full border p-2 rounded uppercase font-mono bg-yellow-50 focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-black"
                                placeholder="EX: VERÃO2026"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Desconto</label>
                                <select 
                                    value={currentCoupon.discount_type}
                                    onChange={e => setCurrentCoupon({...currentCoupon, discount_type: e.target.value as any})}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none bg-white text-black"
                                >
                                    <option value="percentage">Porcentagem (%)</option>
                                    <option value="fixed">Valor Fixo (R$)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Desconto</label>
                                <input 
                                    type="number"
                                    value={currentCoupon.discount_value}
                                    onChange={e => setCurrentCoupon({...currentCoupon, discount_value: Number(e.target.value)})}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-black"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Compra Mínima (R$)</label>
                            <input 
                                type="number"
                                value={currentCoupon.min_purchase_value}
                                onChange={e => setCurrentCoupon({...currentCoupon, min_purchase_value: Number(e.target.value)})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Validade (Opcional)</label>
                            <input 
                                type="datetime-local"
                                value={currentCoupon.expiration_date ? new Date(currentCoupon.expiration_date).toISOString().slice(0, 16) : ""}
                                onChange={e => setCurrentCoupon({...currentCoupon, expiration_date: e.target.value})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Usos (Opcional)</label>
                            <input 
                                type="number"
                                value={currentCoupon.max_uses || ""}
                                onChange={e => setCurrentCoupon({...currentCoupon, max_uses: Number(e.target.value)})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-black"
                                placeholder="Ilimitado"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                value={currentCoupon.status}
                                onChange={e => setCurrentCoupon({...currentCoupon, status: e.target.value as any})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none bg-white text-black"
                            >
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2 bg-[#E60012] text-white rounded font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={18} /> Salvar Cupom
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Código</th>
                                <th className="p-4">Desconto</th>
                                <th className="p-4">Mínimo</th>
                                <th className="p-4">Usos</th>
                                <th className="p-4">Validade</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {coupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono font-bold text-[#E60012] text-lg">{coupon.code}</td>
                                    <td className="p-4 font-medium text-gray-800">
                                        {coupon.discount_type === 'percentage' 
                                            ? `${coupon.discount_value}%` 
                                            : `R$ ${coupon.discount_value.toFixed(2)}`}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {coupon.min_purchase_value > 0 
                                            ? `R$ ${coupon.min_purchase_value.toFixed(2)}` 
                                            : '-'}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {coupon.current_uses} <span className="text-gray-400">/ {coupon.max_uses || '∞'}</span>
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">
                                        {coupon.expiration_date 
                                            ? new Date(coupon.expiration_date).toLocaleDateString() 
                                            : 'Indeterminado'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            coupon.status === 'active' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {coupon.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                setCurrentCoupon(coupon);
                                                setIsEditing(true);
                                            }}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                                            title="Desativar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400">
                                        <Gift size={48} className="mx-auto mb-4 text-gray-200" />
                                        <p>Nenhum cupom encontrado.</p>
                                        <p className="text-sm">Crie seu primeiro cupom para começar!</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
