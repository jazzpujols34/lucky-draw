import { RotateCcw, Trash2 } from 'lucide-react';

export default function CandidateList({
  totalCandidates,
  availableCandidates,
  onReset,
  onClear,
}) {
  if (totalCandidates === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-400 text-lg">
          No candidates loaded yet. Please upload a file or enter names manually.
        </p>
      </div>
    );
  }

  const usedCount = totalCandidates - availableCandidates;
  const usagePercent = Math.round((usedCount / totalCandidates) * 100);

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-2xl font-bold text-violet-400">Candidate Pool</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-emerald-400">{totalCandidates}</p>
          <p className="text-sm text-gray-400">Total Candidates</p>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-blue-400">{availableCandidates}</p>
          <p className="text-sm text-gray-400">Available</p>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-orange-400">{usedCount}</p>
          <p className="text-sm text-gray-400">Drawn</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Pool Usage</span>
          <span>{usagePercent}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-orange-500 h-full transition-all duration-300"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          disabled={usedCount === 0}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-5 h-5" />
          Reset Pool
        </button>

        <button
          onClick={onClear}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 hover:bg-red-600"
        >
          <Trash2 className="w-5 h-5" />
          Clear All
        </button>
      </div>
    </div>
  );
}
