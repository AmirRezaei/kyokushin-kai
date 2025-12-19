// file: src/data/repo/techniqueHelpers.ts

import { TechniqueRecord } from '../model/technique';

/**
 * Get individual words from a technique's romaji name
 * Used for word puzzle games
 */
export function getTechniqueWords(technique: TechniqueRecord): string[] {
  return (technique.name.romaji || '').split(' ').filter(Boolean);
}

/**
 * Get the correct order of words for a technique
 * This is the same as getTechniqueWords but provides semantic clarity
 */
export function getTechniqueCorrectOrder(technique: TechniqueRecord): string[] {
  return getTechniqueWords(technique);
}

/**
 * Check if a given word order matches the technique's correct order
 */
export function isCorrectTechniqueOrder(technique: TechniqueRecord, wordOrder: string[]): boolean {
  const correctOrder = getTechniqueCorrectOrder(technique);
  if (wordOrder.length !== correctOrder.length) return false;
  return wordOrder.every((word, index) => word === correctOrder[index]);
}
