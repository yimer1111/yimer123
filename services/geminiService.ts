import { GoogleGenAI, Type } from "@google/genai";
import { RegulatoryCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Image Analysis for Product Entry (Video/Image Understanding)
export const analyzeProductImage = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better OCR and understanding
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analiza esta imagen de un medicamento farmacéutico. Extrae la siguiente información en formato JSON: Nombre comercial, Principio activo, Fecha de vencimiento (YYYY-MM-DD), Lote, Registro Sanitario (INVIMA o equivalente). Si no encuentras algún dato, devuelve null."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            activeIngredient: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            lotNumber: { type: Type.STRING },
            registrationNumber: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing image:", error);
    return null;
  }
};

// 2. Regulatory Chatbot with Search Grounding
export const askRegulatoryAssistant = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }], // Search Grounding enabled
        systemInstruction: "Eres un asistente experto en regulación farmacéutica colombiana (INVIMA, Fondo Nacional de Estupefacientes). Responde preguntas sobre normatividad, precios regulados y requisitos técnicos.",
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error("Error in regulatory assistant:", error);
    throw error;
  }
};

// 3. Deep Financial Analysis with Thinking Mode
export const analyzeFinancialHealth = async (inventoryData: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analiza este inventario farmacéutico y sugiére una estrategia de optimización financiera. Enfócate en productos con baja rotación y alto costo, y valida si los márgenes cumplen la regulación. Datos: ${JSON.stringify(inventoryData.slice(0, 20))}`, // Limit data for context window safety
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Thinking mode enabled
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error in financial analysis:", error);
    return "No se pudo realizar el análisis financiero en este momento.";
  }
};