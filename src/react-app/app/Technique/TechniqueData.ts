// HEADER-START
// * Path: ./src/app/Technique/TechniqueData.ts
// HEADER-END

import {Grade} from '@/data/Grade';
import {gradeData} from '@/data/gradeData';

// Define the desired order of technique types
export const TechniqueTypes: string[] = ['Stand', 'Strike', 'Block', 'Kick', 'Kata', 'Breathing', 'Fighting'];

export enum TechniqueTypeEnum {
   Stand = 'Stand',
   Strike = 'Strike',
   Block = 'Block',
   Kick = 'Kick',
   Kata = 'Kata',
   Breathing = 'Breathing',
   Fighting = 'Fighting',
   ThreeStepFight = 'ThreeStepFight',
}
export const TechniqueTypeEnumValues = Object.values(TechniqueTypeEnum);

export type TechniqueType = 'Stand' | 'Strike' | 'Kick' | 'Block' | 'Kata' | 'Breathing' | 'ThreeStepFight' | 'Fighting';

export class Technique {
   id: string;
   type: TechniqueType;
   romaji: string;
   japanese?: string;
   english?: string;
   swedish?: string;
   history?: string;
   detailedDescription?: string;
   youtubeKey?: string;
   poster?: string;
   tags?: string[];

   constructor(id: string, type: TechniqueType, romaji: string, english?: string, swedish?: string, japanese?: string, history?: string, detailedDescription?: string, youtubeKey?: string, poster?: string, tags?: string[]) {
      this.id = id;
      this.type = type;
      this.romaji = romaji;
      this.english = english;
      this.swedish = swedish;
      this.japanese = japanese;
      this.history = history;
      this.detailedDescription = detailedDescription;
      this.youtubeKey = youtubeKey;
      this.poster = poster;
      this.tags = tags;
   }

   // returns grade for the technique. If grade is not found, first grade will be returned.
   Grade(grades: Grade[]): Grade {
      for (const grade of grades) {
         if (grade.techniques.find(t => t.id === this.id)) {
            return grade;
         }
      }
      return grades[0]; // If no grade contains the technique return first grade.
   }

   get words(): string[] {
      return (this.romaji || '').split(' ');
   }

   get correctOrder(): string[] {
      return Array.from(this.words.values());
   }
}

export type CommonData = {
   levelNumber: number;
   romaji: string;
   japanese?: string;
   english?: string;
   swedish?: string;
   type: TechniqueTypeEnum;
};

export const GetTechniqueByType = (grades: Grade[]): Record<TechniqueTypeEnum, CommonData[]> => {
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

   grades.forEach(({levelNumber, techniques, katas}) => {
      techniques.forEach(({type, romaji, japanese = '', english = '', swedish = ''}) => {
         const enumType = type as TechniqueTypeEnum; // Ensure the type aligns with TechniqueTypeEnum
         if (!categories[enumType]) {
            categories[enumType] = [];
         }
         categories[enumType].push({levelNumber, romaji, japanese, english, swedish, type: enumType});
      });

      katas.forEach(({description, japanese, english, swedish}) => {
         categories[TechniqueTypeEnum.Kata].push({levelNumber, romaji: description, japanese, english, swedish, type: TechniqueTypeEnum.Kata});
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

export type TechniqueCombo = {
   id: string;
   name: string;
   techniques: Technique[];
   difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
   tags?: string[];
   notes?: string;
};

export function FindGradeByTechniqueId(grades: Grade[], id: string): Grade {
   for (const grade of grades) {
      if (grade.techniques.find(t => t.id === id)) {
         return grade;
      }
   }
   return grades[0]; // If no grade contains the technique return first grade.
}

// export class GradeManager {
//    Grades: Grade[] = gradeData;
//    Techniques: Technique[] = gradeData.flatMap(grade => grade.techniques);
// }
