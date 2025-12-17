// File: ./src/services/userSettingsService.ts

import {getApiBaseUrl} from '@/config/clientConfig';
import type {GradeHistoryEntry, PersistedSettings} from '@/types/settings';

const resolveSettingsEndpoint = () => {
   const baseUrl = getApiBaseUrl();
   return baseUrl ? `${baseUrl}/api/v1/settings` : '';
};

const DEFAULT_SETTINGS: PersistedSettings = {
   gradeHistory: [],
   trainedDays: 0,
   lastTrainedDate: null,
   skipDeleteConfirmForComboItems: false,
   skipDeleteConfirmForCombo: false,
};

const GRADE_HISTORY_KEY = 'user.gradeHistory';
const TRAINED_DAYS_KEY = 'kyokushin_days';
const LAST_DAY_KEY = 'kyokushin_last_date';
const SKIP_COMBO_ITEMS_KEY = 'skipDeleteConfirmForComboItems';
const SKIP_COMBO_KEY = 'skipDeleteConfirmForCombo';

let pendingSyncHandle: number | ReturnType<typeof setTimeout> | null = null;

export const isSettingsSyncAvailable = () => Boolean(resolveSettingsEndpoint());

export const collectLocalPersistedSettings = (): PersistedSettings => {
   if (typeof window === 'undefined') {
      return {...DEFAULT_SETTINGS};
   }

   const history = parseGradeHistory(window.localStorage.getItem(GRADE_HISTORY_KEY));
   const trainedDays = parseInt(window.localStorage.getItem(TRAINED_DAYS_KEY) ?? '0', 10) || 0;
   const lastDate = window.localStorage.getItem(LAST_DAY_KEY);
   const skipItems = window.localStorage.getItem(SKIP_COMBO_ITEMS_KEY) === 'true';
   const skipCombo = window.localStorage.getItem(SKIP_COMBO_KEY) === 'true';

   return {
      gradeHistory: history,
      trainedDays,
      lastTrainedDate: lastDate ?? null,
      skipDeleteConfirmForComboItems: skipItems,
      skipDeleteConfirmForCombo: skipCombo,
   };
};

export const applyPersistedSettingsToLocalStorage = (settings: PersistedSettings) => {
   if (typeof window === 'undefined') {
      return;
   }

   window.localStorage.setItem(GRADE_HISTORY_KEY, JSON.stringify(settings.gradeHistory ?? []));
   window.localStorage.setItem(TRAINED_DAYS_KEY, Math.max(0, settings.trainedDays || 0).toString());

   if (settings.lastTrainedDate) {
      window.localStorage.setItem(LAST_DAY_KEY, settings.lastTrainedDate);
   } else {
      window.localStorage.removeItem(LAST_DAY_KEY);
   }

   window.localStorage.setItem(SKIP_COMBO_ITEMS_KEY, String(Boolean(settings.skipDeleteConfirmForComboItems)));
   window.localStorage.setItem(SKIP_COMBO_KEY, String(Boolean(settings.skipDeleteConfirmForCombo)));
};

export const fetchUserSettingsFromServer = async (tokenOverride?: string): Promise<PersistedSettings | null> => {
   const endpoint = resolveSettingsEndpoint();
   if (!endpoint) {
      return null;
   }

   const token = tokenOverride ?? getStoredUserToken();
   if (!token) {
      return null;
   }

   try {
      const response = await fetch(endpoint, {
         method: 'GET',
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         if (response.status !== 404 && response.status !== 401) {
            console.warn('Failed to fetch user settings', response.status, response.statusText);
         }
         return null;
      }

      const data = (await response.json()) as {settings: PersistedSettings | null};
      if (!data?.settings) {
         return null;
      }

      return sanitizeSettings(data.settings);
   } catch (error) {
      console.warn('Unable to load settings from server', error);
      return null;
   }
};

export const pushLocalSettingsToServer = async (tokenOverride?: string): Promise<boolean> => {
   const endpoint = resolveSettingsEndpoint();
   if (!endpoint) {
      return false;
   }

   const token = tokenOverride ?? getStoredUserToken();
   if (!token) {
      return false;
   }

   const settings = collectLocalPersistedSettings();

   try {
      const response = await fetch(endpoint, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(settings),
      });

      if (!response.ok) {
         console.warn('Failed to persist settings', response.statusText);
         return false;
      }

      return true;
   } catch (error) {
      console.warn('Unable to persist settings', error);
      return false;
   }
};

export const hydrateSettingsFromServer = async (tokenOverride?: string): Promise<PersistedSettings | null> => {
   const settings = await fetchUserSettingsFromServer(tokenOverride);
   if (settings) {
      applyPersistedSettingsToLocalStorage(settings);
   }
   return settings;
};

export const notifySettingsChanged = () => {
   if (!isSettingsSyncAvailable() || typeof window === 'undefined') {
      return;
   }

   const token = getStoredUserToken();
   if (!token) {
      return;
   }

   if (pendingSyncHandle) {
      clearTimeout(pendingSyncHandle as number);
   }

   pendingSyncHandle = window.setTimeout(() => {
      pendingSyncHandle = null;
      void pushLocalSettingsToServer(token);
   }, 800);
};

const parseGradeHistory = (raw: string | null): GradeHistoryEntry[] => {
   if (!raw) {
      return [];
   }

   try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
         return [];
      }

      return parsed
         .filter(entry => typeof entry?.date === 'string' && typeof entry?.gradeId === 'string')
         .map(entry => ({date: entry.date, gradeId: entry.gradeId}));
   } catch {
      return [];
   }
};

const sanitizeSettings = (settings: PersistedSettings): PersistedSettings => {
   return {
      gradeHistory: Array.isArray(settings.gradeHistory)
         ? settings.gradeHistory
              .filter(entry => typeof entry?.date === 'string' && typeof entry?.gradeId === 'string')
              .map(entry => ({date: entry.date, gradeId: entry.gradeId}))
         : [],
      trainedDays: typeof settings.trainedDays === 'number' ? settings.trainedDays : 0,
      lastTrainedDate:
         typeof settings.lastTrainedDate === 'string' && settings.lastTrainedDate.length > 0 ? settings.lastTrainedDate : null,
      skipDeleteConfirmForComboItems: Boolean(settings.skipDeleteConfirmForComboItems),
      skipDeleteConfirmForCombo: Boolean(settings.skipDeleteConfirmForCombo),
   };
};

const getStoredUserToken = (): string | null => {
   if (typeof window === 'undefined') {
      return null;
   }

   const storedUser = window.localStorage.getItem('user');
   if (!storedUser) {
      return null;
   }

   try {
      const parsed = JSON.parse(storedUser) as {token?: string};
      return parsed.token ?? null;
   } catch {
      return null;
   }
};
