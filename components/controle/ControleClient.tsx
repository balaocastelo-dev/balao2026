"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileCheck2, KeyRound, LoaderCircle, PackageCheck, Shield } from "lucide-react";

import WithdrawalReceiptModal from "@/components/controle/WithdrawalReceiptModal";
import { useToast } from "@/context/ToastContext";
import {
  PART_TYPES,
  PART_TYPE_LABELS,
  type ControlePart,
  type ControleReceiptData,
} from "@/lib/controle/types";

type WithdrawalFormState = {
  customerName: string;
  osNumber: string;
  salePrice: string;
  technicianName: string;
  authorizationCode: string;
  approvalPassword: string;
};

const INITIAL_FORM: WithdrawalFormState = {
  customerName: "",
  osNumber: "",
  salePrice: "",
  technicianName: "",
  authorizationCode: "",
  approvalPassword: "",
};

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

export default function ControleClient() {
  const { showToast } = useToast();
  const [parts, setParts] = useState<ControlePart[]>([]);
  const [selectedPart, setSelectedPart] = useState<ControlePart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<WithdrawalFormState>(INITIAL_FORM);
  const [receipt, setReceipt] = useState<ControleReceiptData | null>(null);

  const groupedParts = useMemo(
    () =>
      PART_TYPES.map((type) => ({
        type,
        label: PART_TYPE_LABELS[type],
        items: parts.filter((part) => part.type === type),
      })).filter((group) => group.items.length > 0),
    [parts],
  );

  const loadParts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/controle/parts", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel carregar as pecas.");
      }

      setParts(data.parts || []);
      setSelectedPart((current) =>
        current ? (data.parts || []).find((part: ControlePart) => part.id === current.id) ?? null : null,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar pecas.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadParts();
  }, [loadParts]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPart) {
      showToast("Selecione uma peca antes de continuar.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/controle/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partId: selectedPart.id,
          customerName: form.customerName,
          osNumber: form.osNumber,
          salePrice: Number(form.salePrice),
          technicianName: form.technicianName,
          authorizationCode: form.authorizationCode,
          approvalPassword: form.approvalPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel gerar o recibo.");
      }

      setReceipt(data.receipt as ControleReceiptData);
      setForm(INITIAL_FORM);
      showToast("Retirada aprovada e recibo gerado com sucesso.");
      await loadParts();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao concluir retirada.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-[#1f2937] via-[#111827] to-[#E60012] p-8 text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
          <PackageCheck size={16} />
          Controle de pecas da assistencia tecnica
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          Estoque organizado por tipo com retirada autorizada
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/80 sm:text-base">
          Em `www.balao.info/controle` o tecnico seleciona a peca, preenche os
          dados de uso e somente gera o recibo quando a senha dinamica de
          aprovacao for informada.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Pecas disponiveis
              </h2>
              <p className="text-sm text-gray-500">
                Selecione abaixo a peca que sera utilizada na ordem de servico.
              </p>
            </div>
            <button
              type="button"
              onClick={loadParts}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center text-gray-500">
              <LoaderCircle className="mr-2 animate-spin" size={18} />
              Carregando pecas...
            </div>
          ) : groupedParts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              Nenhuma peca disponivel no momento.
            </div>
          ) : (
            <div className="space-y-8">
              {groupedParts.map((group) => (
                <div key={group.type} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.label}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {group.items.length} item(ns)
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((part) => {
                      const isSelected = selectedPart?.id === part.id;

                      return (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => setSelectedPart(part)}
                          className={`overflow-hidden rounded-2xl border text-left transition ${
                            isSelected
                              ? "border-[#E60012] ring-2 ring-red-100"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="aspect-[4/3] bg-gray-100">
                            {part.photo_url ? (
                              <Image
                                src={part.photo_url}
                                alt={part.full_name}
                                width={640}
                                height={480}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                Sem foto
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {part.full_name}
                              </h4>
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                Disponivel
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Serie: {part.serial_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              Pedido: {part.purchase_order_reference}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Shield className="text-[#E60012]" size={22} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Retirada de peca
                </h2>
                <p className="text-sm text-gray-500">
                  O recibo so sera gerado com a senha dinamica de aprovacao.
                </p>
              </div>
            </div>

            {selectedPart ? (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#E60012]">
                  Peca selecionada
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900">
                  {selectedPart.full_name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Serie: {selectedPart.serial_number}
                </p>
                <p className="text-sm text-gray-600">
                  Pedido: {selectedPart.purchase_order_reference}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                Escolha uma peca na lista para preencher a retirada.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input
                required
                value={form.customerName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerName: event.target.value,
                  }))
                }
                placeholder="Cliente"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
              />
              <input
                required
                value={form.osNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    osNumber: event.target.value,
                  }))
                }
                placeholder="Numero da O.S"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    salePrice: event.target.value,
                  }))
                }
                placeholder="Valor da venda"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
              />
              <input
                required
                value={form.technicianName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    technicianName: event.target.value,
                  }))
                }
                placeholder="Tecnico solicitante"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
              />
              <input
                required
                value={form.authorizationCode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    authorizationCode: event.target.value,
                  }))
                }
                placeholder="Codigo de autorizacao"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
              />
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <KeyRound size={16} />
                  Senha dinamica obrigatoria
                </div>
                <p className="mt-1 text-sm text-amber-800">
                  A senha para aprovar a retirada deve ser consultada em
                  `www.balao.info/controle/senha` e dura apenas 1 minuto.
                </p>
                <input
                  required
                  value={form.approvalPassword}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      approvalPassword: event.target.value,
                    }))
                  }
                  placeholder="Senha dinamica de aprovacao"
                  className="mt-3 w-full rounded-xl border border-amber-300 bg-white px-4 py-3 outline-none transition focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedPart}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E60012] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Validando e gerando recibo...
                  </>
                ) : (
                  <>
                    <FileCheck2 size={18} />
                    Aprovar retirada e gerar recibo
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Regras do fluxo
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>1. O tecnico escolhe a peca disponivel.</li>
              <li>2. Informa cliente, O.S, valor, tecnico e codigo de autorizacao.</li>
              <li>3. A administracao consulta a senha em `/controle/senha`.</li>
              <li>4. O sistema libera o PDF e remove a peca do estoque disponivel.</li>
            </ul>
          </div>

          {selectedPart && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Resumo rapido
              </h3>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Tipo:</strong> {PART_TYPE_LABELS[selectedPart.type]}
                </p>
                <p>
                  <strong>Serie:</strong> {selectedPart.serial_number}
                </p>
                <p>
                  <strong>Pedido:</strong> {selectedPart.purchase_order_reference}
                </p>
                <p>
                  <strong>Status:</strong> disponivel para retirada
                </p>
                <p>
                  <strong>Valor de referencia:</strong>{" "}
                  {formatCurrency(selectedPart.withdrawn_sale_price)}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <WithdrawalReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
