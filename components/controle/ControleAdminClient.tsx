"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  PackagePlus,
  RefreshCw,
} from "lucide-react";

import { useToast } from "@/context/ToastContext";
import {
  PART_TYPES,
  PART_TYPE_LABELS,
  type ControlePart,
  type PartType,
} from "@/lib/controle/types";

type PartFormState = {
  type: PartType;
  fullName: string;
  serialNumber: string;
  purchaseOrderReference: string;
  notes: string;
};

const INITIAL_FORM: PartFormState = {
  type: "processador",
  fullName: "",
  serialNumber: "",
  purchaseOrderReference: "",
  notes: "",
};

export default function ControleAdminClient() {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [parts, setParts] = useState<ControlePart[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState<PartFormState>(INITIAL_FORM);

  const stats = useMemo(() => {
    const available = parts.filter((part) => part.status === "disponivel").length;
    const withdrawn = parts.filter((part) => part.status === "retirada").length;

    return {
      total: parts.length,
      available,
      withdrawn,
    };
  }, [parts]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/controle/admin-session", {
          cache: "no-store",
        });
        const data = await response.json();
        setAuthenticated(Boolean(data?.authenticated));
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const loadParts = useCallback(async () => {
    setLoadingParts(true);

    try {
      const response = await fetch("/api/controle/parts?scope=admin", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel carregar as pecas.");
      }

      setParts(data.parts || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar pecas.";
      showToast(message, "error");
    } finally {
      setLoadingParts(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authenticated) {
      void loadParts();
    }
  }, [authenticated, loadParts]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);

    try {
      const response = await fetch("/api/controle/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Senha invalida.");
      }

      setAuthenticated(true);
      setPassword("");
      showToast("Acesso administrativo liberado.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao autenticar.";
      showToast(message, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/controle/admin-logout", { method: "POST" });
    setAuthenticated(false);
    setParts([]);
    showToast("Sessao encerrada.", "info");
  };

  const handleCreatePart = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!photoFile) {
      showToast("Selecione a foto da peca antes de salvar.", "error");
      return;
    }

    setSaving(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", photoFile);
      uploadData.append("bucket", "controle-parts");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploadJson = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadJson?.url) {
        throw new Error(uploadJson?.error || "Falha ao enviar a foto.");
      }

      const response = await fetch("/api/controle/parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          photoUrl: uploadJson.url,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel cadastrar a peca.");
      }

      setForm(INITIAL_FORM);
      setPhotoFile(null);
      setPreviewUrl("");
      showToast("Peca cadastrada com sucesso.");
      await loadParts();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao salvar peca.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <LoaderCircle className="mr-2 animate-spin" size={18} />
        Verificando acesso administrativo...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-4 py-10">
        <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <LockKeyhole className="text-[#E60012]" size={24} />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Controle Admin
              </h1>
              <p className="text-sm text-gray-500">
                Acesse com a senha diaria `56676009 + dia + mes + ano`.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha administrativa"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
            />
            <button
              type="submit"
              disabled={loginLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E60012] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  Entrando...
                </>
              ) : (
                <>
                  <LockKeyhole size={18} />
                  Entrar no admin
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-[#111827] to-[#E60012] p-8 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel administrativo do controle</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/80 sm:text-base">
              Cadastre pecas com foto, numero de serie, nome completo e pedido de
              compra relacionado.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total cadastrado</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Disponiveis</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">
            {stats.available}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Retiradas</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">
            {stats.withdrawn}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <PackagePlus className="text-[#E60012]" size={22} />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Cadastrar peca
              </h2>
              <p className="text-sm text-gray-500">
                Preencha os dados minimos exigidos pelo controle.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreatePart} className="mt-6 space-y-4">
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as PartType,
                }))
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
            >
              {PART_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PART_TYPE_LABELS[type]}
                </option>
              ))}
            </select>

            <input
              required
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              placeholder="Nome completo da peca"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
            />

            <input
              required
              value={form.serialNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  serialNumber: event.target.value,
                }))
              }
              placeholder="Numero de serie"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
            />

            <input
              required
              value={form.purchaseOrderReference}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  purchaseOrderReference: event.target.value,
                }))
              }
              placeholder="Pedido de compra relacionado"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
            />

            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Observacoes opcionais"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
            />

            <label className="block rounded-2xl border border-dashed border-gray-300 p-4">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <ImagePlus size={18} />
                Foto obrigatoria da peca
              </div>
              <input
                required
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setPhotoFile(file);
                  setPreviewUrl(file ? URL.createObjectURL(file) : "");
                }}
                className="mt-3 block w-full text-sm text-gray-600"
              />
            </label>

            {previewUrl && (
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div
                  className="h-56 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${previewUrl}")` }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E60012] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  Salvando peca...
                </>
              ) : (
                <>
                  <PackagePlus size={18} />
                  Cadastrar peca
                </>
              )}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Pecas cadastradas
              </h2>
              <p className="text-sm text-gray-500">
                Visao geral do estoque disponivel e das retiradas.
              </p>
            </div>
            <button
              type="button"
              onClick={loadParts}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Atualizar lista
            </button>
          </div>

          {loadingParts ? (
            <div className="flex min-h-60 items-center justify-center text-gray-500">
              <LoaderCircle className="mr-2 animate-spin" size={18} />
              Carregando estoque...
            </div>
          ) : parts.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
              Nenhuma peca cadastrada ainda.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {parts.map((part) => (
                <article
                  key={part.id}
                  className="overflow-hidden rounded-2xl border border-gray-200"
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
                      <h3 className="text-base font-semibold text-gray-900">
                        {part.full_name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          part.status === "disponivel"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {part.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Tipo: {PART_TYPE_LABELS[part.type]}
                    </p>
                    <p className="text-sm text-gray-500">
                      Serie: {part.serial_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pedido: {part.purchase_order_reference}
                    </p>
                    {part.withdrawn_os_number && (
                      <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                        Retirada para O.S {part.withdrawn_os_number} por{" "}
                        {part.withdrawn_technician_name || "tecnico nao informado"}.
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
