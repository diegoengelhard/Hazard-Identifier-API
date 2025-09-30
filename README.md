# Hazard-Identifier-API

A Node.js API for programmatic waste classification. The Hazard Identifier uses a weighted scoring system and a [custom lexicon](backend/src/utils/lexicon.json) to analyze booking details (descriptions, products, notes) and flag potentially hazardous materials. A lightweight solution designed for high accuracy and easy integration.
lexicon and a weighted scoring system.

---

## Getting Started

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3000`.

#### (Optional) Generate Large Batch Mock Dataset
You can generate a large synthetic batch file for load / batch testing.

From repository `root`:
```bash
# Default (100,000)
node backend/src/utils/generate-data.js
# Custom count
node backend/src/utils/generate-data.js --count=25000
```

From inside `backend/` directory:
```bash
node src/utils/generate-data.js --count=50000
```

Using npm script (inside backend):
```bash
npm run gen:data -- --count=75000
```

Output files go to [backend/src/mocks](backend/src/mocks)

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---
## Frontend Features

The user interface provides two main functionalities for interacting with the classification engine:

* **Single Classification:** An intuitive form where you can input the details of a single booking (`description`, `internal notes`, and `products`) to receive an instant classification.
* **Batch Classification:** A feature that allows you to upload a JSON file containing an array of booking objects. The system processes the entire file and displays the classification results for all bookings in the history table. Demo File can be [found here](frontend/src/mocks/batchMockTestData.json).

---
## API Endpoints

The backend exposes three main endpoints. You can test them using any API client like Postman or `curl`.

### 1. Get Product List

Fetches the standardized list of products used to populate the frontend dropdown.

* **Endpoint:** `GET /api/identifier/products`
* **Test with:**
    ```bash
    curl http://localhost:3000/api/identifier/products
    ```

### 2. Classify Single Booking

Classifies a single booking object.

* **Endpoint:** `POST /api/identifier/classify`
* **Request Body (`IBooking`):**
    * `id` (string): **Required**. A unique identifier for the booking.
    * `description` (string): **Required**. The customer's description of the items.
    * `products` (string[]): **Required**. An array of product names selected from the standardized list.
    * `internalNotes` (string): **Required**. Additional notes from staff.
    * `customerName` (string): *Optional*.
    * `companyName` (string): *Optional*.
    * `bookingDate` (string): *Optional*.
* **Test with:**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
    -d '{ "id": "BK-TEST-01", "description": "Old paint cans", "products": ["Paint (Oil-Based)"], "internalNotes": "Client mentioned solvents" }' \
    http://localhost:3000/api/identifier/classify
    ```

### 3. Classify Booking Batch

Classifies an array of booking objects.

* **Endpoint:** `POST /api/identifier/classify-batch`
* **Request Body:** An array of `IBooking` objects, each following the structure described above.
* **Test with:**
    ```bash
    curl -X POST -H "Content-Type: application/json" \
    -d '[{ "id": "BK-TEST-01", "description": "Paint cans", "products": ["Paint (Oil-Based)"], "internalNotes": "" }, { "id": "BK-TEST-02", "description": "Old office furniture", "products": [], "internalNotes": "No batteries" }]' \
    http://localhost:3000/api/identifier/classify-batch
    ```