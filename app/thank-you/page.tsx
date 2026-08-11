
"use client";

import Link from "next/link";
import { CheckCircle, Home, Copy, Check, MessageCircle, CreditCard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { generatePixPayload } from "@/lib/pix";
import Script from "next/script";
import { SITE_CONFIG } from "@/lib/config";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [pixPayload, setPixPayload] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'error'>('pending');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeLibReady, setQrCodeLibReady] = useState(false);
  
  const totalParam = searchParams.get("total");
  const orderId = searchParams.get("orderId");
  const customerName = searchParams.get("name");
  const total = totalParam ? parseFloat(totalParam) : 0;

  // Poll for payment status
  useEffect(() => {
    if (!orderId || paymentStatus === 'paid') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/status?orderId=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paid') {
            setPaymentStatus('paid');
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error("Error polling payment status:", e);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [orderId, paymentStatus]);

  useEffect(() => {
    if (total > 0) {
      const payload = generatePixPayload({
        key: SITE_CONFIG.pix.cnpj, // Use the required CNPJ
        name: SITE_CONFIG.pix.name,
        city: SITE_CONFIG.pix.city,
        amount: total,
        txid: orderId ? orderId.slice(0, 8).toUpperCase() : '***'
      });
      setPixPayload(payload);
    }
  }, [total, orderId]);

  useEffect(() => {
    if (pixPayload && canvasRef.current && (window as any).QRious) {
      new (window as any).QRious({
        element: canvasRef.current,
        value: pixPayload,
        size: 200,
        level: 'H'
      });
    }
  }, [pixPayload, qrCodeLibReady]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full text-center mx-4 md:mx-0">
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js" 
          strategy="afterInteractive"
          onLoad={() => {
            setQrCodeLibReady(true);
          }}
        />

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {paymentStatus === 'paid' ? 'Pagamento Confirmado!' : 'Pedido Realizado!'}
        </h1>
        <p className="text-gray-600 mb-6">
          {paymentStatus === 'paid' 
            ? 'Seu pagamento foi recebido com sucesso. Estamos preparando seu envio!' 
            : 'Obrigado pela sua compra.'}
          {orderId && <span className="block text-sm font-medium mt-1">Pedido #{orderId.slice(0, 8)}</span>}
        </p>

        {/* Pix Payment Section */}
        {pixPayload && paymentStatus !== 'paid' && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 animate-in fade-in duration-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <CreditCard className="text-[#E60012]" size={20} />
              Pagamento via Pix
            </h2>
            
            <div className="mb-4 flex justify-center">
               <div className="border-4 border-white shadow-sm rounded-md p-2 bg-white inline-block">
                 <canvas ref={canvasRef} />
               </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </p>

            <div className="relative">
              <textarea 
                readOnly
                value={pixPayload}
                className="w-full text-xs p-3 bg-white border border-gray-300 rounded-md h-20 resize-none focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-500 break-all"
              />
              <button
                onClick={handleCopy}
                className="absolute bottom-2 right-2 bg-white p-1.5 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Copiar código Pix"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Escaneie o QR Code ou copie o código acima para pagar no seu banco.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <a 
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá, acabei de fazer o pedido #${orderId ? orderId.slice(0, 8) : ''} e gostaria de acompanhar o status.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#25D366] text-white py-3 rounded-md font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Acompanhar pelo WhatsApp
          </a>

          <Link 
            href="/" 
            className="block w-full bg-[#E60012] text-white py-3 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Voltar para a Loja
          </Link>
          
          <Link 
            href="/cart" 
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Ver meu Carrinho
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          Se tiver alguma dúvida, entre em contato conosco pelo WhatsApp.
        </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>}>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ThankYouContent />
      </div>
    </Suspense>
  );
}
