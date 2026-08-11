"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { CheckCircle, XCircle } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  if (!email) {
    return <p className="text-center text-gray-500">Link inválido. Nenhum e-mail especificado.</p>;
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Descadastro Confirmado</h2>
        <p className="text-gray-600">O e-mail <strong>{email}</strong> foi removido da nossa lista.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmar Descadastro</h2>
      <p className="text-gray-600 mb-8">
        Deseja parar de receber e-mails de marketing para <strong>{email}</strong>?
      </p>
      <button
        onClick={handleUnsubscribe}
        disabled={status === 'loading'}
        className="bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Processando...' : 'Sim, quero me descadastrar'}
      </button>
      {status === 'error' && (
        <p className="text-red-500 mt-4 flex items-center justify-center gap-2">
          <XCircle size={16} /> Erro ao processar. Tente novamente.
        </p>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-md">
        <Suspense fallback={<p className="text-center">Carregando...</p>}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </div>
  );
}
