'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado!</h2>
      <p className="text-gray-600 mb-6">Não foi possível carregar esta página.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-[#E60012] text-white rounded-md hover:bg-[#cc0010] transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
