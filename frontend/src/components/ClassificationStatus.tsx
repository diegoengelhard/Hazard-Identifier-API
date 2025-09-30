import StatCard from './StatCard';
import { IClassificationResult } from '../ts/interfaces';

interface Props {
  latestResult: IClassificationResult | null;
  history: IClassificationResult[];
  // NEW: averageScore now included (raw)
  stats: {
    totalClassified: number;
    totalHazardous: number;
    averageScore: number;
  };
  onClassifyBatchClick: () => void;
}

/**
 * Normalizes a raw score into a 0-100 scale for display.
 * Current heuristic: threshold == 5 (lexicon) is "baseline hazardous".
 * Scale with a soft ceiling (threshold * 3). Adjust if distribution shifts.
 */
function normalizeScoreToPercent(raw: number, threshold = 5): number {
  if (raw <= 0) return 0;
  const softMax = threshold * 3; // heuristic
  return Math.min(100, (raw / softMax) * 100);
}

function ClassificationStatus({ latestResult, stats, onClassifyBatchClick }: Props) {
  const avgPercent = normalizeScoreToPercent(stats.averageScore).toFixed(1);

  // Last classification small panel info
  const lastLabel = latestResult
    ? (latestResult.isHazardous ? 'Hazardous' : 'Non-Hazardous')
    : '—';

  const lastScore = latestResult ? latestResult.score.toFixed(1) : '0.0';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Status & Batch Classification</h2>

      {/* BIG CARD: Average Hazard Score */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white flex flex-col items-center justify-center shadow">
        <p className="uppercase tracking-wider text-xs font-semibold opacity-80 mb-1">Average Hazard Score</p>
        <div className="text-5xl font-extrabold leading-tight">{avgPercent}<span className="text-lg align-top ml-1">%</span></div>
        <p className="text-[11px] mt-1 opacity-70">
          NOTE: This is a heuristic scaling.
        </p>
      </div>

      {/* SMALL STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Classified"
          value={stats.totalClassified.toLocaleString()}
          subtle
        />
        <StatCard
          label="Total Hazardous"
            value={stats.totalHazardous.toLocaleString()}
          subtle
        />
        <StatCard
          label="Last Classification"
          value={lastLabel}
          extra={lastScore}
          tone={latestResult ? (latestResult.isHazardous ? 'danger' : 'success') : 'neutral'}
        />
      </div>

      <div className="flex-grow" />

      <button
        onClick={onClassifyBatchClick}
        className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Upload to Classify Batch
      </button>
    </div>
  );
}

export default ClassificationStatus;