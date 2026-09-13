'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const prizes = [
  'R$ 1.000,00 em cartão-presente',
  'Laptop Dell XPS 13',
  'Pacote de 30 dias no Bling',
  'Tablet Samsung Galaxy Tab',
  'Vale-compras no Balão – R$ 500,00',
];

export default function NatalPage() {
  const [winner, setWinner] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);

  const draw = () => {
    const random = prizes[Math.floor(Math.random() * prizes.length)];
    setWinner(random);
    setDrawn(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 text-gray-800 p-4">
      <h1 className="text-5xl font-bold mb-4">🎄 Sorteio de Natal 🎁</h1>
      <p className="text-lg mb-8">
        Clique no botão abaixo para sortear um prêmio incrível e se juntar à celebração!
      </p>
      <button
        onClick={draw}
        disabled={drawn}
        className="px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {drawn ? 'Sorteado' : 'Sortear Prêmio'}
      </button>
      {winner && (
        <div className="mt-8 text-2xl font-medium text-green-700">
          Parabéns! Você ganhou: <span className="font-bold">{winner}</span>
        </div>
      )}
      <div className="mt-12">
        <Link href="/">
          <a className="text-blue-500 hover:underline">← Voltar para a página inicial</a>
        </Link>
      </div>
    </main>
  );
}
