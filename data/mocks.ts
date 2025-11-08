import { RecipeDraft, VideoRecipe } from '../types/shared';

// TODO (T2 - Pranav): Create more varied mock data for different recipe types.
// TODO (T4 - Sanshubh): This data can be used in a seed script to populate the database.

export const MOCK_VIDEO_URLS = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
];

export const MOCK_RECIPE_DRAFT: RecipeDraft = {
  _id: 'draft_123',
  signature: 'bread,egg,milk|breakfast,quick-meal',
  title: 'Classic French Toast',
  description: 'A quick and easy recipe for delicious French toast using pantry staples.',
  ingredients: [{ name: '2 slices bread' }, { name: '1 large egg' }, { name: '1/4 cup milk' }],
  steps: [
    'Preheat a lightly oiled griddle or frying pan over medium-high heat.',
    'Whisk the egg and milk together in a shallow dish.',
    'Dip each slice of bread into the egg mixture, ensuring both sides are coated but not soggy.',
    'Place the bread on the hot griddle and cook for 2-3 minutes per side, until golden brown.',
    'Serve immediately with your favorite toppings like syrup, fruit, or powdered sugar.',
  ],
  tags: ['breakfast', 'quick-meal', 'comfort-food'],
  shotPlan: [
    { step: 1, action: 'Close-up shot of eggs and milk being whisked.', durationSec: 4 },
    { step: 2, action: 'Top-down view of bread soaking in the mixture.', durationSec: 3 },
    { step: 3, action: 'Sizzling shot of the toast frying in the pan.', durationSec: 5 },
    { step: 4, action: 'Final "beauty shot" of the plated French toast with syrup being poured.', durationSec: 4 },
  ],
  status: 'ready',
};

export const MOCK_VIDEO_RECIPE: VideoRecipe = {
  _id: 'vid_123',
  signature: 'bread,egg,milk|breakfast,quick-meal',
  draftId: 'draft_123',
  title: '15-Second French Toast',
  description: 'The easiest and most delicious French toast you will ever make. Perfect for a quick breakfast!',
  ingredients: [{ name: '2 slices bread' }, { name: '1 large egg' }, { name: '1/4 cup milk' }, { name: '1 tbsp butter' }],
  steps: [
    'Preheat pan to medium heat and add butter.',
    'Whisk egg and milk in a bowl.',
    'Dip bread slices into the egg mixture.',
    'Fry on the pan for 2-3 minutes per side until golden brown.',
    'Serve with syrup and enjoy!',
  ],
  videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  durationSec: 16,
  metrics: { plays: 1200, likes: 350 },
  createdAt: new Date(),
};
