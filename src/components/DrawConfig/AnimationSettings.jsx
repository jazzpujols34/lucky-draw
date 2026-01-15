import { Zap } from 'lucide-react';

/**
 * Animation Settings Component
 *
 * Provides toggle for sequential reveal animation and speed slider
 * Matches existing card design with gray-800 background and emerald accents
 */
export default function AnimationSettings({
  enabled = false,
  speed = 2000,
  onToggle = () => {},
  onSpeedChange = () => {},
}) {
  const getSpeedLabel = (ms) => {
    if (ms <= 1800) return 'Fast (1800ms)';
    if (ms <= 2000) return 'Normal (2000ms)';
    return 'Slow (2300ms)';
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Animation Settings</h3>
      </div>

      {/* Toggle Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-5 h-5 accent-emerald-500 cursor-pointer"
        />
        <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
          Enable Sequential Reveal Animation
        </span>
      </label>

      {/* Speed Slider (visible only if enabled) */}
      {enabled && (
        <div className="space-y-3 border-t border-gray-700 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="speed-slider" className="text-sm font-semibold text-gray-300">
              Animation Speed
            </label>
            <span className="text-sm font-bold text-cyan-400 bg-gray-700 px-3 py-1 rounded">
              {getSpeedLabel(speed)}
            </span>
          </div>

          <input
            id="speed-slider"
            type="range"
            min="1800"
            max="2300"
            step="250"
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            style={{
              background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${
                ((speed - 1800) / 500) * 100
              }%, rgb(55, 65, 81) ${((speed - 1800) / 500) * 100}%, rgb(55, 65, 81) 100%)`,
            }}
          />

          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>Fast</span>
            <span>Normal</span>
            <span>Slow</span>
          </div>

          {/* Speed Description */}
          <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded border border-gray-700">
            <p>
              {speed === 1800 && '🚀 Fast reveal - recommended for large winner counts'}
              {speed === 2000 && '⚡ Normal speed - balanced for drama and timing'}
              {speed === 2300 && '🎭 Slow reveal - maximum suspense and engagement'}
            </p>
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded border border-gray-700 mt-2">
        <p>
          {enabled
            ? `Sequential reveal: ${speed}ms per winner. Toggle off to show all winners instantly.`
            : 'Enable animation to reveal winners one-by-one with countdown.'}
        </p>
      </div>
    </div>
  );
}
