import { IClassificationResult } from '../ts/interfaces';
import StatCard from './StatCard';

interface Props {
  latestResult: IClassificationResult | null;
  history: IClassificationResult[];
  onClassifyBatchClick: () => void;
}

function ClassificationStatus({ latestResult, history, onClassifyBatchClick }: Props) {
  const totalClassified = history.length;
  const totalHazardous = history.filter(h => h.isHazardous).length;

  const resultBgColor = latestResult?.isHazardous ? 'bg-red-500' : 'bg-green-500';
  const resultTextColor = 'text-white';
  const resultText = latestResult ? (latestResult.isHazardous ? 'Hazardous' : 'Non-Hazardous') : 'Awaiting Classification';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Status & Batch Classification</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg text-center flex flex-col justify-center col-span-1 md:col-span-3 ${latestResult ? resultBgColor : 'bg-gray-200'} transition-colors`}>
            <h3 className={`text-2xl font-bold ${latestResult ? resultTextColor : 'text-gray-600'}`}>{resultText}</h3>
            {latestResult && (
                <p className={`text-sm ${resultTextColor} opacity-90 mt-1`}>
                    Booking ID: {latestResult.bookingId} &middot; Score: {latestResult.score.toFixed(1)}
                </p>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard label="Total Classified Today" value={totalClassified.toString()} />
          <StatCard label="Total Hazardous" value={totalHazardous.toString()} />
      </div>

      <div className="flex-grow"></div>

      <button
        onClick={onClassifyBatchClick}
        className="w-full justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Upload to Classify Batch
      </button>
    </div>
  );
};

export default ClassificationStatus;