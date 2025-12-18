
import { GradeRecord, GradeKind, BeltColor } from '../model/grade';

export const beltNames: string[] = [
   'White', // Mukyu (No Kyu)
   'Orange', // 10th Kyu
   'Orange 1 Stripe', // 9th Kyu
   'Blue', // 8th Kyu
   'Blue 1 Stripe', // 7th Kyu
   'Yellow', // 6th Kyu
   'Yellow 1 Stripe', // 5th Kyu
   'Green', // 4th Kyu
   'Green 1 Stripe', // 3rd Kyu
   'Brown', // 2nd Kyu
   'Brown 1 Stripe', // 1st Kyu
   'Shodan', // 1st Dan Black Belt
   'Nidan', // 2nd Dan Black Belt
   'Sandan', // 3rd Dan Black Belt
   'Yondan', // 4th Dan Black Belt
   'Godan', // 5th Dan Black Belt
   'Rokudan', // 6th Dan Black Belt
   'Shichidan', // 7th Dan Black Belt
   'Hachidan', // 8th Dan Black Belt
   'Kudan', // 9th Dan Black Belt
   'Judan', // 10th Dan Black Belt
];

const colorMap: Record<string, string> = {
   white: '#FFFFFF',
   orange: '#FFA500',
   blue: '#0000FF',
   yellow: '#FFD700',
   green: '#008000',
   brown: '#A52A2A',
   black: '#000000',
};

export const getBeltColorHex = (beltColor: BeltColor | string): string => {
   return colorMap[beltColor.toLowerCase()] || '#FFFFFF';
};

export const getLevelNumber = (grade: GradeRecord): number => {
    if (grade.kind === GradeKind.Dan) {
        return 10 + grade.number;
    }
    // Kyu or Mukyu
    // Assuming Mukyu is Kyu 11 based on legacy conversion
    if (grade.number > 10) { // 11 is Mukyu
        return 0; // White belt index
    }
    return 11 - grade.number;
};

export const getBeltName = (grade: GradeRecord): string => {
    const level = getLevelNumber(grade);
    return beltNames[level] || 'Unknown';
};

export const isIntermediate = (grade: GradeRecord): boolean => {
    if (grade.kind === GradeKind.Dan) return false;
    // Kyu grades
    if (grade.number === 11) return false; // Mukyu
    return grade.number % 2 === 1; // Odd numbers (9, 7, 5, 3, 1) have stripes
};

export const hasStripe = (grade: GradeRecord): boolean => {
    return isIntermediate(grade) || grade.kind === GradeKind.Dan;
};

export const getStripeNumber = (grade: GradeRecord): number => {
    if (grade.kind === GradeKind.Dan) return grade.number;
    if (isIntermediate(grade)) return 1;
    return 0;
};

export const getFormattedGradeName = (grade: GradeRecord): string => {
    const beltName = getBeltName(grade);
    // Prefer English name if available, fallback to something else
    const rankName = grade.name.en || grade.name.romaji || 'Unknown Rank';
    return `${rankName} (${beltName})`;
};
