import { useEffect, useState, useRef } from 'react';
import { getProducts, classifySingleBooking, classifyBatch, getSession } from '../api/classificationApi';
import { IBooking, IClassificationResult, IProduct } from '../ts/interfaces';
import { readBatchBookings } from '../utils/batchFile';
import SingleClassificationForm from '../components/SingleClassificationForm';
import ClassificationStatus from '../components/ClassificationStatus';
import HistoryPanel from '../components/HistoryPanel';
import { toast } from 'react-toastify';

interface StatsState {
  totalClassified: number;
  totalHazardous: number;
  cumulativeScore: number;  
  labeledTotal: number;   
  labeledCorrect: number;       
}

function DashboardPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [latestResult, setLatestResult] = useState<IClassificationResult | null>(null);
  const [history, setHistory] = useState<IClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsState>({
    totalClassified: 0,
    totalHazardous: 0,
    cumulativeScore: 0,
    labeledTotal: 0,
    labeledCorrect: 0
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
    (async () => {
      try {
        const { sessionId } = await getSession();
        const storedSession = localStorage.getItem(STORAGE_KEYS.session);
        if (storedSession && storedSession !== sessionId) {
          localStorage.removeItem(STORAGE_KEYS.history);
            localStorage.removeItem(STORAGE_KEYS.latest);
          localStorage.removeItem(STORAGE_KEYS.stats);
        }
        localStorage.setItem(STORAGE_KEYS.session, sessionId);

        try {
          const products = localStorage.getItem(STORAGE_KEYS.products);
          if (products) setProducts(JSON.parse(products));
          const history = localStorage.getItem(STORAGE_KEYS.history);
          if (history) setHistory(JSON.parse(history));
          const latest = localStorage.getItem(STORAGE_KEYS.latest);
          if (latest) setLatestResult(JSON.parse(latest));
          const stats = localStorage.getItem(STORAGE_KEYS.stats);
          if (stats) setStats(JSON.parse(stats));
        } catch {
          // Ignore parse errors
        }
      } catch {
        // Fallback offline cache if session endpoint fails
        try {
          const products = localStorage.getItem(STORAGE_KEYS.products);
          if (products) setProducts(JSON.parse(products));
          const history = localStorage.getItem(STORAGE_KEYS.history);
          if (history) setHistory(JSON.parse(history));
          const latest = localStorage.getItem(STORAGE_KEYS.latest);
          if (latest) setLatestResult(JSON.parse(latest));
          const stats = localStorage.getItem(STORAGE_KEYS.stats);
          if (stats) setStats(JSON.parse(stats));
        } catch {
          // Ignore parse errors
        }
      }
    })();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(productList));
      } catch {
        toast.error('Could not load product list. Please check if the API is running.');
      }
    };
    fetchProducts();
  }, []);

  // Update stats for single or multiple results (no label handling)
  const updateStatsBasic = (results: IClassificationResult[]) => {
    const hazardousInBatch = results.reduce((acc, r) => acc + (r.isHazardous ? 1 : 0), 0);
    const scoreSum = results.reduce((acc, r) => acc + r.score, 0);
    setStats(prev => {
      const next: StatsState = {
        ...prev,
        totalClassified: prev.totalClassified + results.length,
        totalHazardous: prev.totalHazardous + hazardousInBatch,
        cumulativeScore: prev.cumulativeScore + scoreSum
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

      setHistory(prev => {
        const next = [result, ...prev].slice(0, 100);
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
        localStorage.setItem(STORAGE_KEYS.latest, JSON.stringify(result));
        return next;
      });

      updateStatsBasic([result]);
    } catch {
      toast.error('An unknown error occurred.');
      setLatestResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const bookings = await readBatchBookings(file);
      const results = await classifyBatch(bookings as IBooking[]);

      // Build map for expected labels
      const expectedMap = new Map<string, boolean>();
      (bookings as IBooking[]).forEach(b => {
        if (typeof b.expectedIsHazardous === 'boolean' && b.id) {
          expectedMap.set(b.id, b.expectedIsHazardous);
        }
      });

      // Count labeled correctness
      let labeledTotal = 0;
      let labeledCorrect = 0;
      results.forEach(r => {
        if (expectedMap.has(r.bookingId)) {
          labeledTotal++;
          if (expectedMap.get(r.bookingId) === r.isHazardous) labeledCorrect++;
        }
      });

      setHistory(prev => {
        const next = [...results, ...prev].slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
        if (results[0]) localStorage.setItem(STORAGE_KEYS.latest, JSON.stringify(results[0]));
        return next;
      });

      if (results.length > 0) setLatestResult(results[0]);

      const hazardousInBatch = results.reduce((acc, r) => acc + (r.isHazardous ? 1 : 0), 0);
      const scoreSum = results.reduce((acc, r) => acc + r.score, 0);

      setStats(prev => {
        const next: StatsState = {
          totalClassified: prev.totalClassified + results.length,
          totalHazardous: prev.totalHazardous + hazardousInBatch,
          cumulativeScore: prev.cumulativeScore + scoreSum,
          labeledTotal: prev.labeledTotal + labeledTotal,
          labeledCorrect: prev.labeledCorrect + labeledCorrect
        };
        localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(next));
        return next;
      });

      toast.success(`Successfully classified ${results.length.toLocaleString()} bookings.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process batch file.');
      setLatestResult(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearCachedData = () => {
    localStorage.removeItem(STORAGE_KEYS.history);
    localStorage.removeItem(STORAGE_KEYS.latest);
    localStorage.removeItem(STORAGE_KEYS.stats);
    setHistory([]);
    setLatestResult(null);
    setStats({ totalClassified: 0, totalHazardous: 0, cumulativeScore: 0, labeledTotal: 0, labeledCorrect: 0 });
    toast.info('Session stats cleared.');
  };

  const hazardRate = stats.totalClassified
    ? (stats.totalHazardous / stats.totalClassified) * 100
    : 0;

  const successRate = stats.totalClassified
    ? ((stats.totalClassified - stats.totalHazardous) / stats.totalClassified) * 100
    : 0; // Non-Hazardous percentage (Success Rate)

  const accuracyPercent = stats.labeledTotal
    ? (stats.labeledCorrect / stats.labeledTotal) * 100
    : 0;

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
            stats={{
              totalClassified: stats.totalClassified,
              totalHazardous: stats.totalHazardous,
              hazardRate,
              successRate,        // NEW: pass success (non-hazardous) rate
              accuracyPercent,
              labeledTotal: stats.labeledTotal
            }}
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
}

export default DashboardPage;