/**
 * Represents a product from the lexicon, used for dropdowns.
 */
export interface IProduct {
  id: string;
  displayName: string;
  isHazardous: boolean;
}

/**
 * Represents the structure of a booking object sent to the API.
 */
export interface IBooking {
  id?: string;
  customerName?: string;
  companyName?: string;
  bookingDate?: string;
  description: string;
  products: any;
  internalNotes: string;
  expectedIsHazardous?: boolean;
}

/**
 * Represents the classification result received from the API.
 */
export interface IClassificationResult {
  bookingId: string;
  isHazardous: boolean;
  score: number;
  reasons: string[];
}