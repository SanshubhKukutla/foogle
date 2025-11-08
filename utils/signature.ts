
// TODO (T1 - Sachi): Refine the normalization logic. Consider using stemming or lemmatization.
// TODO (T4 - Sanshubh): Potentially replace with a more robust hashing algorithm if collisions are a concern.

/**
 * Creates a stable, unique signature from a list of ingredients and tags.
 * This involves normalizing, sorting, and joining the items.
 * @param items - An array of ingredient names.
 * @param tags - An array of cuisine or recipe tags.
 * @returns A string signature.
 */
export const makeSignature = (items: string[], tags: string[]): string => {
  // Normalize: lowercase and trim whitespace
  const normalizedItems = items.map(item => item.toLowerCase().trim());
  const normalizedTags = tags.map(tag => tag.toLowerCase().trim());

  // Sort to ensure order doesn't matter
  normalizedItems.sort();
  normalizedTags.sort();

  // Join into a single string
  const signature = `${normalizedItems.join(',')}|${normalizedTags.join(',')}`;

  // For this demo, we'll return the string directly.
  // In a production app, you might hash this string (e.g., using SHA-256)
  // to get a fixed-length signature.
  return signature;
};
