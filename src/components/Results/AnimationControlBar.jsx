import { X, Pause, Play } from 'lucide-react';

/**
 * Floating animation control bar
 * Appears during sequential reveal animation
 * Provides Cancel and Stop/Resume controls
 */
export default function AnimationControlBar({
  isAnimating = false,
  isPaused = false,
  onPause = () => {},
  onResume = () => {},
  onCancel = () => {},
}) {
  if (!isAnimating) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-3 bg-gray-800 border-2 border-emerald-500 rounded-full px-6 py-3 shadow-2xl">
      {/* Stop/Resume Button */}
      <button
        onClick={isPaused ? onResume : onPause}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-full transition-colors"
        title={isPaused ? 'Resume animation' : 'Pause animation'}
      >
        {isPaused ? (
          <>
            <Play className="w-4 h-4" />
            Resume
          </>
        ) : (
          <>
            <Pause className="w-4 h-4" />
            Pause
          </>
        )}
      </button>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
        title="Dismiss results and close"
      >
        <X className="w-4 h-4" />
        Dismiss
      </button>
    </div>
  );
}
