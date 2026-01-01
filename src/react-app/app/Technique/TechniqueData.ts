// HEADER-START
// * Path: ./src/app/Technique/TechniqueData.ts
// HEADER-END

import { GradeWithContent } from '@/hooks/useCatalog';
import { getLevelNumber } from '../../../data/repo/gradeHelpers';
import { TechniqueKind } from '../../../data/model/technique';

// Re-export types from the centralized data model
export { TechniqueKind } from '../../../data/model/technique';
export type { TechniqueRecord } from '../../../data/model/technique';
export type { KataRecord } from '../../../data/model/kata';
export type { GradeRecord } from '../../../data/model/grade';

// Helper type for technique data by level
export type CommonData = {
  levelNumber: number;
  romaji: string;
  japanese?: string;
  english?: string;
  swedish?: string;
  type: TechniqueKind;
};

// Helper type for technique combinations (used in training sessions)
export type TechniqueCombo = {
  id: string;
  name: string;
  techniques: CommonData[]; // Techniques included in this combo
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  notes?: string;
};

// Special technique tags per category
export const specialTechniqueTagsByCategory: Record<string, string[]> = {
  Strike: ['Jodan', 'Chudan', 'Gedan', 'Hidari', 'Migi'],
  Block: ['Uchi', 'Soto', 'Age', 'Gedan', 'Hidari', 'Migi'],
  Kick: ['Mae', 'Yoko', 'Ushiro', 'Gedan', 'Hidari', 'Migi'],
  Stand: ['Kamae', 'Kamaete', 'Sagari', 'Ura'],
};

// Helpers depending on Repository

export const GetTechniqueByType = (
  grades: GradeWithContent[],
): Partial<Record<TechniqueKind, CommonData[]>> => {
  const categories: Partial<Record<TechniqueKind, CommonData[]>> = {
    [TechniqueKind.Stand]: [],
    [TechniqueKind.Strike]: [],
    [TechniqueKind.Block]: [],
    [TechniqueKind.Kick]: [],
    [TechniqueKind.Breathing]: [],
    [TechniqueKind.Fighting]: [],
  };

  grades.forEach((grade) => {
    const levelNumber = getLevelNumber(grade);
    grade.techniques.forEach((tech) => {
      const type = tech.kind;

      // Skip Combination and Other types for categorization
      if (type === TechniqueKind.Combination || type === TechniqueKind.Other) {
        return;
      }

      if (categories[type]) {
        categories[type]!.push({
          levelNumber,
          romaji: tech.name.romaji || '',
          japanese: tech.name.ja || '',
          english: tech.name.en || '',
          swedish: tech.name.sv || '',
          type: type,
        });
      }
    });

    grade.katas.forEach((kata) => {
      // Kata is not a TechniqueKind, but we can create a synthetic entry
      // Note: This maintains backward compatibility but katas should be handled separately
      if (!categories['Kata' as TechniqueKind]) {
        categories['Kata' as TechniqueKind] = [];
      }
      categories['Kata' as TechniqueKind]!.push({
        levelNumber,
        romaji: kata.name.romaji || '',
        japanese: kata.name.ja || '',
        english: kata.name.en || '',
        swedish: kata.name.sv || '',
        type: 'Kata' as TechniqueKind,
      });
    });
  });

  return categories;
};

export function FindGradeByTechniqueId(
  grades: GradeWithContent[],
  id: string,
): GradeWithContent | undefined {
  const grade = grades.find((entry) => entry.techniques.some((tech) => tech.id === id));
  if (grade) return grade;

  return grades[0];
}
