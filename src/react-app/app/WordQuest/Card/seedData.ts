import { KyokushinRepository } from '../../../../data/repo/KyokushinRepository';
import { getFormattedGradeName } from '../../../../data/repo/gradeHelpers';
import { Deck, Card } from './types';

// Deterministic ID generation based on prefixes to ensure consistency across contexts
// We use the IDs from gradeData which are sequential counter strings ("1", "2", ...)
// But to avoid collision with potential future UUIDs, we can prefix them or just use them if they are unique enough (they are just numbers strings).
// Better to make them look like UUIDs or just unique strings.
// Since we are seeding, we can just use "deck-grade-ID" and "card-tech-ID".

export const getInitialData = async (): Promise<{ decks: Deck[]; cards: Card[] }> => {
  const decks: Deck[] = [];
  const cards: Card[] = [];

  const grades = await KyokushinRepository.getCurriculumGrades();

  grades.forEach((grade) => {
    // Create Deck
    // Grade ID is like "2" for 10th Kyu.
    const deckId = `deck-${grade.id}`;

    // Original logic: `${grade.rankName} - ${grade.beltColor.charAt(0).toUpperCase() + grade.beltColor.slice(1)} Belt`
    // New logic: Use helper or reconstruct
    const formattedRank = getFormattedGradeName(grade);
    // formattedRank is "10th Kyu (Orange)" or similar.
    // Let's try to match original text if possible or just use formattedRank which is better.
    // Original: "10th Kyu (Orange Belt) - Orange Belt" (Seems redundant in original code logic? No, original was `grade.rankName` - `BeltColor` Belt)
    // `grade.rankName` in legacy was "10th Kyu (Orange Belt)".
    // Let's use `formattedRank`.
    const deckName = formattedRank;

    const deck: Deck = {
      id: deckId,
      name: deckName,
      description: `Techniques for ${formattedRank}`,
      cardIds: [],
    };

    // Process Techniques
    grade.techniques.forEach((tech) => {
      const cardId = `card-tech-${tech.id}`;

      const question = tech.name.ja || tech.name.romaji || 'Unknown';
      const answer = tech.name.en || tech.name.romaji || 'Unknown';

      const card: Card = {
        id: cardId,
        question: question,
        answer: answer,
        category: 'Technique',
        deckId: deckId,
      };

      cards.push(card);
      deck.cardIds.push(cardId);
    });

    // Process Katas
    grade.katas.forEach((kata) => {
      const cardId = `card-kata-${kata.id}`;

      const question = kata.name.ja || kata.name.romaji || 'Unknown';
      const answer = kata.name.en || kata.name.romaji || 'Unknown';

      const card: Card = {
        id: cardId,
        question: question,
        answer: answer,
        category: 'Kata',
        deckId: deckId,
      };

      cards.push(card);
      deck.cardIds.push(cardId);
    });

    if (deck.cardIds.length > 0) {
      decks.push(deck);
    }
  });

  return { decks, cards };
};
