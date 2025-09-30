import { IBooking, IClassificationResult, IProduct } from "../ts/interfaces";

const API_BASE_URL = "http://localhost:3000/api/identifier";

/**
 * Fetches the standardized list of products from the backend.
 * @returns {Promise<IProduct[]>} A promise that resolves to the list of products.
 */
export const getProducts = async (): Promise<IProduct[]> => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error("Failed to fetch products.");
  }
  return response.json();
};

/**
 * Sends a single booking object to the backend for classification.
 * @param {IBooking} booking - The booking data to classify.
 * @returns {Promise<IClassificationResult>} A promise that resolves to the classification result.
 */
export const classifySingleBooking = async (
  booking: IBooking
): Promise<IClassificationResult> => {
  const response = await fetch(`${API_BASE_URL}/classify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to classify booking.");
  }
  return response.json();
};

/**
 * Sends a batch of booking objects to the backend for classification.
 * @param {IBooking[]} bookings - The array of bookings to classify.
 * @returns {Promise<IClassificationResult[]>} A promise that resolves to the list of classification results.
 */
export const classifyBatch = async (
  bookings: IBooking[]
): Promise<IClassificationResult[]> => {
  const response = await fetch(`${API_BASE_URL}/classify-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookings),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to classify batch.");
  }
  return response.json();
};
