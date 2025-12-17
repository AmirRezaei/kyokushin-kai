// HEADER-START
// * Path: ./src/data/generateId.ts
// HEADER-END

import {nanoid} from 'nanoid';

export const generateId = (): string => {
   //    return Math.random().toString(36).substr(2, 9);
   return nanoid(8);
};
