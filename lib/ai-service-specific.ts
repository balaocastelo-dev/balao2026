
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface WeeklyAnalysis {
  summary: string;
  positives: string[];
  alerts: string[];
  tips: string[];
}

export async function analyzeWeeklyClosing(data: {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  ordersCount: number;
  paymentMix: Record<string, number>;
  topExpenses: { name: string; value: number }[];
  otherExpenses: { description: string; value: number; category: string }[];
}): Promise<WeeklyAnalysis> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key do Gemini não encontrada");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Atue como um consultor financeiro sênior especializado em assistências técnicas de informática.
    Analise os seguintes dados de fechamento semanal:
    
    - Receita Bruta: R$ ${data.totalRevenue.toFixed(2)}
    - Despesas Totais: R$ ${data.totalExpenses.toFixed(2)}
    - Lucro Líquido: R$ ${data.netProfit.toFixed(2)}
    - Quantidade de OSs: ${data.ordersCount}
    - Mix de Pagamentos: ${JSON.stringify(data.paymentMix)}
    - Principais Custos Diretos (OS): ${JSON.stringify(data.topExpenses)}
    - Despesas Operacionais/Avulsas: ${JSON.stringify(data.otherExpenses)}

    Forneça uma resposta estritamente em formato JSON com a seguinte estrutura:
    {
      "summary": "Um resumo executivo profissional e direto sobre o desempenho da semana.",
      "positives": ["Ponto positivo 1", "Ponto positivo 2", "Ponto positivo 3"],
      "alerts": ["Alerta de margem ou risco 1", "Alerta de margem ou risco 2"],
      "tips": ["Dica prática 1 para aumentar lucro", "Dica prática 2", "Dica prática 3"]
    }
    Não inclua markdown de código (\`\`\`json), apenas o objeto JSON puro.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpeza básica caso venha com markdown
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    throw new Error("Falha ao gerar análise financeira");
  }
}
