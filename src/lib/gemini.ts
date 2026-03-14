import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getGeminiAI = () => {
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeSpending = async (transactions: any[], ledgerEntries: any[]) => {
  const ai = getGeminiAI();
  const model = "gemini-3-flash-preview";

  const summary = {
    transactions: transactions.map(t => ({ type: t.type, amount: t.amount, category: t.category, date: t.date })),
    debts: ledgerEntries.map(l => ({ type: l.type, amount: l.amount, date: l.date }))
  };

  const prompt = `
    Analyze this accounting data (Income, Expenses, and Debts/Loans).
    Provide 3 actionable financial tips.
    Consider the balance between income and expenses, and the impact of debts.
    Response should be professional, encouraging, and in both English and Bengali.
    Format: JSON array of objects {title, description}.
    
    Data: ${JSON.stringify(summary)}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "[]");
};
