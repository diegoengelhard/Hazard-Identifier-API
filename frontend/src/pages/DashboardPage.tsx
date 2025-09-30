import { useEffect, useState, useRef } from 'react';
import { getProducts, classifySingleBooking, classifyBatch, getSession } from '../api/classificationApi';
import { IBooking, IClassificationResult, IProduct } from '../ts/interfaces';
import { readBatchBookings } from '../utils/batchFile';
import SingleClassificationForm from '../components/SingleClassificationForm';
import ClassificationStatus from '../components/ClassificationStatus';
import HistoryPanel from '../components/HistoryPanel';
import { toast } from 'react-toastify';

function DashboardPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [latestResult, setLatestResult] = useState<IClassificationResult | null>(null);
  const [history, setHistory] = useState<IClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Persistent cumulative stats separate from limited history
  const [stats, setStats] = useState<{ totalClassified: number; totalHazardous: number }>({
    totalClassified: 0,
    totalHazardous: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage keys for localStorage
  const STORAGE_KEYS = {
    products: 'id_products',
    history: 'id_history',
    latest: 'id_latest',
    session: 'id_session',
    stats: 'id_stats'
  } as const;

  useEffect(() => {
    // Wrap logic to allow async session fetch
    (async () => {
      try {
        // Fetch current backend session id (changes on server restart)
        const { sessionId } = await getSession();
        const storedSession = localStorage.getItem(STORAGE_KEYS.session);

        // If backend restarted (session changed) invalidate volatile cached data
        if (storedSession && storedSession !== sessionId) {
          localStorage.removeItem(STORAGE_KEYS.history);
          localStorage.removeItem(STORAGE_KEYS.latest);
          localStorage.removeItem(STORAGE_KEYS.stats);
        }
        localStorage.setItem(STORAGE_KEYS.session, sessionId);

        // Load cached data after session validation
        try {
          const cachedProducts = localStorage.getItem(STORAGE_KEYS.products);
          if (cachedProducts) setProducts(JSON.parse(cachedProducts));

          const cachedHistory = localStorage.getItem(STORAGE_KEYS.history);
          if (cachedHistory) setHistory(JSON.parse(cachedHistory));

          const cachedLatest = localStorage.getItem(STORAGE_KEYS.latest);
          if (cachedLatest) setLatestResult(JSON.parse(cachedLatest));

          const cachedStats = localStorage.getItem(STORAGE_KEYS.stats);
          if (cachedStats) setStats(JSON.parse(cachedStats));
        } catch {
          // Ignore JSON parse errors
        }
      } catch {
        // If session endpoint fails, fallback to prior behavior (best effort)
        try {
          const cachedProducts = localStorage.getItem(STORAGE_KEYS.products);
          if (cachedProducts) setProducts(JSON.parse(cachedProducts));

          const cachedHistory = localStorage.getItem(STORAGE_KEYS.history);
          if (cachedHistory) setHistory(JSON.parse(cachedHistory));

          const cachedLatest = localStorage.getItem(STORAGE_KEYS.latest);
          if (cachedLatest) setLatestResult(JSON.parse(cachedLatest));

          const cachedStats = localStorage.getItem(STORAGE_KEYS.stats);
          if (cachedStats) setStats(JSON.parse(cachedStats));
        } catch {
          // Ignore JSON parse errors
        }
      }
    })();
  }, []);

  useEffect(() => {
    // Fetch products on mount
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);
        // Added: persist product list (stable across reloads & restarts)
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(productList));
      } catch {
        toast.error('Could not load product list. Please check if the API is running.');
      }
    };
    fetchProducts();
  }, []);

  const updateStats = (batchResults: IClassificationResult[]) => {
    const hazardousInBatch = batchResults.reduce((acc, r) => acc + (r.isHazardous ? 1 : 0), 0);
    setStats(prev => {
      const next = {
        totalClassified: prev.totalClassified + batchResults.length,
        totalHazardous: prev.totalHazardous + hazardousInBatch
      };
      localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(next));
      return next;
    });
  };

  const handleSingleClassification = async (bookingData: IBooking) => {
    setIsLoading(true);
    try {
      const result = await classifySingleBooking(bookingData);
      setLatestResult(result);

      // Update limited history (show last 100)
      setHistory(prev => {
        const next = [result, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
        localStorage.setItem(STORAGE_KEYS.latest, JSON.stringify(result));
        return next;
      });

      // Update cumulative stats
      updateStats([result]);
    } catch {
      toast.error('An unknown error occurred.');
      setLatestResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch file input change
  const handleBatchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Use higher size limit & normalized parsing (readBatchBookings applies the limit internally)
      const bookings = await readBatchBookings(file);
      const results = await classifyBatch(bookings);

      // Update limited history (prepend batch results then slice)
      setHistory(prev => {
        const next = [...results, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
        if (results[0]) localStorage.setItem(STORAGE_KEYS.latest, JSON.stringify(results[0]));
        return next;
      });

      if (results.length > 0) setLatestResult(results[0]);

      // Update cumulative stats
      updateStats(results);

      toast.success(`Successfully classified ${results.length.toLocaleString()} bookings.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process batch file.');
      setLatestResult(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Clear cached data and reset state
  const clearCachedData = () => {
    localStorage.removeItem(STORAGE_KEYS.history);
    localStorage.removeItem(STORAGE_KEYS.latest);
    localStorage.removeItem(STORAGE_KEYS.stats);
    setHistory([]);
    setLatestResult(null);
    setStats({ totalClassified: 0, totalHazardous: 0 });
    toast.info('Session stats cleared.');
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
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset session stats? This will clear recent classifications.')) {
                clearCachedData();
              }
            }}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold tracking-wide text-red-700 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition"
          >
            <span aria-hidden className="text-red-500">↺</span>
            <span>Reset Session (Clear Stats)</span>
          </button>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ClassificationStatus
            latestResult={latestResult}
            history={history}
            stats={stats}
            onClassifyBatchClick={() => fileInputRef.current?.click()}
          />
          <HistoryPanel history={history} />
        </div>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBatchFileChange}
        accept="application/json,.json"
        className="hidden"
      />
    </div>
  );
};

export default DashboardPage;