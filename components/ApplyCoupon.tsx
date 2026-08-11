"use client";
import { useState } from "react";
import { Ticket, X, Check, Loader2 } from "lucide-react";

interface ApplyCouponProps {
    cartTotal: number;
    items: any[];
    onApply: (discount: number, couponCode: string) => void;
}

export default function ApplyCoupon({ cartTotal, items, onApply }: ApplyCouponProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);

    // Simple in-memory cache
    const [cache, setCache] = useState<Record<string, any>>({});

    const handleApply = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setMessage(null);

        // Create a cache key based on code and cart state
        const cacheKey = `${code.trim().toLowerCase()}-${cartTotal}-${JSON.stringify(items.map(i => i.id))}`;

        if (cache[cacheKey]) {
            const data = cache[cacheKey];
            processResult(data);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, cartTotal, items })
            });
            const data = await res.json();
            
            // Update cache
            setCache(prev => ({ ...prev, [cacheKey]: data }));
            
            processResult(data);
        } catch (error) {
            setMessage({ type: 'error', text: "Erro ao validar cupom." });
        } finally {
            setLoading(false);
        }
    };

    const processResult = (data: any) => {
        if (data.valid) {
            setAppliedCoupon({ code: data.coupon.code, discount: data.discount });
            setMessage({ type: 'success', text: `Cupom aplicado! Desconto de R$ ${data.discount.toFixed(2)}` });
            onApply(data.discount, data.coupon.code);
        } else {
            setMessage({ type: 'error', text: data.message });
            onApply(0, "");
            setAppliedCoupon(null);
        }
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setCode("");
        setMessage(null);
        onApply(0, "");
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Ticket className="text-[#E60012]" size={20} />
                Cupom de Desconto
            </h3>
            
            {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                        <Check size={18} className="text-green-600" />
                        <span className="font-mono font-bold text-green-700">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={handleRemove} className="text-gray-400 hover:text-red-500">
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="Digite o código"
                        className="flex-1 border p-2 rounded-md uppercase focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-black"
                    />
                    <button 
                        onClick={handleApply}
                        disabled={loading || !code}
                        className="bg-gray-800 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Aplicar"}
                    </button>
                </div>
            )}
            
            {message && (
                <p className={`text-xs mt-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
