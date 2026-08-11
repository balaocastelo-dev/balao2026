import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">404</h2>
      <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-[#E60012] text-white rounded-md font-bold hover:bg-red-700 transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
