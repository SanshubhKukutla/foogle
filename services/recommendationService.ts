import { VideoRecipe } from '../types/shared';

/**
 * Recommend videos based on ingredient and tag overlap.
 * This is a smarter mock — still client-side but scalable for future vector similarity.
 */
export const getRecommendations = (
  favoriteIds: string[],
  allVideos: VideoRecipe[]
): VideoRecipe[] => {
  if (favoriteIds.length === 0) return [];

  // 1️⃣ Extract all unique ingredients and tags from favorited videos
  const favoriteVideos = allVideos.filter(v => favoriteIds.includes(v._id));

  const favoriteIngredients = new Set<string>();
  const favoriteTags = new Set<string>();

  favoriteVideos.forEach(video => {
    (video.ingredients || []).forEach(i =>
      favoriteIngredients.add(i.name.toLowerCase())
    );
    (video.tags || []).forEach(tag =>
      favoriteTags.add(tag.toLowerCase())
    );
  });

  // 2️⃣ Score all other videos by ingredient + tag overlap
  const scoredVideos = allVideos
    .filter(v => !favoriteIds.includes(v._id))
    .map(video => {
      const videoIngredients = new Set(
        (video.ingredients || []).map(i => i.name.toLowerCase())
      );
      const videoTags = new Set((video.tags || []).map(t => t.toLowerCase()));

      let ingredientMatches = 0;
      videoIngredients.forEach(i => {
        if (favoriteIngredients.has(i)) ingredientMatches++;
      });

      let tagMatches = 0;
      videoTags.forEach(t => {
        if (favoriteTags.has(t)) tagMatches++;
      });

      const ingredientScore =
        videoIngredients.size > 0
          ? ingredientMatches / videoIngredients.size
          : 0;
      const tagScore =
        videoTags.size > 0 ? tagMatches / videoTags.size : 0;

      const finalScore = ingredientScore * 0.7 + tagScore * 0.3; // weighted blend
      return { video, score: finalScore };
    })
    .filter(item => item.score > 0);

  // 3️⃣ Sort by score and return top 10
  scoredVideos.sort((a, b) => b.score - a.score);
  return scoredVideos.map(item => item.video).slice(0, 10);
};
