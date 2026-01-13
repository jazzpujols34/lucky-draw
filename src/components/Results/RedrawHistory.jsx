import { ArrowRight, RotateCcw } from 'lucide-react';

export default function RedrawHistory({ draw, onUndoLastForfeit }) {
  if (!draw.redrawHistory || draw.redrawHistory.length === 0) {
    return null;
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-yellow-400">Redraw History</h4>
        {draw.redrawHistory.length > 0 && (
          <button
            onClick={() => onUndoLastForfeit(draw.id)}
            className="btn-secondary flex items-center gap-2 px-3 py-2 text-sm"
            title="Undo the last forfeit and redraw"
          >
            <RotateCcw className="w-4 h-4" />
            Undo
          </button>
        )}
      </div>

      <div className="space-y-3">
        {draw.redrawHistory.map((entry, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg p-4 space-y-2"
          >
            {/* Forfeit → Replacement */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Forfeited</p>
                <p className="text-gray-100 font-semibold line-through">
                  {entry.forfeitedWinner}
                </p>
              </div>

              <ArrowRight className="w-5 h-5 text-emerald-400 flex-shrink-0" />

              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Replacement</p>
                <p className="text-emerald-300 font-semibold">
                  {entry.replacementWinner}
                </p>
              </div>
            </div>

            {/* Timestamp and Reason */}
            <div className="flex justify-between items-start gap-3 text-xs text-gray-500 border-t border-gray-700 pt-2">
              <p>{new Date(entry.timestamp).toLocaleTimeString()}</p>
              {entry.reason && (
                <p className="text-gray-400 italic">Reason: {entry.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-800/50 rounded-lg p-3 text-center text-sm text-gray-400">
        <p>
          <span className="font-semibold text-yellow-400">
            {draw.redrawHistory.length}
          </span>{' '}
          redraw{draw.redrawHistory.length !== 1 ? 's' : ''} performed
        </p>
      </div>
    </div>
  );
}
