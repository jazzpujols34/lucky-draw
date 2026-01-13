import { X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function ForfeitManager({
  isOpen,
  onClose,
  draw,
  onMarkForfeited,
  onRedraw,
}) {
  const [selectedForfeits, setSelectedForfeits] = useState(new Set());
  const [reason, setReason] = useState('');
  const [showRedrawConfirm, setShowRedrawConfirm] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !draw) return null;

  // Get active winners (not forfeited, not replacements)
  const activeWinners = draw.winners.filter(
    w => w.status === 'won' && !w.isReplacement
  );

  // Get forfeited winners
  const forfeitedWinners = draw.winners.filter(w => w.status === 'forfeited');

  const handleToggleForfeit = (winnerName) => {
    const newSelected = new Set(selectedForfeits);
    if (newSelected.has(winnerName)) {
      newSelected.delete(winnerName);
    } else {
      newSelected.add(winnerName);
    }
    setSelectedForfeits(newSelected);
    setError('');
  };

  const handleMarkForfeited = () => {
    if (selectedForfeits.size === 0) {
      setError('Please select at least one winner to forfeit');
      return;
    }

    try {
      selectedForfeits.forEach(winnerName => {
        onMarkForfeited(draw.id, winnerName, reason);
      });
      setSelectedForfeits(new Set());
      setReason('');
      setError('');
      // Close after marking
      setTimeout(() => onClose(), 300);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRedraw = () => {
    if (forfeitedWinners.length === 0) {
      setError('No forfeited winners to redraw');
      return;
    }

    try {
      onRedraw(draw.id, reason);
      setShowRedrawConfirm(false);
      setReason('');
      setError('');
      // Close after redraw
      setTimeout(() => onClose(), 300);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-emerald-500 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-400">Manage Forfeits</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs for Mark Forfeited / Redraw */}
        {!showRedrawConfirm ? (
          <>
            {/* Mark as Forfeited Section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-semibold text-gray-300">
                Mark Winners as Forfeited
              </h3>

              {/* Active Winners Checkboxes */}
              {activeWinners.length > 0 ? (
                <div className="bg-gray-800 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                  {activeWinners.map(winner => (
                    <label
                      key={winner.name}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedForfeits.has(winner.name)}
                        onChange={() => handleToggleForfeit(winner.name)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-100 font-medium">{winner.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                  No active winners available
                </div>
              )}

              {/* Selected count */}
              {selectedForfeits.size > 0 && (
                <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-3">
                  <p className="text-emerald-400 font-semibold">
                    {selectedForfeits.size} winner{selectedForfeits.size !== 1 ? 's' : ''} selected for forfeit
                  </p>
                </div>
              )}

              {/* Reason (optional) */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Forfeit Reason (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Absent, Donated prize, Declined"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Mark Forfeited Button */}
              <button
                onClick={handleMarkForfeited}
                disabled={selectedForfeits.size === 0}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  selectedForfeits.size > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Mark {selectedForfeits.size > 0 ? selectedForfeits.size : ''} as Forfeited
              </button>
            </div>

            {/* Redraw Section */}
            {forfeitedWinners.length > 0 && (
              <div className="border-t border-gray-700 pt-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-300">
                  Redraw for Forfeited Slots
                </h3>

                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-300 mb-3">
                    <span className="font-semibold text-yellow-400">
                      {forfeitedWinners.length} forfeit{forfeitedWinners.length !== 1 ? 's' : ''}
                    </span>{' '}
                    need redraw:
                  </p>
                  <div className="space-y-2">
                    {forfeitedWinners.map(winner => (
                      <div
                        key={winner.name}
                        className="text-sm text-gray-400 line-through"
                      >
                        {winner.name}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowRedrawConfirm(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Proceed to Redraw ({forfeitedWinners.length} slot{forfeitedWinners.length !== 1 ? 's' : ''})
                </button>
              </div>
            )}
          </>
        ) : (
          // Redraw Confirmation
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 font-semibold mb-1">Ready to Redraw</p>
                <p className="text-blue-200 text-sm">
                  This will draw {forfeitedWinners.length} new winner{forfeitedWinners.length !== 1 ? 's' : ''} to replace the forfeited slot
                  {forfeitedWinners.length !== 1 ? 's' : ''}. New winners will be added to the winner list.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRedrawConfirm(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRedraw}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Confirm Redraw
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
