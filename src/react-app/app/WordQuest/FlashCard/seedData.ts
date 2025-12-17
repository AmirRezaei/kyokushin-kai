
import { v4 as uuidv4 } from 'uuid';
import { gradeData } from '@/data/gradeData';
import { Deck, FlashCard } from './types';

// Deterministic ID generation based on prefixes to ensure consistency across contexts
// We use the IDs from gradeData which are sequential counter strings ("1", "2", ...)
// But to avoid collision with potential future UUIDs, we can prefix them or just use them if they are unique enough (they are just numbers strings).
// Better to make them look like UUIDs or just unique strings.
// Since we are seeding, we can just use "deck-grade-ID" and "card-tech-ID".

export const getInitialData = () => {
   const decks: Deck[] = [];
   const flashCards: FlashCard[] = [];

   gradeData.forEach(grade => {
      // Create Deck
      // Grade ID is like "2" for 10th Kyu.
      const deckId = `deck-${grade.id}`; 
      const deckName = `${grade.rankName} - ${grade.beltColor.charAt(0).toUpperCase() + grade.beltColor.slice(1)} Belt`;
      
      const deck: Deck = {
         id: deckId,
         name: deckName,
         description: `Techniques for ${grade.rankName}`,
         flashCardIds: [],
      };

      // Process Techniques
      grade.techniques.forEach(tech => {
         // tech.id is also a counter string "1", "2"...
         const cardId = `card-tech-${tech.id}`;
         
         const card: FlashCard = {
            id: cardId,
            question: tech.japanese || tech.romaji, // Fallback to romaji if japanese is missing? Prompt said "Japanese technique name". Most have it.
            answer: tech.english || tech.romaji,
            category: 'Technique',
            deckId: deckId,
         };

         // If japanese is empty, maybe we should use romaji?
         // Let's assume most have Japanese. If not, use Romaji as fallback to be safe.
         if (!card.question) card.question = tech.romaji;
         
         flashCards.push(card);
         deck.flashCardIds.push(cardId);
      });

      // We could also add Katas? User only mentioned "Question Japanese technique name Answer: English technique name".
      // I will stick to techniques for now as requested.

      decks.push(deck);
   });

   return { decks, flashCards };
};
