// HEADER-START
// * Path: ./src/Quote/Quote.ts
// HEADER-END

export class Quote {
   id: string; // Unique identifier for the quote based on guid(8)
   author: string; // The person who said or wrote the quote
   tags: string[]; // Tags for disciplines, styles, and related keywords
   date?: string; // The date the quote was originally said/written
   text: string; // The quote text in English
   meaning: string; // The meaning of the quote in English
   history?: string; // Historical context or significance of the quote
   reference?: string; // Source of the quote (e.g., book, speech, article)
   isFavorited: boolean; // Indicates if the quote is marked as a favorite by the user

   constructor(
      id: string,
      author: string,
      tags: string[],
      text: string,
      meaning: string,
      history?: string, // Optional parameter for historical context
      reference?: string, // Optional parameter for the reference
      date?: string, // Optional parameter for the date
   ) {
      this.id = id;
      this.author = author;
      this.tags = tags;
      this.text = text;
      this.meaning = meaning;
      this.history = history || undefined; // Assigns history if provided, otherwise undefined
      this.reference = reference || undefined; // Assigns reference if provided, otherwise undefined
      this.date = date || undefined; // Assigns date if provided, otherwise undefined
      this.isFavorited = false; // Default to false if not provided
   }

   // Method to toggle the favorited status
   toggleFavorite(): void {
      this.isFavorited = !this.isFavorited;
   }
   // Getter to retrieve the avatar URL based on the author's name
   get avatar(): string {
      const baseUrl = 'avatar/';
      const formattedAuthor = baseUrl + this.author.replace(/ /g, '-') + '.jpg';
      return formattedAuthor;
   }
}
