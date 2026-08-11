"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, LoaderCircle, LockKeyhole, TimerReset } from "lucide-react";

import { useToast } from "@/context/ToastContext";

type DynamicPasswordResponse = {
  code: string;
  remainingSeconds: number;
  validUntil: string;
};

export default function ControleSenhaClient() {
  const { showToast } = useToast();
  const [dailyPassword, setDailyPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const loadDynamicPassword = useCallback(async (passwordOverride?: string) => {
    const password = (passwordOverride ?? dailyPassword).trim();

    if (!password) return;

    setLoading(true);

    try {
      const response = await fetch("/api/controle/dynamic-password", {
        headers: {
          "x-controle-password": password,
        },
        cache: "no-store",
      });
      const data = (await response.json()) as DynamicPasswordResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data?.error || "Senha diaria invalida.");
      }

      setAuthorized(true);
      setCode(data.code);
      setRemainingSeconds(data.remainingSeconds);
    } catch (error) {
      setAuthorized(false);
      setCode("");
      setRemainingSeconds(0);
      const message =
        error instanceof Error ? error.message : "Nao foi possivel gerar a senha.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [dailyPassword, showToast]);

  useEffect(() => {
    if (!authorized) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          void loadDynamicPassword();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [authorized, loadDynamicPassword]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadDynamicPassword(dailyPassword);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="rounded-3xl bg-gradient-to-r from-[#111827] to-[#E60012] p-8 text-white">
          <div className="flex items-center gap-3">
            <KeyRound size={24} />
            <div>
              <h1 className="text-3xl font-bold">Senha dinamica da retirada</h1>
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                Esta pagina exige a senha diaria e gera um codigo novo a cada 60
                segundos para aprovar a impressao do documento de retirada.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <LockKeyhole className="text-[#E60012]" size={20} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Validacao diaria
                </h2>
                <p className="text-sm text-gray-500">
                  Digite `56676009 + dia + mes + ano`.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input
                type="password"
                required
                value={dailyPassword}
                onChange={(event) => setDailyPassword(event.target.value)}
                placeholder="Senha diaria"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E60012]"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E60012] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Validando...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Ver senha dinamica
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center gap-3">
              <TimerReset className="text-[#E60012]" size={20} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Codigo atual
                </h2>
                <p className="text-sm text-gray-500">
                  Deve ser digitado na tela de retirada da peca.
                </p>
              </div>
            </div>

            {authorized ? (
              <div className="mt-6 rounded-3xl border border-red-100 bg-white p-6 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E60012]">
                  Senha dinamica
                </p>
                <p className="mt-4 text-5xl font-bold tracking-[0.2em] text-gray-900">
                  {code}
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Expira em {remainingSeconds}s
                </p>
                <button
                  type="button"
                  onClick={() => loadDynamicPassword()}
                  className="mt-5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Atualizar agora
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                A senha dinamica aparece aqui depois da validacao diaria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
