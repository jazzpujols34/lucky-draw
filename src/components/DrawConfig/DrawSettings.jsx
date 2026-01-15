import { useState, useEffect } from 'react';

export default function DrawSettings({
  prizeLabel,
  winnerCount,
  availableCount,
  onPrizeLabelChange,
  onWinnerCountChange,
  prizes = [],
  selectedPrizeId = null,
  onPrizeSelect,
}) {
  const [mode, setMode] = useState(selectedPrizeId ? 'predefined' : 'custom');
  const maxWinners = Math.min(availableCount, 50);
  const activePrizes = prizes.filter(p => p.status === 'active');
  const selectedPrize = prizes.find(p => p.id === selectedPrizeId);

  // Sync mode with selectedPrizeId when it changes
  useEffect(() => {
    if (selectedPrizeId) {
      setMode('predefined');
    } else {
      setMode('custom');
    }
  }, [selectedPrizeId]);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (newMode === 'custom') {
      // Clear prize selection when switching to custom
      onPrizeSelect(null);
    }
  };

  const handlePrizeChange = (e) => {
    const prizeId = e.target.value;
    const prize = prizes.find(p => p.id === prizeId);
    if (prize) {
      onPrizeSelect(prizeId, prize.name, prize.winnerCount);
    }
  };

  return (
    <div className="card p-6 space-y-6">
      <h3 className="text-2xl font-bold text-cyan-400">Draw Settings</h3>

      {/* Mode Selector */}
      {activePrizes.length > 0 && (
        <div className="flex gap-2 border-b border-gray-700 pb-4">
          <button
            onClick={() => handleModeSwitch('predefined')}
            className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-colors ${
              mode === 'predefined'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Select Prize
          </button>
          <button
            onClick={() => handleModeSwitch('custom')}
            className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-colors ${
              mode === 'custom'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Custom Draw
          </button>
        </div>
      )}

      {/* Predefined Prize Mode */}
      {mode === 'predefined' && activePrizes.length > 0 && (
        <div className="space-y-3">
          <label className="block">
            <p className="text-sm font-semibold mb-2">Choose a Prize</p>
            <select
              value={selectedPrizeId || ''}
              onChange={handlePrizeChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">-- Select a prize --</option>
              {activePrizes.map((prize) => (
                <option key={prize.id} value={prize.id}>
                  {prize.name} ({prize.winnerCount} winner
                  {prize.winnerCount !== 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </label>

          {selectedPrize && (
            <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-3">
              <div className="text-sm text-emerald-400 font-semibold">Selected:</div>
              <div className="text-gray-100 font-bold">{selectedPrize.name}</div>
              <div className="text-xs text-gray-400">
                {selectedPrize.winnerCount} winner
                {selectedPrize.winnerCount !== 1 ? 's' : ''}
                {selectedPrize.description && ` • ${selectedPrize.description}`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Draw Mode */}
      {mode === 'custom' && (
        <>
          <div className="space-y-3">
            <label className="block">
              <p className="text-sm font-semibold mb-2">Prize Label</p>
              <input
                type="text"
                value={prizeLabel}
                onChange={(e) => onPrizeLabelChange(e.target.value)}
                placeholder="e.g., iPhone 15, Laptop, Voucher"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className="block">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">Number of Winners</p>
                <p className="text-lg font-bold text-emerald-400">{winnerCount}</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="1"
                  max={maxWinners}
                  value={winnerCount}
                  onChange={(e) => onWinnerCountChange(parseInt(e.target.value, 10))}
                  className="flex-1 h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <input
                  type="number"
                  min="1"
                  max={maxWinners}
                  value={winnerCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= maxWinners) {
                      onWinnerCountChange(val);
                    }
                  }}
                  className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500 text-center"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Available: {availableCount} | Max: {maxWinners}
              </p>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
