// File: ./src/app/ten-thousand-days/kyokushinUppsalaPasses.ts

// Enkelt objekt: antal träningspass som krävs mellan varje vuxen-grad
export const KYOKUSHIN_UPPSALA_PASSES_BETWEEN_GRADES = {
   'white_to_10_kyu': 25, // Nybörjare -> 10 kyu (orange)
   '10_kyu_to_9_kyu': 25, // 10 -> 9 kyu (orange, 1 streck)
   '9_kyu_to_8_kyu': 25, // 9 -> 8 kyu (blått)
   '8_kyu_to_7_kyu': 25, // 8 -> 7 kyu (blått, 1 streck)
   '7_kyu_to_6_kyu': 25, // 7 -> 6 kyu (gult)
   '6_kyu_to_5_kyu': 25, // 6 -> 5 kyu (gult, 1 streck)
   '5_kyu_to_4_kyu': 25, // 5 -> 4 kyu (grönt)

   '4_kyu_to_3_kyu': 50, // 4 -> 3 kyu (grönt, 1 streck)
   '3_kyu_to_2_kyu': 50, // 3 -> 2 kyu (brunt)
   '2_kyu_to_1_kyu': 50, // 2 -> 1 kyu (brunt, 1 streck)
} as const;

export type KyokushinUppsalaGradeStep = keyof typeof KYOKUSHIN_UPPSALA_PASSES_BETWEEN_GRADES;
