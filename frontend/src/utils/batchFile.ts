import { IBooking } from '../ts/interfaces';

interface ReadOptions {
  maxBytes?: number;
}

/**
 * Reads, validates and parses a JSON batch file into bookings.
 * Throws descriptive errors for any invalid condition.
 */
export async function readBatchBookings(file: File, options: ReadOptions = {}): Promise<IBooking[]> {
  const { maxBytes = 200 * 1024 } = options; // 200KB default limit

  const isJsonName = /\.json$/i.test(file.name);
  const isJsonMime = file.type === 'application/json' || file.type === ''; // some browsers empty mime
  if (!isJsonName || !isJsonMime) {
    throw new Error('Only .json files are allowed.');
  }

  if (file.size > maxBytes) {
    throw new Error(`JSON file too large (max ${(maxBytes / 1024).toFixed(0)}KB).`);
  }

  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON syntax.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Batch file must contain a JSON array.');
  }

  const bookings: IBooking[] = (parsed as any[]).filter(b =>
    b &&
    typeof b.id === 'string' &&
    typeof b.description === 'string' &&
    Array.isArray(b.products || []) &&
    typeof b.bookingDate === 'string' &&
    typeof b.customerName === 'string' &&
    typeof b.internalNotes === 'string'
  );

  if (bookings.length === 0) {
    throw new Error('No valid booking objects found.');
  }

  return bookings;
}