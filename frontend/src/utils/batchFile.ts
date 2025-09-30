import { IBooking } from '../ts/interfaces';

interface ReadOptions {
  maxBytes?: number;
  maxRecords?: number;
}

/**
 * Normalize a raw unknown booking shape into an IBooking-like object.
 * Returns null if it cannot produce something minimally useful (needs description).
 */
function normalize(raw: any): IBooking | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.description !== 'string' || !raw.description.trim()) return null;

  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : `BK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const products: string[] = Array.isArray(raw.products)
    ? Array.from(
        new Set(
          raw.products
            .filter((p: any) => typeof p === 'string')
            .map((p: string) => p.trim())
            .filter(Boolean)
        )
      )
    : [];

  const bookingDate =
    typeof raw.bookingDate === 'string' && raw.bookingDate.trim()
      ? raw.bookingDate
      : new Date().toISOString();

  const customerName =
    typeof raw.customerName === 'string' && raw.customerName.trim()
      ? raw.customerName.trim()
      : 'Unknown';

  const internalNotes =
    typeof raw.internalNotes === 'string' ? raw.internalNotes.trim() : '';

  // companyName retained only if string
  const companyName =
    typeof raw.companyName === 'string' && raw.companyName.trim()
      ? raw.companyName.trim()
      : undefined;

  return {
    // If the project interface marks some as optional no problem, extra safety:
    id,
    customerName,
    companyName,
    bookingDate,
    description: raw.description,
    products,
    internalNotes
  } as IBooking;
}

/**
 * Reads, validates and parses a JSON batch file into normalized bookings.
 * Throws descriptive errors for invalid conditions.
 */
export async function readBatchBookings(
  file: File,
  options: ReadOptions = {}
): Promise<IBooking[]> {
  const {
    /**
     * IF MORE SIZE NEEDED, ADJUST maxBytes DEFAULT (10MB)
     */
    maxBytes = 50 * 1024 * 1024, // 10MB default
    maxRecords = 150_000
  } = options;

  // Basic file type checks
  const isJsonName = /\.json$/i.test(file.name);
  const isJsonMime =
    file.type === 'application/json' || file.type === ''; // some browsers leave mime empty
  if (!isJsonName || !isJsonMime) {
    throw new Error('Only .json files are allowed.');
  }

  if (file.size > maxBytes) {
    throw new Error(
      `JSON file too large (max ${(maxBytes / 1024 / 1024).toFixed(1)} MB).`
    );
  }

  let parsed: unknown;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON syntax.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Batch file must contain a JSON array.');
  }

  if (parsed.length === 0) {
    throw new Error('Array is empty.');
  }

  if (parsed.length > maxRecords) {
    throw new Error(
      `Too many records (${parsed.length}). Limit is ${maxRecords}.`
    );
  }

  const bookings: IBooking[] = [];
  let discarded = 0;

  for (const raw of parsed) {
    const norm = normalize(raw);
    if (norm) bookings.push(norm);
    else discarded++;
  }

  if (bookings.length === 0) {
    throw new Error(
      'No valid booking objects found (need at least a description).'
    );
  }

  // If many were discarded, inform via error? Prefer success with fewer:
  if (discarded > 0) {
    // We signal via console; UI can decide if needed.
    // eslint-disable-next-line no-console
    console.warn(
      `readBatchBookings: discarded ${discarded} malformed record(s); accepted ${bookings.length}.`
    );
  }

  return bookings;
}