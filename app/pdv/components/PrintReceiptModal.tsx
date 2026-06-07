'use client';

import { Download, Printer, Send, X } from 'lucide-react';
import html2canvas from 'html2canvas';

import { SITE_CONFIG } from '@/lib/config';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email?: string;
  customer_whatsapp?: string;
  total: number;
  payment_method: string;
  items: OrderItem[];
  origin?: string;
}

interface PrintReceiptModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export default function PrintReceiptModal({ order, onClose }: PrintReceiptModalProps) {
  if (!order) return null;

  const normalizeWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length > 11) {
      return digits.slice(2);
    }
    return digits;
  };

  const normalizedWhatsApp = normalizeWhatsApp(order.customer_whatsapp || '');

  const buildWhatsAppMessage = () => {
    const itemsSummary = order.items
      .map((item) => `- ${item.product_name} x${item.quantity} (${formatCurrency(item.price * item.quantity)})`)
      .join('\n');

    return [
      `Ola, ${order.customer_name || 'cliente'}!`,
      '',
      `Segue seu comprovante da venda ${order.id.slice(0, 8)} da ${SITE_CONFIG.companyName}.`,
      `Data: ${formatDate(order.created_at)}`,
      `Pagamento: ${order.payment_method?.replace('_', ' ').toUpperCase()}`,
      '',
      'Itens:',
      itemsSummary,
      '',
      `Total: ${formatCurrency(order.total)}`,
      '',
      `Loja: ${SITE_CONFIG.companyName}`,
      `Site: www.balao.info`,
    ].join('\n');
  };

  const handleSendWhatsApp = () => {
    if (!normalizedWhatsApp) {
      alert('Cadastre o WhatsApp do cliente para enviar o comprovante.');
      return;
    }

    const url = `https://wa.me/55${normalizedWhatsApp}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Mantendo a resolução alta
        backgroundColor: '#ffffff',
        logging: true, // Habilitar logs para debug
        useCORS: true, // Permitir carregar imagens externas se houver
        allowTaint: true, // Permitir taint se necessário
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `recibo-${order.id.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Error generating receipt image:', error);
      alert(`Erro ao gerar imagem do recibo: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:p-0 print:bg-white print:absolute print:inset-0 print:z-[9999]">
      <style jsx global>{`
        @media print {
          body > * { display: none !important; }
          #print-modal-root { display: block !important; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
          @page { margin: 0; size: auto; }
        }
      `}</style>
      <div id="print-modal-root" className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:max-h-none print:h-auto print:overflow-visible print:rounded-none">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between p-4 border-b print:hidden">
          <h2 className="text-lg font-bold text-gray-800">Comprovante de Venda</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Receipt Content */}
        <div 
          id="receipt-content" 
          className="p-6 space-y-4 text-sm font-mono print:p-0"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          <div 
            className="text-center border-b pb-4 border-dashed"
            style={{ borderColor: '#d1d5db' }}
          >
            <h1 className="text-xl font-bold uppercase mb-1">{SITE_CONFIG.companyName}</h1>
            <p style={{ color: '#4b5563' }}>CNPJ: {SITE_CONFIG.cnpj}</p>
            <p style={{ color: '#4b5563' }}>{SITE_CONFIG.address}</p>
            <p style={{ color: '#4b5563' }}>{SITE_CONFIG.phone.display}</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-bold">Pedido:</span>
              <span>#{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Data:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Cliente:</span>
              <span>{order.customer_name}</span>
            </div>
            {order.customer_whatsapp && (
              <div className="flex justify-between">
                <span className="font-bold">Tel:</span>
                <span>{order.customer_whatsapp}</span>
              </div>
            )}
          </div>

          <div 
            className="border-t border-b border-dashed py-2"
            style={{ borderColor: '#d1d5db' }}
          >
            <div className="grid grid-cols-12 font-bold mb-1 text-xs uppercase">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Qtd</div>
              <div className="col-span-4 text-right">Total</div>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-1 text-xs">
                <div className="col-span-6 truncate pr-1">{item.product_name}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-4 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between font-bold text-base">
              <span>TOTAL</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs" style={{ color: '#6b7280' }}>
              <span>Forma de Pagamento:</span>
              <span className="uppercase">{order.payment_method?.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="text-center pt-4 text-xs" style={{ color: '#6b7280' }}>
            <p>Obrigado pela preferência!</p>
            <p>www.balao.info</p>
          </div>
        </div>

        {/* Footer - Hidden on Print */}
        <div className="flex flex-col gap-2 border-t bg-gray-50 p-4 print:hidden sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleSendWhatsApp}
            disabled={!normalizedWhatsApp}
            className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={18} />
            Enviar no WhatsApp
          </button>
          <button
            onClick={handleDownloadImage}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Salvar Imagem
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
