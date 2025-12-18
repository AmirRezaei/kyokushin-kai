
import {notifySettingsChanged} from '@/services/userSettingsService';
import type {GradeHistoryEntry} from '@/types/settings';

export class SettingsManager {
    private static readonly KEY_GRADE_HISTORY = 'user.gradeHistory';
    private static readonly KEY_SELECTED_GRADE = 'user.selectedGrade';
    private static readonly KEY_TRAINED_DAYS = 'kyokushin_days';
    private static readonly KEY_LAST_DATE = 'kyokushin_last_date';
    private static readonly KEY_SKIP_COMBO_ITEMS = 'skipDeleteConfirmForComboItems';
    private static readonly KEY_SKIP_COMBO = 'skipDeleteConfirmForCombo';

    // Grade History
    static getGradeHistory(): GradeHistoryEntry[] {
        try {
            const data = localStorage.getItem(this.KEY_GRADE_HISTORY);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse grade history', e);
            return [];
        }
    }

    static addGradeHistoryEntry(date: string, gradeId: string): void {
        const history = this.getGradeHistory();
        // Check for duplicates or updates? For now just add.
        history.push({ date, gradeId });
        // Sort descending by date
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        localStorage.setItem(this.KEY_GRADE_HISTORY, JSON.stringify(history));
        notifySettingsChanged();
    }

    static removeGradeHistoryEntry(index: number): void {
        const history = this.getGradeHistory();
        if (index >= 0 && index < history.length) {
            history.splice(index, 1);
            localStorage.setItem(this.KEY_GRADE_HISTORY, JSON.stringify(history));
            notifySettingsChanged();
        }
    }

    static updateGradeHistoryEntry(index: number, date: string, gradeId: string): void {
        const history = this.getGradeHistory();
        if (index >= 0 && index < history.length) {
            history[index] = { date, gradeId };
            // Re-sort after update
            history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            localStorage.setItem(this.KEY_GRADE_HISTORY, JSON.stringify(history));
            notifySettingsChanged();
        }
    }

    static getCurrentGradeId(): string {
        const history = this.getGradeHistory();
        if (history.length > 0) {
            // Provided history is sorted descending, the first one is the latest.
            // If not sorted, we should sort.
            const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return sorted[0].gradeId;
        }
        return localStorage.getItem(this.KEY_SELECTED_GRADE) || '1';
    }

    // Trained Days
    static getTrainedDays(): number {
        const days = localStorage.getItem(this.KEY_TRAINED_DAYS);
        return days ? parseInt(days, 10) : 0;
    }

    static getLastTrainingDate(): string | null {
        return localStorage.getItem(this.KEY_LAST_DATE);
    }

    static setTrainedDays(days: number, options?: {lastTrainingDate?: string | null}): void {
        localStorage.setItem(this.KEY_TRAINED_DAYS, days.toString());
        if (options && 'lastTrainingDate' in options) {
            if (options.lastTrainingDate) {
                localStorage.setItem(this.KEY_LAST_DATE, options.lastTrainingDate);
            } else {
                localStorage.removeItem(this.KEY_LAST_DATE);
            }
        }
        notifySettingsChanged();
    }

    static setLastTrainingDate(date: string): void {
        localStorage.setItem(this.KEY_LAST_DATE, date);
        notifySettingsChanged();
    }

    static clearLastTrainingDate(): void {
        localStorage.removeItem(this.KEY_LAST_DATE);
        notifySettingsChanged();
    }

    // Skip Confirmations
    static getSkipDeleteConfirmForComboItems(): boolean {
        return localStorage.getItem(this.KEY_SKIP_COMBO_ITEMS) === 'true';
    }

    static setSkipDeleteConfirmForComboItems(value: boolean): void {
        localStorage.setItem(this.KEY_SKIP_COMBO_ITEMS, String(value));
        notifySettingsChanged();
    }

    static getSkipDeleteConfirmForCombo(): boolean {
        return localStorage.getItem(this.KEY_SKIP_COMBO) === 'true';
    }

    static setSkipDeleteConfirmForCombo(value: boolean): void {
        localStorage.setItem(this.KEY_SKIP_COMBO, String(value));
        notifySettingsChanged();
    }
}
