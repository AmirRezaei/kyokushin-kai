

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

export type TechniqueCombo = {
   id: string;
   name: string;
   techniques: Technique[];
   difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
   tags?: string[];
   notes?: string;
};
