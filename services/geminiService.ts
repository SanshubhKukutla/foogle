import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResponse } from "../types/shared";

// Converts uploaded File objects into Base64 parts for Gemini input
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// ✅ Full structured schema for detailed recipe generation
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
            required: ["name", "confidence"],
          },
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["items", "tags"],
    },
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
              },
              required: ["name", "quantity"],
            },
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          cookTime: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "title",
          "description",
          "ingredients",
          "steps",
          "cookTime",
          "difficulty",
          "tags",
        ],
      },
    },
  },
  required: ["visionData", "recipes"],
};

// 🧠 Main function: analyze image + generate complete recipes
export const analyzeImagesAndSuggestRecipes = async (
  files: File[]
): Promise<GeminiAnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = `
    You are a culinary assistant analyzing photos of a refrigerator or pantry.

    TASKS:
    1. Identify visible food ingredients from the image(s) and estimate confidence for each.
    2. Suggest 3–4 relevant tags that describe potential recipe categories (e.g. "italian", "breakfast", "quick-meal").
    3. Based *only* on the detected ingredients, generate 3–4 distinct and realistic full recipes.

    Each recipe must include:
    - title
    - description (1–2 sentences)
    - ingredients: each with name and approximate quantity
    - steps: numbered or ordered list of clear instructions
    - cookTime (e.g. "25 minutes")
    - difficulty ("easy" | "medium" | "hard")
    - tags (keywords related to the recipe)

    Structure your response as valid JSON matching the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
      },
    });

    const data: GeminiAnalysisResponse = JSON.parse(response.text);
    console.log("✅ Full recipes generated:", data);
    return data;
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to analyze ingredients and generate recipes.");
  }
};
