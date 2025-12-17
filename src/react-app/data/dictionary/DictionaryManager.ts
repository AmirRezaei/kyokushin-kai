// File: ./src/data/dictionary/DictionaryManager.ts

import {Category} from './Category';
import {DictionaryEntry} from './DictionaryEntry';
import {generateId} from './generateId';

export class DictionaryManager {
   private entries: Map<string, DictionaryEntry>;
   private categories: Map<string, Category>;
   private defaultCategory: Category;

   constructor(initialEntries: DictionaryEntry[] = [], initialCategories: Category[] = []) {
      this.entries = new Map<string, DictionaryEntry>();
      this.categories = new Map<string, Category>();

      // Initialize categories
      initialCategories.forEach(category => {
         this.categories.set(category.id, category);
      });

      // Ensure there's a default category
      this.defaultCategory = {
         id: 'default',
         name: 'Uncategorized',
         description: 'Default category for uncategorized entries.',
      };
      if (!this.categories.has(this.defaultCategory.id)) {
         this.categories.set(this.defaultCategory.id, this.defaultCategory);
      }

      // Initialize entries
      initialEntries.forEach(entry => {
         // Validate categoryId
         if (!this.categories.has(entry.categoryId)) {
            entry.categoryId = this.defaultCategory.id;
         }
         this.entries.set(entry.id, entry);
      });
   }

   // --- Dictionary Entry Methods ---

   /**
    * Retrieves all dictionary entries.
    */
   getAllEntries(): DictionaryEntry[] {
      return Array.from(this.entries.values());
   }

   /**
    * Retrieves a dictionary entry by its ID.
    * @param id - The ID of the entry.
    */
   getEntryById(id: string): DictionaryEntry | undefined {
      return this.entries.get(id);
   }

   /**
    * Adds a new dictionary entry.
    * @param entry - The entry to add.
    * @returns The added entry with a unique ID.
    */
   addEntry(entry: Omit<DictionaryEntry, 'id'>): DictionaryEntry {
      // Validate categoryId
      const categoryId = this.categories.has(entry.categoryId) ? entry.categoryId : this.defaultCategory.id;

      const newEntry: DictionaryEntry = {
         ...entry,
         id: generateId(),
         categoryId,
      };
      this.entries.set(newEntry.id, newEntry);
      return newEntry;
   }

   /**
    * Updates an existing dictionary entry.
    * @param id - The ID of the entry to update.
    * @param updatedEntry - Partial entry data to update.
    * @returns True if update was successful, else false.
    */
   updateEntry(id: string, updatedEntry: Partial<Omit<DictionaryEntry, 'id'>>): boolean {
      const entry = this.entries.get(id);
      if (entry) {
         // If categoryId is being updated, validate it
         if (updatedEntry.categoryId && !this.categories.has(updatedEntry.categoryId)) {
            updatedEntry.categoryId = this.defaultCategory.id;
         }

         const updated = {...entry, ...updatedEntry};
         this.entries.set(id, updated);
         return true;
      }
      return false;
   }

   /**
    * Removes a dictionary entry by its ID.
    * @param id - The ID of the entry to remove.
    * @returns True if removal was successful, else false.
    */
   removeEntry(id: string): boolean {
      return this.entries.delete(id);
   }

   // --- Category Methods ---

   /**
    * Retrieves all categories.
    */
   getAllCategories(): Category[] {
      return Array.from(this.categories.values());
   }

   /**
    * Retrieves a category by its ID.
    * @param id - The ID of the category.
    */
   getCategoryById(id: string): Category | undefined {
      return this.categories.get(id);
   }

   /**
    * Adds a new category.
    * @param category - The category to add.
    * @returns The added category with a unique ID.
    */
   addCategory(category: Omit<Category, 'id'>): Category {
      const newCategory: Category = {
         ...category,
         id: generateId(),
      };
      this.categories.set(newCategory.id, newCategory);
      return newCategory;
   }

   /**
    * Updates an existing category.
    * @param id - The ID of the category to update.
    * @param updatedCategory - Partial category data to update.
    * @returns True if update was successful, else false.
    */
   updateCategory(id: string, updatedCategory: Partial<Omit<Category, 'id'>>): boolean {
      const category = this.categories.get(id);
      if (category && id !== this.defaultCategory.id) {
         // Prevent updating default category
         const updated = {...category, ...updatedCategory};
         this.categories.set(id, updated);
         return true;
      }
      return false;
   }

   /**
    * Removes a category by its ID.
    * Reassigns entries to the default category if they reference the removed category.
    * @param id - The ID of the category to remove.
    * @returns True if removal was successful, else false.
    */
   removeCategory(id: string): boolean {
      if (id === this.defaultCategory.id) {
         // Prevent removing the default category
         console.warn('Cannot remove the default category.');
         return false;
      }

      if (this.categories.delete(id)) {
         // Reassign entries to the default category
         this.entries.forEach(entry => {
            if (entry.categoryId === id) {
               entry.categoryId = this.defaultCategory.id;
               this.entries.set(entry.id, entry);
            }
         });
         return true;
      }
      return false;
   }

   /**
    * Retrieves all entries under a specific category.
    * @param categoryId - The ID of the category.
    */
   getEntriesByCategory(categoryId: string): DictionaryEntry[] {
      return Array.from(this.entries.values()).filter(entry => entry.categoryId === categoryId);
   }
}
