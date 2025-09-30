/**
 * Large Batch Mock Data Generator
 * --------------------------------
 * Generates a large JSON array of booking objects for load / batch testing.
 *
 * Usage (from repo root):
 *   node backend/src/utils/generate-data.js --count=50000
 *
 * Usage (from backend/ directory):
 *   node src/utils/generate-data.js --count=50000
 *
 * Or via npm script (after adding "gen:data"): 
 *   npm run gen:data -- --count=50000
 *
 * Output: backend/src/mocks/batchMockTestData*.json (auto-incremented)
 */
(async () => {
  const fs = require('fs');
  const path = require('path');
  const { faker } = await import('@faker-js/faker'); // ESM import

  // Directories
  const BACKEND_DIR = path.join(__dirname, '..', '..');          // .../backend
  const MOCKS_DIR = path.join(BACKEND_DIR, 'src', 'mocks');
  const LEXICON_PATH = path.join(BACKEND_DIR, 'src', 'utils', 'lexicon.json');

  // Load lexicon
  const lexicon = JSON.parse(fs.readFileSync(LEXICON_PATH, 'utf8'));

  // Args / config
  const argCount = process.argv.find(a => a.startsWith('--count='));
  const NUM_BOOKINGS = argCount ? parseInt(argCount.split('=')[1], 10) : 100000;
  if (!Number.isInteger(NUM_BOOKINGS) || NUM_BOOKINGS <= 0) {
    console.error('Invalid --count value. Use a positive integer.');
    process.exit(1);
  }

  const BASE_FILENAME = 'batchMockTestData';
  const EXT = '.json';

  if (!fs.existsSync(MOCKS_DIR)) fs.mkdirSync(MOCKS_DIR, { recursive: true });

  function nextFilename() {
    const base = path.join(MOCKS_DIR, BASE_FILENAME + EXT);
    if (!fs.existsSync(base)) return base;
    let i = 1;
    while (true) {
      const suffix = String(i).padStart(2, '0');
      const candidate = path.join(MOCKS_DIR, `${BASE_FILENAME}-${suffix}${EXT}`);
      if (!fs.existsSync(candidate)) return candidate;
      i++;
    }
  }

  const OUTPUT_FILEPATH = nextFilename();
  console.log(`Generating ${NUM_BOOKINGS.toLocaleString()} mock bookings -> ${path.relative(process.cwd(), OUTPUT_FILEPATH)}`);

  const bookings = [];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  for (let i = 1; i <= NUM_BOOKINGS; i++) {
    const hazProducts = lexicon.products.filter(p => p.isHazardous);
    const nonHazProducts = lexicon.products.filter(p => !p.isHazardous);
    const hazardousProduct = pick(hazProducts);
    const nonHazardousProduct = pick(nonHazProducts);
    const randomKeyword = pick(lexicon.keywords);
    const randomBigram = pick(lexicon.bigrams);

    const isHazardousAttempt = Math.random() < 0.4;

    let description = 'Customer is clearing out their garage. Contains old furniture and boxes.';
    let products = [nonHazardousProduct?.displayName].filter(Boolean);
    let internalNotes = 'No specific issues mentioned.';

    if (isHazardousAttempt && hazardousProduct) {
      description = `Contains various items including ${randomKeyword.term}. Also found some ${randomBigram.phrase}.`;
      products.push(hazardousProduct.displayName);
      internalNotes = `Client mentioned items like ${pick(lexicon.keywords).term}.`;
    }

    if (isHazardousAttempt && Math.random() < 0.2 && lexicon.negations?.length) {
      const negation = pick(lexicon.negations);
      description += ` However, it is a ${negation.term} version.`;
    }

    bookings.push({
      id: `BK-${faker.string.uuid()}`,
      customerName: faker.person.fullName(),
      companyName: Math.random() < 0.5 ? faker.company.name() : '',
      bookingDate: faker.date.past({ years: 1 }).toISOString(),
      description,
      products,
      internalNotes,
    });

    if (i % 10000 === 0) {
      process.stdout.write(`Progress: ${((i / NUM_BOOKINGS) * 100).toFixed(1)}% (${i.toLocaleString()})\r`);
    }
  }

  fs.writeFileSync(OUTPUT_FILEPATH, JSON.stringify(bookings, null, 2), 'utf8');
  console.log(`\n✅ Success! Generated ${bookings.length.toLocaleString()} bookings in: ${OUTPUT_FILEPATH}`);
})();