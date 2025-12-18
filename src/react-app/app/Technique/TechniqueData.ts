// HEADER-START
// * Path: ./src/app/Technique/TechniqueData.ts
// HEADER-END

import { KyokushinRepository, GradeWithContent } from '../../../data/repo/KyokushinRepository';
import { getLevelNumber } from '../../../data/repo/gradeHelpers';
// import { TechniqueRecord } from '../../../data/model/technique'; // Unused
// import { GradeRecord } from '../../../data/model/grade'; // Unused

// Re-export from TechniqueModel
export * from './TechniqueModel';
import { TechniqueTypeEnum, CommonData } from './TechniqueModel';

// Helpers depending on Repository

export const GetTechniqueByType = (): Record<TechniqueTypeEnum, CommonData[]> => {
   const categories: Record<TechniqueTypeEnum, CommonData[]> = {
      [TechniqueTypeEnum.Stand]: [],
      [TechniqueTypeEnum.Strike]: [],
      [TechniqueTypeEnum.Block]: [],
      [TechniqueTypeEnum.Kick]: [],
      [TechniqueTypeEnum.Kata]: [],
      [TechniqueTypeEnum.Breathing]: [],
      [TechniqueTypeEnum.Fighting]: [],
      [TechniqueTypeEnum.ThreeStepFight]: [],
   };

   const grades = KyokushinRepository.getCurriculumGrades();

   grades.forEach((grade) => {
        const levelNumber = getLevelNumber(grade);
        grade.techniques.forEach((tech) => {
            const type = tech.kind as unknown as TechniqueTypeEnum; // Mapping
            
            // Map 'Combination' or others if necessary, otherwise skip or default
            if (!Object.values(TechniqueTypeEnum).includes(type)) {
               return; 
            }

            if (categories[type]) {
                 categories[type].push({
                    levelNumber,
                    romaji: tech.name.romaji || '',
                    japanese: tech.name.ja || '', 
                    english: tech.name.en || '',
                    swedish: tech.name.sv || '',
                    type: type
                 });
            }
      });

      grade.katas.forEach((kata) => {
         categories[TechniqueTypeEnum.Kata].push({
            levelNumber, 
            romaji: kata.name.romaji || '', 
            japanese: kata.name.ja || '', 
            english: kata.name.en || '', 
            swedish: kata.name.sv || '', 
            type: TechniqueTypeEnum.Kata
        });
      });
   });

   return categories;
};

// Special technique tags per category

export const specialTechniqueTagsByCategory: Record<string, string[]> = {
   Strike: ['Jodan', 'Chudan', 'Gedan', 'Hidari', 'Migi'],
   Block: ['Uchi', 'Soto', 'Age', 'Gedan', 'Hidari', 'Migi'],
   Kick: ['Mae', 'Yoko', 'Ushiro', 'Gedan', 'Hidari', 'Migi'],
   Stand: ['Kamae', 'Kamaete', 'Sagari', 'Ura'],
};


export function FindGradeByTechniqueId(grades: any[], id: string): GradeWithContent {
    // Ignore passed 'grades' arg, use repo
   const grade = KyokushinRepository.getGradeForTechnique(id);
   if (grade) return grade;
   
   // Fallback to first grade if not found matches old behavior
   const allGrades = KyokushinRepository.getCurriculumGrades();
   return allGrades[0];
}


