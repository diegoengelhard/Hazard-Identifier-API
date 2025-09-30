import StatCard from './StatCard';
import { IClassificationResult } from '../ts/interfaces';

interface Props {
  latestResult: IClassificationResult | null;
  history: IClassificationResult[];
  stats: { totalClassified: number; totalHazardous: number }; 
  onClassifyBatchClick: () => void;
}

function ClassificationStatus({ latestResult, stats, onClassifyBatchClick }: Props) {
  // Decide panel appearance
  const resultBgColor = latestResult
    ? (latestResult.isHazardous ? 'bg-red-500' : 'bg-green-500')
    : 'bg-gray-200';
  const resultTextColor = latestResult ? 'text-white' : 'text-gray-600';
  const resultText = latestResult
    ? (latestResult.isHazardous ? 'Hazardous' : 'Non-Hazardous')
    : 'Awaiting Classification';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Status & Batch Classification</h2>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg text-center flex flex-col justify-center ${resultBgColor} transition-colors`}>
        <h3 className={`text-2xl font-bold ${resultTextColor}`}>{resultText}</h3>
        {latestResult && (
          <p className={`text-sm ${resultTextColor} opacity-90 mt-1`}>
            Booking ID: {latestResult.bookingId} &middot; Score: {latestResult.score.toFixed(1)}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Total Classified Today" value={stats.totalClassified.toLocaleString()} />
        <StatCard label="Total Hazardous" value={stats.totalHazardous.toLocaleString()} />
      </div>

      <div className="flex-grow" />

      {/* Batch Upload Trigger */}
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