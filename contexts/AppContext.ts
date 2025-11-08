import React from 'react';
import { VideoRecipe } from '../types/shared';

export interface AppContextType {
  videos: VideoRecipe[];
  favorites: string[];
  isRecommendationsUnlocked: boolean;
  isInitializing: boolean;
  addVideo: (video: VideoRecipe) => void;
  toggleFavorite: (videoId: string) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);