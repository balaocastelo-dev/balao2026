"use client";

import { useState } from "react";
import { Upload, CheckCircle, XCircle } from "lucide-react";

export default function TestMigrationPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    if (!imageUrl) return alert("Insira uma URL");
    
    setLoading(true);
    setLog(prev => [`🚀 Iniciando teste para: ${imageUrl}`, ...prev]);

    try {
      // 1. Create a dummy product
      const dummyId = "test-" + Date.now();
      setLog(prev => [`Creating dummy product ${dummyId}...`, ...prev]);
      
      // We can't easily create a dummy product via client without auth, 
      // so we will simulate by calling the migration API with a non-existent ID 
      // but that won't work because API fetches product from DB.
      
      // So we need to CREATE a product first.
      const resCreate = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              id: dummyId,
              name: "Test Migration Product",
              price: "R$ 1,00",
              image: imageUrl,
              category: "Test"
          })
      });

      if (!resCreate.ok) throw new Error("Falha ao criar produto de teste");
      setLog(prev => [`✅ Produto de teste criado. ID: ${dummyId}`, ...prev]);

      // 2. Run Migration
      setLog(prev => [`Running migration API...`, ...prev]);
      const resMigrate = await fetch("/api/products/migrate-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [dummyId] })
      });

      const data = await resMigrate.json();
      setLog(prev => [`API Response: ${JSON.stringify(data)}`, ...prev]);

      if (data.results && data.results[0].status === 'success') {
          setLog(prev => [`✅ Migração bem sucedida! Nova URL: ${data.results[0].newUrl}`, ...prev]);
          
          // Verify Rollback/Original
          const resCheck = await fetch(`/api/products/${dummyId}`);
          const product = await resCheck.json();
          if (product.original_image === imageUrl) {
               setLog(prev => [`✅ Backup do link original verificado com sucesso.`, ...prev]);
          } else {
               setLog(prev => [`❌ Backup falhou ou não confere.`, ...prev]);
          }

          // Cleanup
          await fetch(`/api/products/${dummyId}`, { method: "DELETE" });
          setLog(prev => [`🧹 Produto de teste removido.`, ...prev]);

      } else {
          setLog(prev => [`❌ Migração falhou.`, ...prev]);
      }

    } catch (e: any) {
        setLog(prev => [`❌ Erro fatal: ${e.message}`, ...prev]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Upload className="text-blue-600" />
        Ambiente de Teste de Migração
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <label className="block text-sm font-medium mb-2">URL da Imagem Externa para Teste</label>
        <div className="flex gap-2">
            <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 border rounded-md px-3 py-2"
            />
            <button 
                onClick={runTest}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Testando..." : "Executar Teste"}
            </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
            Isso criará um produto temporário, migrará a imagem, verificará o backup e excluirá o produto.
        </p>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
        {log.map((l, i) => (
            <div key={i} className="mb-1 border-b border-gray-800 pb-1">{l}</div>
        ))}
        {log.length === 0 && <span className="text-gray-600">Logs aparecerão aqui...</span>}
      </div>
    </div>
  );
}
