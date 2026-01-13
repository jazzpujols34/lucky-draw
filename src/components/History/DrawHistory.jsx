import { Clock, Download, Trash2, RotateCcw } from 'lucide-react';
import { downloadHistoryCSV } from '../../utils/exporter';

export default function DrawHistory({
  history,
  onClearHistory,
  onUndoLastDraw,
}) {
  if (history.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Clock className="w-12 h-12 mx-auto text-gray-500 mb-3" />
        <p className="text-gray-400">
          No draws yet. Perform a draw to see history here.
        </p>
      </div>
    );
  }

  const handleExportHistory = () => {
    downloadHistoryCSV(history);
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-pink-400">Draw History</h3>
        <div className="text-lg font-bold text-gray-300">
          {history.length} draw{history.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((draw, index) => (
          <div
            key={index}
            className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">Draw #{history.length - index}</p>
                <p className="text-sm text-gray-400">
                  {new Date(draw.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <span className="bg-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                {draw.winners.length} winner{draw.winners.length !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-gray-300">
              <span className="font-semibold">Prize:</span> {draw.prizeName || draw.prizeLabel || 'N/A'}
            </p>

            <div className="text-sm space-y-2">
              {/* Get final valid winners only (status === 'won') */}
              {(() => {
                const finalWinners = draw.winners.filter(
                  w => (typeof w === 'string') || (w.status === 'won')
                );
                const replacementWinners = draw.winners.filter(
                  w => typeof w !== 'string' && w.isReplacement
                );
                const forfeitedWinners = draw.winners.filter(
                  w => typeof w !== 'string' && w.status === 'forfeited'
                );

                return (
                  <>
                    {/* Final Valid Winners */}
                    <div>
                      <p className="font-semibold text-emerald-400 mb-1">
                        Final Winners ({finalWinners.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {finalWinners.map((winner, i) => (
                          <span
                            key={i}
                            className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs"
                          >
                            {typeof winner === 'string' ? winner : winner.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Forfeit → Replacement Mapping */}
                    {draw.redrawHistory && draw.redrawHistory.length > 0 && (
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <p className="font-semibold text-yellow-400 mb-1">
                          Forfeit Mapping ({draw.redrawHistory.length}):
                        </p>
                        <div className="space-y-1">
                          {draw.redrawHistory.map((entry, i) => (
                            <div
                              key={i}
                              className="bg-gray-700/50 rounded px-2 py-1 text-xs text-gray-300 flex items-center gap-2"
                            >
                              <span className="text-red-400 line-through">
                                {entry.forfeitedWinner}
                              </span>
                              <span className="text-gray-500">→</span>
                              <span className="text-blue-400">
                                {entry.replacementWinner}
                              </span>
                              {entry.reason && (
                                <span className="text-gray-500 italic ml-auto">
                                  ({entry.reason})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Forfeited Winners Indicator */}
                    {forfeitedWinners.length > 0 && (
                      <div className="text-gray-500 text-xs italic">
                        Note: {forfeitedWinners.length} winner{forfeitedWinners.length !== 1 ? 's' : ''} forfeited (replaced above)
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={handleExportHistory}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export All
        </button>

        <button
          onClick={onUndoLastDraw}
          className="btn-secondary flex items-center justify-center gap-2 px-6"
          title="Undo the last draw and restore winners to the pool"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={onClearHistory}
          className="btn-secondary flex items-center justify-center gap-2 px-6 hover:bg-red-600"
          title="Clear all history"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
