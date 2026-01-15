import { useMemo } from 'react';
import { Trophy, Edit2, Pause, Play } from 'lucide-react';
import { useSequentialReveal } from '../../hooks/useSequentialReveal';

export default function WinnerDisplay({
  winners,
  prizeLabel,
  timestamp,
  onManageForfeits,
  animationEnabled = false,
  animationSpeed = 800,
}) {
  if (!winners || winners.length === 0) {
    return null;
  }

  // Handle both old (string[]) and new (WinnerObject[]) formats
  const normalizedWinners = useMemo(
    () => winners.map(w =>
      typeof w === 'string' ? { name: w, status: 'won' } : w
    ),
    [winners]
  );

  // Display all winners with status 'won' (both original and replacement)
  // Exclude only forfeited winners from display
  const displayWinners = useMemo(
    () => normalizedWinners.filter(w => w.status === 'won'),
    [normalizedWinners]
  );

  // Detect if any winners are replacements (skip animation for redraw)
  const hasReplacements = useMemo(
    () => normalizedWinners.some(w => w.isReplacement),
    [normalizedWinners]
  );

  // Use sequential reveal hook
  const {
    revealedWinners,
    countdown,
    isAnimating,
    isPaused,
    pause,
    resume,
  } = useSequentialReveal(displayWinners, {
    enabled: animationEnabled,
    speed: animationSpeed,
    isReplacement: hasReplacements,
  });

  // Determine which winners to render
  const winnersToRender = isAnimating ? revealedWinners : displayWinners;

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

      {/* Countdown Overlay */}
      {countdown !== null && isAnimating && (
        <div
          key={countdown}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
        >
          <div className="text-[200px] font-black text-yellow-400 animate-countdown-pop">
            {countdown}
          </div>
        </div>
      )}

      {/* Animation Controls */}
      {isAnimating && (
        <div className="flex justify-center mb-4">
          <button
            onClick={isPaused ? resume : pause}
            className="btn-secondary flex items-center gap-2 px-6 py-3"
            title={isPaused ? 'Resume animation' : 'Stop animation'}
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" />
                Resume Animation
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                Stop Animation
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {winnersToRender.map((winner, index) => {
          // Determine card styling based on winner type
          let borderColor = 'border-emerald-500/50';
          let bgColor = 'from-emerald-500/20 to-cyan-500/20';
          let textColor = 'text-emerald-400';
          let nameColor = 'text-gray-100';
          let shadowColor = 'hover:shadow-emerald-500/50';
          let badgeText = 'Valid';
          let badgeColor = 'bg-emerald-600';

          // Determine card type
          if (winner.isReplacement) {
            // Replacement winner (redraw)
            borderColor = 'border-blue-500/50';
            bgColor = 'from-blue-500/20 to-cyan-500/20';
            textColor = 'text-blue-400';
            nameColor = 'text-blue-100';
            shadowColor = 'hover:shadow-blue-500/50';
            badgeText = 'Replacement';
            badgeColor = 'bg-blue-600';
          }

          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${bgColor} border-2 ${borderColor} rounded-xl p-8 text-center ${
                isAnimating ? 'animate-winner-glow-in' : 'animate-fadeIn'
              } hover:shadow-lg ${shadowColor} transition-shadow flex flex-col items-center justify-center min-h-40 relative`}
              style={{
                animationDelay: isAnimating ? '0s' : `${index * 0.1}s`,
              }}
            >
              {/* Status badge - shows winner type */}
              <div className={`absolute top-3 right-3 ${badgeColor} text-white text-xs px-2 py-1 rounded`}>
                {badgeText}
              </div>

              {/* Position number */}
              <div className={`text-4xl font-black ${textColor} mb-3`}>
                #{index + 1}
              </div>

              {/* Winner name */}
              <p className={`font-bold ${nameColor} px-2 text-sm sm:text-base md:text-lg break-words whitespace-normal`}>
                {winner.name || winner}
              </p>

              {/* Replacement info - show who they replaced */}
              {winner.isReplacement && winner.originalWinner && (
                <p className="text-xs text-blue-300 mt-2 italic">
                  Replaced: {winner.originalWinner}
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
