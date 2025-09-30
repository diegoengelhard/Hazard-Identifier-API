import { useEffect, useState, useRef } from 'react';
import { getProducts, classifySingleBooking, classifyBatch } from '../api/classificationApi';
import { IBooking, IClassificationResult, IProduct } from '../ts/interfaces';
import SingleClassificationForm from '../components/SingleClassificationForm';
import ClassificationStatus from '../components/ClassificationStatus';
import HistoryPanel from '../components/HistoryPanel';

function DashboardPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [latestResult, setLatestResult] = useState<IClassificationResult | null>(null);
  const [history, setHistory] = useState<IClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage keys for localStorage
  const STORAGE_KEYS = {
    products: 'id_products',
    history: 'id_history',
    latest: 'id_latest'
  } as const;

  useEffect(() => {
    try {
      const cachedProducts = localStorage.getItem(STORAGE_KEYS.products);
      if (cachedProducts) setProducts(JSON.parse(cachedProducts));

      const cachedHistory = localStorage.getItem(STORAGE_KEYS.history);
      if (cachedHistory) setHistory(JSON.parse(cachedHistory));

      const cachedLatest = localStorage.getItem(STORAGE_KEYS.latest);
      if (cachedLatest) setLatestResult(JSON.parse(cachedLatest));
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  useEffect(() => {
    // Fetch products on mount
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);
      } catch (err) {
        setError('Could not load product list. Please check if the API is running.');
      }
    };
    fetchProducts();
  }, []);

  const handleSingleClassification = async (bookingData: IBooking) => {
    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);

    // Call the API to classify the booking
    try {
      const result = await classifySingleBooking(bookingData);
      setLatestResult(result);
      setHistory(prev => {
        const next = [result, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
        localStorage.setItem(STORAGE_KEYS.latest, JSON.stringify(result));
        return next;
      });
    } catch (err: any) {
      setError('An unknown error occurred.');
      setLatestResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const bookings: IBooking[] = JSON.parse(text);
      const results = await classifyBatch(bookings);
      
      setHistory(prev => {
        const next = [...results, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
        if (results[0]) localStorage.setItem(STORAGE_KEYS.latest, JSON.stringify(results[0]));
        return next;
      });

      if (results.length > 0) setLatestResult(results[0]);
    } catch (err: any) {
      setError('Failed to process batch file. Ensure it is a valid JSON array of bookings.');
      setLatestResult(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearCachedData = () => {
    localStorage.removeItem(STORAGE_KEYS.history);
    localStorage.removeItem(STORAGE_KEYS.latest);
    setHistory([]);
    setLatestResult(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <SingleClassificationForm
            products={products}
            onSubmit={handleSingleClassification}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ClassificationStatus
            latestResult={latestResult}
            history={history}
            onClassifyBatchClick={() => fileInputRef.current?.click()}
          />
          <HistoryPanel history={history} />
        </div>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBatchFileChange}
        accept=".json"
        className="hidden"
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;