"use client";

import { useMemo, useRef } from "react";
import { Download, Printer, X } from "lucide-react";
import html2pdf from "html2pdf.js";

import { SITE_CONFIG } from "@/lib/config";
import type { ControleReceiptData } from "@/lib/controle/types";

interface WithdrawalReceiptModalProps {
  receipt: ControleReceiptData | null;
  onClose: () => void;
}

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function WithdrawalReceiptModal({
  receipt,
  onClose,
}: WithdrawalReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement | null>(null);

  const fileName = useMemo(() => {
    if (!receipt) return "recibo-retirada.pdf";
    const os = receipt.withdrawal.os_number.replace(/[^a-zA-Z0-9-_]/g, "-");
    return `retirada-peca-${os}.pdf`;
  }, [receipt]);

  if (!receipt) return null;

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;

    await html2pdf()
      .from(receiptRef.current)
      .set({
        margin: 8,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:block print:bg-white">
      <style jsx global>{`
        @media print {
          body > * {
            display: none !important;
          }

          #controle-receipt-root {
            display: block !important;
            position: absolute;
            inset: 0;
            width: 100%;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>

      <div
        id="controle-receipt-root"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl print:max-w-none print:rounded-none print:shadow-none"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 print:hidden">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recibo de retirada de peca
            </h2>
            <p className="text-sm text-gray-500">
              Gere o PDF ou imprima para assinatura.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div ref={receiptRef} className="bg-white p-8 text-sm text-gray-900">
          <div className="border-b border-dashed border-gray-300 pb-5 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {SITE_CONFIG.companyName}
            </h1>
            <p>{SITE_CONFIG.address}</p>
            <p>{SITE_CONFIG.phone.display}</p>
            <p>CNPJ: {SITE_CONFIG.cnpj}</p>
            <p className="mt-2 text-base font-semibold uppercase">
              Recibo de retirada de peca do estoque
            </p>
          </div>

          <div className="grid gap-6 py-6 md:grid-cols-2">
            <section className="space-y-2 rounded-xl border border-gray-200 p-4">
              <h3 className="text-base font-semibold">Dados da retirada</h3>
              <p>
                <strong>Recibo:</strong> #{receipt.withdrawal.id.slice(0, 8)}
              </p>
              <p>
                <strong>Data:</strong> {formatDate(receipt.withdrawal.created_at)}
              </p>
              <p>
                <strong>Cliente:</strong> {receipt.withdrawal.customer_name}
              </p>
              <p>
                <strong>O.S:</strong> {receipt.withdrawal.os_number}
              </p>
              <p>
                <strong>Tecnico:</strong> {receipt.withdrawal.technician_name}
              </p>
              <p>
                <strong>Autorizacao:</strong> {receipt.withdrawal.authorization_code}
              </p>
              <p>
                <strong>Valor da venda:</strong>{" "}
                {formatCurrency(receipt.withdrawal.sale_price)}
              </p>
            </section>

            <section className="space-y-2 rounded-xl border border-gray-200 p-4">
              <h3 className="text-base font-semibold">Dados da peca</h3>
              <p>
                <strong>Nome:</strong> {receipt.withdrawal.part_snapshot_name}
              </p>
              <p>
                <strong>Tipo:</strong> {receipt.withdrawal.part_snapshot_type}
              </p>
              <p>
                <strong>Numero de serie:</strong>{" "}
                {receipt.withdrawal.part_snapshot_serial}
              </p>
              <p>
                <strong>Pedido de compra:</strong>{" "}
                {receipt.withdrawal.purchase_order_reference}
              </p>
              <p>
                <strong>Status do estoque:</strong> retirada aprovada
              </p>
            </section>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 text-base font-semibold">Declaracao</h3>
            <p className="leading-7 text-gray-700">
              Confirmo a retirada da peca acima identificada para uso na ordem de
              servico informada, com autorizacao administrativa validada no momento
              da liberacao.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="border-t border-gray-400 pt-2 text-center text-sm">
              Assinatura do tecnico solicitante
            </div>
            <div className="border-t border-gray-400 pt-2 text-center text-sm">
              Assinatura da administracao
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 print:hidden">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Download size={18} />
            Baixar PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E60012] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
