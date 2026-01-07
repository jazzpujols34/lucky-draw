import { Zap } from 'lucide-react';

export default function DrawButton({
  isEnabled,
  isLoading,
  onDraw,
  error,
}) {
  return (
    <div className="space-y-3">
      <button
        onClick={onDraw}
        disabled={!isEnabled || isLoading}
        className="w-full btn-primary text-2xl font-bold py-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:shadow-xl hover:enabled:shadow-emerald-500/50"
      >
        <Zap className="w-8 h-8" />
        {isLoading ? 'Drawing...' : 'DRAW WINNERS'}
      </button>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!isEnabled && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-blue-300 text-sm">
          Please load candidates first to enable drawing.
        </div>
      )}
    </div>
  );
}
