import { Trophy } from 'lucide-react';

export default function WinnerDisplay({ winners, prizeLabel, timestamp }) {
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
      <div className="text-center space-y-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayWinners.map((winner, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 rounded-xl p-8 text-center animate-fadeIn hover:shadow-lg hover:shadow-emerald-500/50 transition-shadow flex flex-col items-center justify-center min-h-40"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="text-4xl font-black text-emerald-400 mb-3">
              #{index + 1}
            </div>
            <p className="font-bold text-gray-100 px-2 text-sm sm:text-base md:text-lg break-words whitespace-normal">
              {winner.name || winner}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <p className="text-2xl font-bold text-cyan-400">
          {displayWinners.length} {displayWinners.length === 1 ? 'Winner' : 'Winners'}
        </p>
      </div>
    </div>
  );
}
