import { VideoRecipe } from '../types/shared';

// TODO (T4 - Sanshubh): Implement a real recommendation engine.
// This could use cosine similarity on ingredient/tag vectors.
// For now, this is an improved mock that prioritizes ingredient overlap.

export const getRecommendations = (favoriteIds: string[], allVideos: VideoRecipe[]): VideoRecipe[] => {
  if (favoriteIds.length === 0) return [];

  // 1. Get all unique ingredients from the user's favorited videos.
  const favoriteVideos = allVideos.filter(v => favoriteIds.includes(v._id));
  const favoriteIngredients = new Set<string>();
  favoriteVideos.forEach(video => {
    video.ingredients.forEach(ingredient => {
      favoriteIngredients.add(ingredient.name.toLowerCase());
    });
  });

  if (favoriteIngredients.size === 0) {
    // If favorites have no ingredients, return some non-favorited videos
    return allVideos.filter(v => !favoriteIds.includes(v._id)).slice(0, 6);
  }

  // 2. Score all other videos based on ingredient overlap.
  const scoredVideos = allVideos
    .filter(v => !favoriteIds.includes(v._id)) // Exclude already favorited videos
    .map(video => {
      let matchCount = 0;
      const videoIngredients = new Set(video.ingredients.map(i => i.name.toLowerCase()));
      
      videoIngredients.forEach(ingredient => {
        if (favoriteIngredients.has(ingredient)) {
          matchCount++;
        }
      });
      
      // Score is the ratio of matching ingredients to the video's total ingredients.
      // This prioritizes videos where the user has a higher percentage of the required items.
      const score = video.ingredients.length > 0 ? matchCount / video.ingredients.length : 0;
      
      return { video, score };
    })
    .filter(item => item.score > 0); // Only recommend videos with at least one matching ingredient

  // 3. Sort videos by score (descending).
  scoredVideos.sort((a, b) => b.score - a.score);

  // 4. Return the video objects from the sorted list.
  const recommended = scoredVideos.map(item => item.video);

  // If no recommendations with overlapping ingredients, fall back to something else.
  if (recommended.length === 0) {
      // Fallback: recommend videos with shared tags as a secondary measure.
      const favoriteTags = new Set<string>();
      favoriteVideos.forEach(v => v.signature.split('|')[1]?.split(',').forEach(tag => favoriteTags.add(tag)));
      
      if (favoriteTags.size > 0) {
          return allVideos.filter(v => {
              if (favoriteIds.includes(v._id)) return false;
              const videoTags = v.signature.split('|')[1]?.split(',') || [];
              return videoTags.some(tag => favoriteTags.has(tag));
          }).slice(0, 6);
      }
  }

  return recommended.slice(0, 10); // Return up to 10 recommendations
};
