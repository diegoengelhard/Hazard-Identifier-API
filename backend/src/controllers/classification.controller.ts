import { Request, Response } from "express";
import * as ClassificationService from "../services/classification.service";
import { IBooking } from "../ts/interfaces";

/**
 * Handles the HTTP request to classify a single booking.
 */
export const classifySingle = (req: Request, res: Response): Response => {
  try {
    const booking: IBooking = req.body;

    // Basic input validation.
    if (!booking || !booking.id || !booking.description) {
      return res
        .status(400)
        .json({
          error:
            'Invalid booking data provided. "id" and "description" are required.',
        });
    }

    const result = ClassificationService.classifyBooking(booking);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in classifySingle controller:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

/**
 * Handles the HTTP request to classify a batch of bookings.
 */
export const classifyBatch = (req: Request, res: Response): Response => {
  try {
    const bookings: IBooking[] = req.body;

    // Basic input validation.
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be a non-empty array of bookings." });
    }

    const results = ClassificationService.classifyBookingBatch(bookings);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in classifyBatch controller:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

/**
 * Handles the HTTP request to get the list of standardized products.
 */
export const getProducts = (req: Request, res: Response): Response => {
  try {
    const productList = ClassificationService.getProductList();
    return res.status(200).json(productList);
  } catch (error) {
    console.error("Error in getProducts controller:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
