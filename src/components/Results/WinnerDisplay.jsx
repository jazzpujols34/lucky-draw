import { Trophy, Edit2 } from 'lucide-react';

export default function WinnerDisplay({ winners, prizeLabel, timestamp, onManageForfeits }) {
  if (!winners || winners.length === 0) {
    return null;
  }

  // Handle both old (string[]) and new (WinnerObject[]) formats
  const normalizedWinners = winners.map(w =>
    typeof w === 'string' ? { name: w, status: 'won' } : w
  );

  // Filter to show only active winners (exclude forfeited ones)
  const activeWinners = normalizedWinners.filter(w => w.status === 'won' && !w.isReplacement);
  const displayWinners = activeWinners.length > 0 ? activeWinners : normalizedWinners;

  return (
    <div className="card p-8 space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div className="text-center space-y-2 flex-1">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 animate-bounce" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            WINNERS!
          </h2>
          <p className="text-xl font-semibold text-gray-300">
            {prizeLabel || 'Lucky Draw'}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Manage Forfeits Button */}
        {onManageForfeits && (
          <button
            onClick={onManageForfeits}
            className="btn-secondary flex items-center gap-2 px-4 py-2 whitespace-nowrap"
            title="Manage forfeits and redraws"
          >
            <Edit2 className="w-4 h-4" />
            Manage Forfeits
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayWinners.map((winner, index) => {
          // Determine card styling based on status
          let borderColor = 'border-emerald-500/50';
          let bgColor = 'from-emerald-500/20 to-cyan-500/20';
          let textColor = 'text-emerald-400';
          let nameColor = 'text-gray-100';
          let shadowColor = 'hover:shadow-emerald-500/50';

          if (winner.status === 'forfeited') {
            borderColor = 'border-red-500/50';
            bgColor = 'from-red-500/10 to-red-500/10';
            textColor = 'text-red-400';
            nameColor = 'text-gray-400 line-through';
            shadowColor = 'hover:shadow-red-500/50';
          } else if (winner.isReplacement) {
            borderColor = 'border-blue-500/50';
            bgColor = 'from-blue-500/20 to-cyan-500/20';
            textColor = 'text-blue-400';
            nameColor = 'text-blue-100';
            shadowColor = 'hover:shadow-blue-500/50';
          }

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${bgColor} border-2 ${borderColor} rounded-xl p-8 text-center animate-fadeIn hover:shadow-lg ${shadowColor} transition-shadow flex flex-col items-center justify-center min-h-40 relative`}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Status badge */}
              {winner.status === 'forfeited' && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Forfeited
                </div>
              )}
              {winner.isReplacement && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Replacement
                </div>
              )}

              <div className={`text-4xl font-black ${textColor} mb-3`}>
                #{index + 1}
              </div>
              <p className={`font-bold ${nameColor} px-2 text-sm sm:text-base md:text-lg break-words whitespace-normal`}>
                {winner.name || winner}
              </p>

              {/* Replacement info */}
              {winner.isReplacement && winner.originalWinner && (
                <p className="text-xs text-blue-300 mt-2 italic">
                  Replaces {winner.originalWinner}
                </p>
              )}

              {/* Replaced by info */}
              {winner.status === 'forfeited' && winner.replacedBy && (
                <p className="text-xs text-red-300 mt-2 italic">
                  Replaced by {winner.replacedBy}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-cyan-400">
          {displayWinners.length} {displayWinners.length === 1 ? 'Winner' : 'Winners'}
        </p>
      </div>
    </div>
  );
}
