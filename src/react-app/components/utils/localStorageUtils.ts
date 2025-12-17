// File: ./src/components/utils/localStorageUtils.ts

/**
 * Retrieves an item from localStorage and parses it as JSON.
 * If the item does not exist, parsing fails, or validation fails, returns the provided default value.
 *
 * @template T The expected type of the stored item.
 * @param {string} key The key under which the item is stored.
 * @param {T} defaultValue The default value to return if retrieval fails.
 * @param {(value: any) => value is T} [validator] Optional function to validate the parsed value.
 * @returns {T} The retrieved item or the default value.
 */
export const getLocalStorageItem = <T>(key: string, defaultValue: T, validator?: (value: unknown) => value is T): T => {
   try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;

      const parsed = JSON.parse(stored);
      if (validator && !validator(parsed)) return defaultValue;

      return parsed as T;
   } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
   }
};

/**
 * Serializes and stores an item in localStorage.
 *
 * @template T The type of the item to store.
 * @param {string} key The key under which to store the item.
 * @param {T} value The item to store.
 */
export const setLocalStorageItem = <T>(key: string, value: T): void => {
   try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
   } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
   }
};

/**
 * Retrieves an array of objects from localStorage and parses it as JSON.
 * If the item does not exist or parsing fails, returns the provided default value.
 *
 * @template T The type of the objects in the stored array.
 * @param {string} key The key under which the array is stored.
 * @param {T[]} defaultValue The default array to return if retrieval fails.
 * @returns {T[]} The retrieved array or the default value.
 */
export const getLocalStorageItems = <T extends object>(key: string, defaultValue: T[] = []): T[] => {
    try {
       const stored = localStorage.getItem(key);
       if (stored === null) return defaultValue;

       const parsed = JSON.parse(stored);
       if (Array.isArray(parsed)) return parsed as T[];

       // If it's an object, assume it's a single item and wrap in array
       if (typeof parsed === 'object' && parsed !== null) {
          return [parsed as T];
       }

       console.warn(`Data retrieved from localStorage key "${key}" is not an array or object.`);
       return defaultValue;
    } catch (error) {
       console.error(`Error parsing localStorage key "${key}":`, error);
       return defaultValue;
    }
 };

/**
 * Serializes and stores an array of objects in localStorage.
 *
 * @template T The type of the objects in the array to store.
 * @param {string} key The key under which to store the array.
 * @param {T[]} value The array of objects to store.
 */
export const setLocalStorageItems = <T extends object>(key: string, value: T[]): void => {
   try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
   } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
   }
};

/**
 * Retrieves an item by its ID from an array of objects stored in localStorage.
 * If the item does not exist, the data is invalid, or parsing fails, returns `undefined`.
 *
 * @template T The type of the objects in the stored array. Must include an 'id' property.
 * @param {string} key The key under which the array is stored.
 * @param {string} id The ID of the item to retrieve.
 * @returns {T | undefined} The retrieved item or `undefined` if not found.
 */
export const getLocalStorageItemById = <T extends {id: string}>(key: string, id: string): T | undefined => {
   const items = getLocalStorageItems<T>(key);
   return items.find(item => item.id === id);
};

/**
 * Updates or adds an item by its ID in an array of objects stored in localStorage.
 * If the item exists, it will be updated. If it does not exist, it will be added to the array.
 *
 * @template T The type of the objects in the stored array. Must include an 'id' property.
 * @param {string} key The key under which the array is stored.
 * @param {T} newItem The item to update or add.
 */
export const setLocalStorageItemById = <T extends {id: string}>(key: string, newItem: T): void => {
   const items = getLocalStorageItems<T>(key);
   const index = items.findIndex(item => item.id === newItem.id);

   if (index !== -1) {
      items[index] = newItem; // Update existing item
   } else {
      items.push(newItem); // Add new item
   }

   setLocalStorageItems(key, items);
};

/**
 * Deletes an item by its ID from an array of objects stored in localStorage.
 * If the ID does not exist, the function does nothing.
 *
 * @template T The type of the objects in the stored array. Must include an 'id' property.
 * @param {string} key The key under which the array is stored.
 * @param {string} id The ID of the item to delete.
 */
export const deleteLocalStorageItemById = <T extends {id: string}>(key: string, id: string): void => {
   const items = getLocalStorageItems<T>(key);
   const filtered = items.filter(item => item.id !== id);

   if (filtered.length !== items.length) {
      setLocalStorageItems(key, filtered);
   } else {
      console.warn(`Item with id "${id}" not found in localStorage key "${key}".`);
   }
};
