export default function DrawSettings({
  prizeLabel,
  winnerCount,
  availableCount,
  onPrizeLabelChange,
  onWinnerCountChange,
}) {
  const maxWinners = Math.min(availableCount, 50);

  return (
    <div className="card p-6 space-y-6">
      <h3 className="text-2xl font-bold text-cyan-400">Draw Settings</h3>

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
    </div>
  );
}
