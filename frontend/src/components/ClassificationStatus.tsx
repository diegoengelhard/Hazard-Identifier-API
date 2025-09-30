import StatCard from './StatCard';
import { IClassificationResult } from '../ts/interfaces';

interface Props {
  latestResult: IClassificationResult | null;
  stats: {
    totalClassified: number;
    totalHazardous: number;
    hazardRate: number; 
    successRate: number;
    accuracyPercent: number;
    labeledTotal: number;
  };
  onClassifyBatchClick: () => void;
}

function ClassificationStatus({ latestResult, stats, onClassifyBatchClick }: Props) {
  const lastLabel = latestResult
    ? (latestResult.isHazardous ? 'Hazardous' : 'Non-Hazardous')
    : '—';
  const lastScore = latestResult ? latestResult.score.toFixed(1) : '0.0';
  const showAccuracy = stats.labeledTotal > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Status & Batch Classification</h2>

      {/* BIG CARD: Success Rate (Non-Hazardous) */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white flex flex-col items-center justify-center shadow">
        <p className="uppercase tracking-wider text-xs font-semibold opacity-80 mb-1">
          Success Rate (Non-Hazardous)
        </p>
        <div className="text-5xl font-extrabold leading-tight">
          {stats.successRate.toFixed(1)}
          <span className="text-lg align-top ml-1">%</span>
        </div>
        <p className="text-xs mt-2 opacity-90">
          Non-Hazardous: {(stats.totalClassified - stats.totalHazardous).toLocaleString()} / {stats.totalClassified.toLocaleString()}
        </p>
        <p className="text-xs mt-1 opacity-90">
          Hazard Rate: {stats.hazardRate.toFixed(1)}%
        </p>
        {showAccuracy ? (
          <p className="text-xs mt-1 opacity-90">
            Accuracy (labeled): {stats.accuracyPercent.toFixed(1)}% ({stats.labeledTotal.toLocaleString()} labeled)
          </p>
        ) : (
          <p className="text-[11px] mt-2 opacity-70">
            Provide batch JSON to compute accuracy.
          </p>
        )}
      </div>

      {/* SMALL STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Classified" value={stats.totalClassified.toLocaleString()} subtle />
        <StatCard label="Total Hazardous" value={stats.totalHazardous.toLocaleString()} subtle />
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