import { generateRecipe } from './recipeService';
import { generateVideo } from './videoService';
import { makeSignature } from '../utils/signature';
import { GeminiAnalysisResponse, VideoRecipe, VisionData, RecipeIdea } from '../types/shared';
import { MOCK_VIDEO_URLS } from '../data/mocks';

// TODO (T4 - Sanshubh): This logic could be moved to a backend seed script.

// This represents the mock output we'd get from Gemini for different sets of initial images.
const initialFridgeAnalyses: GeminiAnalysisResponse[] = [
  {
    visionData: {
      items: [{ name: "pasta", confidence: 0.95 }, { name: "tomato", confidence: 0.9 }, { name: "basil", confidence: 0.88 }, { name: "garlic", confidence: 0.91 }],
      tags: ["dinner", "italian", "quick-meal"]
    },
    recipeIdeas: [
      { title: "Speedy Tomato Basil Pasta", description: "A classic Italian dish ready in under 20 minutes. So simple, so good." },
    ]
  },
  {
    visionData: {
      items: [{ name: "avocado", confidence: 0.98 }, { name: "sourdough bread", confidence: 0.92 }, { name: "egg", confidence: 0.99 }],
      tags: ["breakfast", "healthy", "brunch"]
    },
    recipeIdeas: [
      { title: "Perfect Avocado Toast", description: "Creamy avocado, crunchy toast, and a perfectly runny egg. Name a better trio." },
    ]
  },
  {
    visionData: {
      items: [{ name: "chicken breast", confidence: 0.96 }, { name: "broccoli", confidence: 0.93 }, { name: "soy sauce", confidence: 0.85 }],
      tags: ["dinner", "healthy", "meal-prep", "asian-inspired"]
    },
    recipeIdeas: [
      { title: "Easy Chicken & Broccoli Stir-fry", description: "Your go-to meal prep for a healthy and satisfying week." },
    ]
  },
  {
      visionData: {
          items: [{ name: "thick bread", confidence: 0.9 }, { name: "cinnamon", confidence: 0.8 }, { name: "egg", confidence: 0.95 }, { name: "milk", confidence: 0.92 }],
          tags: ["breakfast", "dessert", "sweet", "quick-meal"]
      },
      recipeIdeas: [
          { title: "Cinnamon French Toast Bites", description: "A fun twist on a classic! Perfect for sharing and dipping." }
      ]
  }
];

/**
 * Simulates the entire generation pipeline for a predefined set of ingredients.
 * @param analysis - A mock GeminiAnalysisResponse object.
 * @returns A promise that resolves to a generated VideoRecipe.
 */
const generateSingleInitialVideo = async (analysis: GeminiAnalysisResponse, videoUrl: string): Promise<VideoRecipe> => {
  const { visionData, recipeIdeas } = analysis;
  
  if (recipeIdeas.length === 0) {
    throw new Error("No recipe ideas provided for initial generation.");
  }
  
  // 1. Create a signature
  const signature = makeSignature(visionData.items.map(i => i.name), visionData.tags);
  const chosenRecipe = recipeIdeas[0];

  // 2. Generate a recipe draft
  const recipeDraft = await generateRecipe(signature, visionData, chosenRecipe);

  // 3. Generate the video from the draft
  const videoRecipe = await generateVideo(recipeDraft);

  // 4. Override with a unique mock URL and slightly randomized metrics
  videoRecipe.videoUrl = videoUrl;
  videoRecipe.metrics = {
      plays: Math.floor(Math.random() * 4000) + 500,
      likes: Math.floor(Math.random() * 1000) + 100,
  }

  return videoRecipe;
};

/**
 * Generates the full initial feed by running the simulation for each predefined fridge analysis.
 * @returns A promise that resolves to an array of VideoRecipes.
 */
export const generateInitialFeed = async (): Promise<VideoRecipe[]> => {
  console.log("Generating initial video feed...");
  
  const generationPromises = initialFridgeAnalyses.map((analysis, index) => 
    generateSingleInitialVideo(analysis, MOCK_VIDEO_URLS[index % MOCK_VIDEO_URLS.length])
  );

  const initialVideos = await Promise.all(generationPromises);
  
  console.log("Initial feed generated successfully.");
  return initialVideos;
};
