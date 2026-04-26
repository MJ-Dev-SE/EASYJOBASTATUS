import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  // Check for Vite-prefixed env var first (standard for Vercel/Vite client-side)
  const viteVar = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (viteVar) return viteVar;

  // Fallback to process.env (mapped in vite.config.ts for AI Studio)
  try {
    return process.env.GEMINI_API_KEY;
  } catch {
    return undefined;
  }
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });
