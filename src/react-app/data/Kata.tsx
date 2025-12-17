// HEADER-START
// * Path: ./src/data/Kata.tsx
// HEADER-END

import {Grade} from './Grade';
import {Technique} from './Technique';

export class Kata {
   id: string;
   description: string;
   romaji: string;
   japanese: string;
   english: string;
   swedish: string;
   history: string;
   detailedDescription: string;
   youtubeKey: string;
   poster: string;
   tags: string[];
   steps: number;

   constructor(id: string, romaji: string, description: string, japanese: string, english: string, swedish: string, history: string, detailedDescription: string, youtubeKey: string, poster: string, tags: string[], steps: number) {
      this.id = id;
      this.description = description;
      this.romaji = romaji;
      this.japanese = japanese;
      this.english = english;
      this.swedish = swedish;
      this.history = history;
      this.detailedDescription = detailedDescription;
      this.youtubeKey = youtubeKey;
      this.poster = poster;
      this.tags = tags;
      this.steps = steps;
   }
}

// `GetKataData` function to extract all katas from gradeData

export const GetKataData = (grades: Grade[]) =>
   grades.flatMap(data =>
      data.techniques
         .filter((technique): technique is Technique => technique.type === 'Kata')
         .map(kataInfo => ({
            id: kataInfo.id,
            level: data.isIntermediate,
            color: data.beltColor,
            rank: data.rankName,
            romaji: kataInfo.romaji,
            japanese: kataInfo.japanese,
            english: kataInfo.english,
            swedish: kataInfo.swedish,
            history: kataInfo.history,
            detailedDescription: kataInfo.detailedDescription,
            youtubeKey: kataInfo.youtubeKey,
            poster: kataInfo.poster,
         })),
   );
