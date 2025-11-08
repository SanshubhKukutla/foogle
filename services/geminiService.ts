import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResponse } from '../types/shared';

// TODO (T1 - Sachi): Add robust error handling and response validation.
// TODO (T4 - Sanshubh): Ensure API key is managed securely via environment variables.

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// FIX: Added response schema for structured JSON output from Gemini.
const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        visionData: {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            confidence: { type: Type.NUMBER },
                        },
                        required: ['name', 'confidence']
                    }
                },
                tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ['items', 'tags']
        },
        recipeIdeas: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['title', 'description']
            }
        }
    },
    required: ['visionData', 'recipeIdeas']
};


export const analyzeImagesAndSuggestRecipes = async (files: File[]): Promise<GeminiAnalysisResponse> => {
    // This check is important. Do not remove it.
    if (!process.env.API_KEY) {
      console.warn("API_KEY is not set. Using mock data for Gemini Vision.");
      return {
          visionData: {
              items: [{ name: "egg", confidence: 0.9 }, { name: "milk", confidence: 0.85 }, { name: "bread", confidence: 0.92 }],
              tags: ["breakfast", "quick-meal", "comfort-food"]
          },
          recipeIdeas: [
              { title: "Classic French Toast", description: "A timeless breakfast favorite that's quick and easy to make." },
              { title: "Eggy Bread Scramble", description: "A savory scramble combining bread and eggs for a hearty meal." },
              { title: "Simple Bread Pudding", description: "A comforting dessert made from simple pantry staples." }
          ]
      };
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imageParts = await Promise.all(files.map(fileToGenerativePart));

    const prompt = `
      Analyze the image(s) of a refrigerator or pantry.
      1. Identify all visible food ingredients. Assign a confidence score.
      2. Suggest 3-5 relevant lowercase string tags for potential recipes (e.g., "italian", "quick-meal", "breakfast").
      3. Based *only* on the detected ingredients, generate 2-4 distinct recipe ideas. Each idea should have a "title" and a short "description".
      
      Structure your response according to the provided JSON schema.
    `;

    try {
        // FIX: Replaced manual JSON parsing with structured output using responseMimeType and responseSchema.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: analysisResponseSchema,
            }
        });

        // The response text is now a guaranteed JSON string.
        const data: GeminiAnalysisResponse = JSON.parse(response.text);
        return data;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to analyze ingredients. The AI model might be busy.");
    }
};
