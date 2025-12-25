-- Migration: Rename flashcard tables to card tables for consistency
-- This migration renames user_flashcards to user_cards and user_flashcard_decks to user_card_decks

-- Step 1: Rename user_flashcards to user_cards
ALTER TABLE user_flashcards RENAME TO user_cards;

-- Step 2: Rename user_flashcard_decks to user_card_decks
ALTER TABLE user_flashcard_decks RENAME TO user_card_decks;

-- Step 3: Update indexes (SQLite automatically renames indexes with the table, but we'll verify)
-- The indexes idx_ufcards_user_id, idx_ufcards_deck_id, and idx_udecks_user_id should still work
-- but we can recreate them with better names if needed

-- Note: Foreign key constraints and triggers are automatically updated by SQLite when renaming tables
