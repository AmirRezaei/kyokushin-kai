// File: ./src/types/settings.ts

export interface GradeHistoryEntry {
   date: string;
   gradeId: string;
}

export interface PersistedSettings {
   gradeHistory: GradeHistoryEntry[];
   trainedDays: number;
   lastTrainedDate: string | null;
   skipDeleteConfirmForComboItems: boolean;
   skipDeleteConfirmForCombo: boolean;
}
