"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Banknote, QrCode, Printer, CheckCircle, AlertTriangle, Copy, Check, ShoppingCart } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { usePdv } from "../store";
import { createOrder } from "@/app/pdv/actions";
import { QRCodeSVG } from "qrcode.react";
import { generatePixPayload } from "@/lib/pix";
import PrintReceiptModal from "./PrintReceiptModal";

export default function PaymentModal() {
  const { state, dispatch, total } = usePdv();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<string>("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Estados para PIX
  const [showPix, setShowPix] = useState(false);
  const [pixPayload, setPixPayload] = useState("");
  const [pixCopied, setPixCopied] = useState(false);

  // Auto-refresh após sucesso
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (success) {
      timeout = setTimeout(() => {
        window.location.reload();
      }, 5000); // 5 segundos para ler e atualizar sozinho
    }
    return () => clearTimeout(timeout);
  }, [success]);

  const handlePixSelection = () => {
    const payload = generatePixPayload({
      key: SITE_CONFIG.pix.key,
      name: SITE_CONFIG.pix.name,
      city: SITE_CONFIG.pix.city,
      amount: total,
      txid: `PDV${Date.now().toString().slice(-10)}`
    });
    setPixPayload(payload);
    setShowPix(true);
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const handlePayment = async (method: string) => {
    setLoading(true);
    setError("");
    setLastPaymentMethod(method);

    try {
      // Simulação de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await createOrder({
        customer: state.customer,
        items: state.cart,
        total: total,
        paymentMethod: method,
        origin: "pdv",
        sellerId: state.sellerId
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setOrderId(res.orderId ?? null);
      setSuccess(true);
      
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };


  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleNewSale = () => {
    window.location.reload();
  };

  if (success) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in duration-200 md:rounded-xl">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Venda Finalizada!</h2>
              <p className="text-gray-600 mb-2">O pedido #{orderId} foi registrado com sucesso.</p>
              <p className="text-sm text-gray-500 mb-8">Atualizando sistema em 5 segundos...</p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button 
                  onClick={handlePrint}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-100 transition-all hover:border-gray-200 group"
                >
                  <Printer className="w-8 h-8 text-gray-600 mb-2 group-hover:text-gray-900" />
                  <span className="font-medium text-gray-900">Imprimir Cupom</span>
                </button>
                
                <button 
                  onClick={handleNewSale}
                  className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-xl border-2 border-red-100 transition-all hover:border-red-200 group"
                >
                  <ShoppingCart className="w-8 h-8 text-red-600 mb-2 group-hover:text-red-700" />
                  <span className="font-medium text-red-900">Nova Venda</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showPrintModal && (
          <PrintReceiptModal
            order={{
              id: orderId || "PENDENTE",
              created_at: new Date().toISOString(),
              customer_name: state.customer.name || "Consumidor Final",
              customer_email: state.customer.email,
              customer_whatsapp: state.customer.phone,
              total: total,
              payment_method: lastPaymentMethod,
              origin: "pdv",
              items: state.cart.map(item => ({
                id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price
              }))
            }}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:h-full md:rounded-lg md:p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="text-red-600" />
          Pagamento
        </h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total a Pagar</p>
          <p className="text-xl font-bold text-gray-900 md:text-2xl">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {showPix ? (
        <div className="animate-in fade-in zoom-in flex flex-col items-center justify-center p-2 text-center duration-300 md:p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pagamento via PIX</h3>
          <p className="text-gray-600 mb-6">Escaneie o QR Code abaixo para pagar</p>
          
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-100 mb-6">
            <QRCodeSVG value={pixPayload} size={180} />
          </div>
          
          <div className="w-full max-w-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Chave PIX (Copia e Cola)</p>
            <div className="flex items-center gap-2">
              <input 
                readOnly 
                value={pixPayload} 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-600 truncate focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button 
                onClick={copyPix}
                className={`p-2 rounded-lg border transition-colors ${pixCopied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                title="Copiar código PIX"
              >
                {pixCopied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {pixCopied && <p className="text-xs text-green-600 mt-1 font-medium">Copiado com sucesso!</p>}
          </div>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setShowPix(false)}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-200 md:rounded-lg"
            >
              Voltar
            </button>
            <button
              onClick={() => handlePayment("pix")}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70 md:rounded-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirmar Pagamento
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={handlePixSelection}
            disabled={loading}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 p-5 transition-all hover:border-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 md:p-6"
          >
            <QrCode className="w-10 h-10 text-gray-400 group-hover:text-red-600 mb-3 transition-colors" />
            <span className="font-bold text-gray-700 group-hover:text-red-700">PIX</span>
            <span className="text-xs text-gray-500 mt-1">Aprovação Imediata</span>
          </button>

          <button
            onClick={() => handlePayment("credit_card")}
            disabled={loading}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 p-5 transition-all hover:border-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 md:p-6"
          >
            <CreditCard className="w-10 h-10 text-gray-400 group-hover:text-red-600 mb-3 transition-colors" />
            <span className="font-bold text-gray-700 group-hover:text-red-700">Cartão</span>
            <span className="text-xs text-gray-500 mt-1">Crédito ou Débito</span>
          </button>

          <button
            onClick={() => handlePayment("cash")}
            disabled={loading}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 p-5 transition-all hover:border-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 md:p-6 sm:col-span-2"
          >
            <Banknote className="w-10 h-10 text-gray-400 group-hover:text-red-600 mb-3 transition-colors" />
            <span className="font-bold text-gray-700 group-hover:text-red-700">Dinheiro</span>
            <span className="text-xs text-gray-500 mt-1">Pagamento no Caixa</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mb-4"></div>
          <p>Processando pagamento...</p>
        </div>
      )}
    </div>
  );
}
