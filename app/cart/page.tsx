"use client";

import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Trash2, ArrowRight, ShoppingBag, Truck, CreditCard, User, Check, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ApplyCoupon from "@/components/ApplyCoupon";
import { calculateShipping as getShippingOptions } from "@/lib/shipping";

type ShippingOption = {
  name: string;
  days: string;
  cost: number;
};

export default function CartPage() {
  const { items, removeFromCart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");

  const finalTotal = Math.max(0, cartTotal - couponDiscount);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [shippingSelected, setShippingSelected] = useState<ShippingOption | null>(null);
  const totalWithShipping = Math.max(0, finalTotal + (shippingSelected?.cost ?? 0));

  const handleApplyCoupon = (discount: number, code: string) => {
      setCouponDiscount(discount);
      setAppliedCouponCode(code);
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    city: "",
    state: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Mask for phone
    if (name === "phone") {
        const numbers = value.replace(/\D/g, "");
        let formatted = numbers;
        if (numbers.length > 10) {
            formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        } else if (numbers.length > 6) {
             formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        } else if (numbers.length > 2) {
             formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        }
        setFormData(prev => ({ ...prev, [name]: formatted }));
        return;
    }

    // Mask for CEP
    if (name === "cep") {
        const numbers = value.replace(/\D/g, "");
        let formatted = numbers;
        if (numbers.length > 5) {
            formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
        }
        setFormData(prev => ({ ...prev, [name]: formatted }));
        if (numbers.length !== 8) {
            setShippingOptions(null);
            setShippingSelected(null);
        }
        
        // Auto-fetch address when CEP is full
        if (numbers.length === 8) {
            fetchAddress(numbers);
        }
        return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchAddress = async (cep: string) => {
      setCepLoading(true);
      try {
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await res.json();
          if (!data.erro) {
              setFormData(prev => ({
                  ...prev,
                  address: data.logradouro,
                  city: data.localidade,
                  state: data.uf,
                  // Keep number and complement if already typed, or clear if needed
              }));

              const options = await getShippingOptions(cep, cartTotal);
              setShippingOptions(options);
              const cheapestOption = options.reduce((acc, current) => (current.cost < acc.cost ? current : acc), options[0]);
              setShippingSelected(cheapestOption);

              // Optional: Focus on number field
              document.getElementById("number-input")?.focus();
          } else {
              alert("CEP não encontrado.");
          }
      } catch (error) {
          console.error("Error fetching CEP:", error);
          alert("Erro ao buscar CEP.");
      } finally {
          setCepLoading(false);
      }
  };

  const nextStep = () => {
      // Basic validation
      if (step === 1) {
          if (!formData.cep || !formData.address || !formData.number || !formData.city || !formData.state) {
              alert("Por favor, preencha o endereço completo.");
              return;
          }
          if (!shippingSelected) {
              alert("Por favor, calcule e selecione o frete.");
              return;
          }
      }
      if (step === 2) {
          if (!formData.name || !formData.phone || !formData.email) {
              alert("Por favor, preencha todos os campos obrigatórios.");
              return;
          }
      }
      setStep(prev => prev + 1);
  };

  const prevStep = () => {
      setStep(prev => prev - 1);
  };

  const handleFinalizeOrder = async () => {
    setLoading(true);

    try {
        if (!shippingSelected) {
            alert("Calcule e selecione o frete antes de finalizar.");
            setLoading(false);
            return;
        }
        const orderData = {
            customer: {
                ...formData
            },
            items: items.map(item => {
                 const priceStr = item.price.replace("R$", "").replace(/\./g, "").replace(",", ".");
                 const price = parseFloat(priceStr) || 0;
                 return {
                    product_id: item.id,
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    price: price
                 };
            }),
            total: totalWithShipping,
            shippingCost: shippingSelected.cost,
            shippingOption: shippingSelected,
            couponCode: appliedCouponCode,
            discountValue: couponDiscount
        };

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            clearCart();
            // Pass orderId, total and customer name for Pix generation
            const totalToPix = typeof result.total === "number" ? result.total : totalWithShipping;
            router.push(`/thank-you?orderId=${result.orderId}&total=${totalToPix}&name=${encodeURIComponent(formData.name)}`);
        } else {
            console.error("Order failed details:", result);
            alert(`Ocorreu um erro ao processar seu pedido: ${result.error || "Erro desconhecido"}`);
        }
    } catch (error) {
        console.error("Error submitting order:", error);
        alert("Erro de conexão. Verifique sua internet.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="text-[#E60012]" />
            Carrinho de Compras
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <ShoppingBag size={40} />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Aproveite nossas ofertas e adicione produtos incríveis!</p>
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 bg-[#E60012] text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
            >
                Continuar Comprando
                <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Content based on Step */}
            <div className="flex-1 space-y-6">
                
                {/* Steps Indicator */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-4">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#E60012] font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-[#E60012] bg-red-50' : 'border-gray-300'}`}>1</div>
                        <span className="hidden sm:inline">Entrega (CEP)</span>
                    </div>
                    <div className={`h-1 flex-1 mx-4 ${step >= 2 ? 'bg-[#E60012]' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#E60012] font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-[#E60012] bg-red-50' : 'border-gray-300'}`}>2</div>
                        <span className="hidden sm:inline">Identificação</span>
                    </div>
                    <div className={`h-1 flex-1 mx-4 ${step >= 3 ? 'bg-[#E60012]' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#E60012] font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-[#E60012] bg-red-50' : 'border-gray-300'}`}>3</div>
                        <span className="hidden sm:inline">Revisão</span>
                    </div>
                </div>

                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <User className="text-[#E60012]" size={20} />
                            Dados Pessoais
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all text-black font-medium"
                                    placeholder="Digite seu nome completo"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp) *</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all text-black font-medium"
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all text-black font-medium"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={prevStep}
                                className="text-gray-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={18} />
                                Voltar
                            </button>
                            <button
                                onClick={nextStep}
                                className="bg-[#E60012] text-white px-8 py-3 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                Próximo
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <MapPin className="text-[#E60012]" size={20} />
                            Endereço de Entrega
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="cep" 
                                            required
                                            value={formData.cep}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all text-black font-medium"
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                        {cepLoading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E60012]"></div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Digite o CEP para buscar o endereço.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua, Av) *</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        required
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all bg-gray-50 text-black font-medium"
                                        placeholder="Preenchido automaticamente"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                                    <input 
                                        id="number-input"
                                        type="text" 
                                        name="number" 
                                        required
                                        value={formData.number}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all text-black font-medium"
                                        placeholder="123"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                    <input 
                                        type="text" 
                                        name="complement" 
                                        value={formData.complement}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all"
                                        placeholder="Apto, Bloco, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                                    <input 
                                        type="text" 
                                        name="city" 
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all bg-gray-50"
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF) *</label>
                                    <input 
                                        type="text" 
                                        name="state" 
                                        required
                                        maxLength={2}
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all uppercase bg-gray-50 text-black font-medium"
                                        placeholder="SP"
                                    />
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold">
                                    <Truck className="text-[#E60012]" size={18} />
                                    <span>Frete e Prazo</span>
                                </div>

                                {!shippingOptions ? (
                                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                                        Digite o CEP para calcular o frete.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {shippingOptions.map((opt) => {
                                            const isSelected = shippingSelected?.name === opt.name && shippingSelected?.days === opt.days;
                                            const priceLabel = opt.cost === 0
                                                ? "Grátis"
                                                : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.cost);

                                            return (
                                                <label
                                                    key={`${opt.name}-${opt.days}`}
                                                    className={`flex items-start justify-between gap-4 p-4 rounded-md border cursor-pointer transition-colors ${isSelected ? 'border-[#E60012] bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="radio"
                                                            name="shipping-option"
                                                            className="mt-1"
                                                            checked={isSelected}
                                                            onChange={() => setShippingSelected(opt)}
                                                        />
                                                        <div>
                                                            <div className="font-bold text-gray-900">{opt.name}</div>
                                                            <div className="text-sm text-gray-600 mt-1">Prazo: {opt.days}</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-gray-900 whitespace-nowrap">{priceLabel}</div>
                                                </label>
                                            );
                                        })}
                                        <div className="text-xs text-gray-400 text-center">
                                            * Prazos estimados a partir de Campinas/SP (13070-000)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={nextStep}
                                className="bg-[#E60012] text-white px-8 py-3 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                Próximo
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}


                {step === 3 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <Check className="text-[#E60012]" size={20} />
                            Revisão do Pedido
                        </h2>
                        
                        {/* Cart Items Summary */}
                        <div className="space-y-4 mb-6">
                             {items.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-sm text-gray-500">Qtd: {item.quantity}</span>
                                            <span className="font-bold text-[#E60012]">{item.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Customer Info Summary */}
                        <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-700">
                            <h3 className="font-bold mb-2">Dados do Cliente:</h3>
                            <p>{formData.name}</p>
                            <p>{formData.phone} | {formData.email}</p>
                            <p className="mt-2">
                                {formData.address}, {formData.number} {formData.complement && `- ${formData.complement}`}
                            </p>
                            <p>{formData.city} - {formData.state}, {formData.cep}</p>
                            {shippingSelected && (
                                <p className="mt-2 font-medium text-gray-800">
                                    Frete: {shippingSelected.name} ({shippingSelected.days}) — {shippingSelected.cost === 0
                                        ? "Grátis"
                                        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingSelected.cost)}
                                </p>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <button 
                                onClick={prevStep}
                                className="text-gray-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={18} />
                                Voltar
                            </button>
                            
                            {/* Final Action handled by Right Column Button, or duplicate here? 
                                Let's keep the main action on the right for consistency, or move it here for mobile.
                                For now, we'll rely on the sticky right column, but on mobile it might be below.
                                Let's add a button here only visible on mobile? No, let's keep it clean.
                            */}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Summary (Sticky) */}
            <div className="w-full lg:w-96">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="text-[#E60012]" size={20} />
                        Resumo
                    </h3>
                    
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Itens no carrinho</h4>
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 items-center group">
                                    <div className="relative w-12 h-12 bg-white rounded border border-gray-200 shrink-0 overflow-hidden">
                                        <Image 
                                            src={item.image} 
                                            alt={item.name} 
                                            fill 
                                            className="object-contain p-1 group-hover:scale-110 transition-transform" 
                                            sizes="48px"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1" title={item.name}>
                                            {item.name}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
                                            <span className="text-xs font-bold text-[#E60012]">{item.price}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Remover item"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6 border-t pt-4">
                        <ApplyCoupon cartTotal={cartTotal} items={items} onApply={handleApplyCoupon} />
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} itens)</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                        </div>
                        
                        {couponDiscount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Desconto ({appliedCouponCode})</span>
                                <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(couponDiscount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-gray-600">
                            <span>Frete</span>
                            <span className={shippingSelected && shippingSelected.cost === 0 ? "text-green-600" : "text-gray-900 font-medium"}>
                                {shippingSelected
                                    ? (shippingSelected.cost === 0
                                        ? "Grátis"
                                        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingSelected.cost))
                                    : "Calcular"}
                            </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalWithShipping)}</span>
                        </div>
                    </div>

                    {step === 3 ? (
                        <button 
                            onClick={handleFinalizeOrder}
                            disabled={loading || !shippingSelected}
                            className="w-full bg-[#E60012] text-white py-3 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processando...' : 'Finalizar Pedido'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    ) : (
                         <div className="text-sm text-gray-500 text-center bg-gray-50 p-3 rounded">
                             Continue preenchendo seus dados para finalizar.
                         </div>
                    )}
                    
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        Continuar Comprando
                    </button>

                    <button 
                        onClick={() => {
                            if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
                                clearCart();
                            }
                        }}
                        className="w-full mt-3 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium py-2 transition-colors"
                    >
                        <Trash2 size={16} />
                        Limpar Carrinho
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        Ambiente seguro. Seus dados estão protegidos.
                    </p>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
