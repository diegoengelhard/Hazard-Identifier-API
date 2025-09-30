import { IClassificationResult } from '../ts/interfaces';

interface Props {
  history: IClassificationResult[];
}

function HistoryPanel({ history }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Classifications</h2>
      <div className="flex-grow overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No classifications yet.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map(result => (
                <tr key={`${result.bookingId}-${Math.random()}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{result.bookingId}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      result.isHazardous ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {result.isHazardous ? 'Hazardous' : 'Non-Hazardous'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{result.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;