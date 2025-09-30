/**
 * Defines the structure of a booking object that the API expects to receive.
 */
export interface IBooking {
  id: string;
  customerName?: string;
  companyName?: string;
  bookingDate?: string;
  description: string;
  products: any;
  internalNotes: string;
}

/**
 * Defines the structure of the classification response returned by the API.
 */
export interface IClassificationResult {
  bookingId: string;
  isHazardous: boolean;
  score: number;
  reasons: string[];
}

/**
 * Defines the structure of our lexicon.json file, enabling type safety and autocompletion.
 */
export interface ILexicon {
  version: string;
  notes: string;
  weights: {
    product: number;
    bigram: number;
    technical: number;
    consumer: number;
    regex: number;
    negation_soft: number;
    threshold: number;
  };
  keywords: { term: string; type: string; variants: string[] }[];
  bigrams: { phrase: string }[];
  regex: { name: string; pattern: string }[];
  negations: { term: string; variants?: string[]; impacts: string[] }[];
  products: { id: string; displayName: string; keywords: string[]; isHazardous: boolean }[];
}
