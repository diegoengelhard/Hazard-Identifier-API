import lexiconData from "../utils/lexicon.json";
import { IBooking, IClassificationResult, ILexicon } from "../ts/interfaces";

// Load the lexicon from the JSON file into memory once when the server starts.
const lexicon: ILexicon = lexiconData as ILexicon;

/**
 * Classifies a single booking to determine if it contains hazardous materials
 * based on a weighted scoring system defined in the lexicon.
 * @param {IBooking} booking - The booking object to classify.
 * @returns {IClassificationResult} An object containing the classification result.
 */
export const classifyBooking = (booking: IBooking): IClassificationResult => {
  let score = 0;
  const reasons: string[] = [];
  const foundKeywords: string[] = [];

  // Combine all free-text fields into a single, lowercased string for easy searching.
  const searchableText = [
    booking.description.toLowerCase(),
    booking.internalNotes.toLowerCase(),
  ].join(" ");

  // 1. Check if the products listed in the booking match our known product list.
  booking.products.forEach((productName) => {
    const productMatch = lexicon.products.find(
      (p) => p.displayName === productName
    );
    if (productMatch && productMatch.isHazardous) {
      score += lexicon.weights.product;
      reasons.push(`Product Match: ${productName}`);
    }
  });

  // 2. These provide more context than single keywords.
  lexicon.bigrams.forEach((bigram) => {
    if (searchableText.includes(bigram.phrase)) {
      score += lexicon.weights.bigram;
      reasons.push(`Bigram: ${bigram.phrase}`);
    }
  });

  // 3. Analyze Keywords
  lexicon.keywords.forEach((keyword) => {
    const termsToSearch = [keyword.term, ...(keyword.variants || [])];
    if (termsToSearch.some((t) => searchableText.includes(t))) {
      const weight =
        keyword.type === "technical"
          ? lexicon.weights.technical
          : lexicon.weights.consumer;
      score += weight;
      reasons.push(`Keyword: ${keyword.term}`);
      foundKeywords.push(keyword.term);
    }
  });

  // 4. Analyze Negations
  lexicon.negations.forEach((negation) => {
    const termsToSearch = [negation.term, ...(negation.variants || [])];
    if (termsToSearch.some((t) => searchableText.includes(t))) {
      // If the negation impacts a keyword we already found, apply a negative score.
      if (
        negation.impacts.some((impactedTerm) =>
          foundKeywords.includes(impactedTerm)
        )
      ) {
        score += lexicon.weights.negation_soft;
        reasons.push(`Negation Applied: ${negation.term}`);
      }
    }
  });

  // 5. Analyze with Regular Expressions
  lexicon.regex.forEach((regexItem) => {
    const regex = new RegExp(regexItem.pattern, "i"); // 'i' for case-insensitive
    if (regex.test(searchableText)) {
      score += lexicon.weights.regex;
      reasons.push(`Regex Match: ${regexItem.name}`);
    }
  });

  // Final decision is based on whether the score meets or exceeds the threshold.
  const isHazardous = score >= lexicon.weights.threshold;

  return {
    bookingId: booking.id,
    isHazardous,
    score,
    reasons,
  };
};

/**
 * Classifies a batch of bookings by applying the `classifyBooking` function to each.
 * @param {IBooking[]} bookings - An array of booking objects.
 * @returns {IClassificationResult[]} An array of classification results.
 */
export const classifyBookingBatch = (
  bookings: IBooking[]
): IClassificationResult[] => {
  // Use .map() to efficiently process each booking in the array.
  return bookings.map((booking) => classifyBooking(booking));
};

/**
 * Retrieves the standardized list of products from the lexicon.
 * Intended for the frontend to dynamically populate dropdown menus.
 * @returns {Partial<ILexicon['products']>} A list of products.
 */
export const getProductList = () => {
  // We only return fields relevant to the frontend to minimize payload size.
  return lexicon.products.map(({ id, displayName, isHazardous }) => ({
    id,
    displayName,
    isHazardous,
  }));
};
