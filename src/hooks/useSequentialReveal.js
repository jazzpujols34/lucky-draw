import { useState, useEffect, useRef } from 'react';

/**
 * Hook for sequential winner reveal animation with countdown
 *
 * Orchestrates animation phases: countdown(3-2-1) → reveal → repeat
 * Supports pause/resume and configurable speed
 *
 * @param {Array} winners - Array of winners to reveal sequentially
 * @param {Object} config - Configuration object
 * @param {boolean} config.enabled - Enable/disable animation
 * @param {number} config.speed - Speed in ms per winner (400/800/1200)
 * @param {boolean} config.isReplacement - Skip animation if true (for redraw)
 * @param {Function} config.onComplete - Callback when animation finishes
 *
 * @returns {Object} Animation state and control methods
 */
export const useSequentialReveal = (
  winners,
  { enabled = false, speed = 800, isReplacement = false, onComplete = null } = {}
) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [countdown, setCountdown] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState('idle');

  const timerRef = useRef(null);
  const shouldContinueRef = useRef(true);
  const indexRef = useRef(0);

  // Cleanup function to clear timers
  const clearAnimation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Sleep helper for async animation loop
  const sleep = (ms) => new Promise(resolve => {
    timerRef.current = setTimeout(resolve, ms);
  });

  // Pause animation
  const pause = () => {
    setIsPaused(true);
    clearAnimation();
  };

  // Resume animation from current index
  const resume = () => {
    setIsPaused(false);
    // Restart animation loop from current position
    continueAnimation(indexRef.current);
  };

  // Continue animation from specific index
  const continueAnimation = async (startIndex) => {
    if (!shouldContinueRef.current || startIndex >= winners.length) {
      setIsAnimating(false);
      setPhase('complete');
      if (onComplete) onComplete();
      return;
    }

    setIsAnimating(true);
    indexRef.current = startIndex;

    for (let i = startIndex; i < winners.length && shouldContinueRef.current; i++) {
      if (isPaused) break;

      // Countdown phase: 3 → 2 → 1
      for (let count = 3; count > 0; count--) {
        if (!shouldContinueRef.current || isPaused) break;
        setCountdown(count);
        setPhase('countdown');
        await sleep(speed * 0.3); // 30% of speed per countdown tick
      }

      if (!shouldContinueRef.current || isPaused) break;

      // Reveal phase
      setCountdown(null);
      setPhase('reveal');
      setCurrentIndex(i);
      await sleep(speed * 0.4); // 40% of speed for reveal hold

      indexRef.current = i + 1;
    }

    setIsAnimating(false);
    setPhase('complete');
    if (onComplete) onComplete();
  };

  // Reset animation
  const reset = () => {
    clearAnimation();
    setCurrentIndex(-1);
    setCountdown(null);
    setIsAnimating(false);
    setIsPaused(false);
    setPhase('idle');
    shouldContinueRef.current = true;
    indexRef.current = 0;
  };

  // Main animation effect
  useEffect(() => {
    shouldContinueRef.current = true;

    // Disable animation if: disabled, is replacement, or no winners
    if (!enabled || isReplacement || !winners || winners.length === 0) {
      if (winners && winners.length > 0) {
        // Show all winners instantly
        setCurrentIndex(winners.length - 1);
        setPhase('complete');
        setIsAnimating(false);
      }
      return;
    }

    // Start animation from beginning
    continueAnimation(0);

    // Cleanup on unmount or dependency change
    return () => {
      shouldContinueRef.current = false;
      clearAnimation();
    };
  }, [winners, enabled, speed, isReplacement]);

  // Return revealed winners (slice from 0 to currentIndex + 1)
  const revealedWinners =
    currentIndex >= 0 && currentIndex < winners.length
      ? winners.slice(0, currentIndex + 1)
      : currentIndex >= winners.length
      ? winners
      : [];

  return {
    // State
    revealedWinners,
    countdown,
    isAnimating,
    isPaused,
    phase,
    currentIndex,

    // Controls
    pause,
    resume,
    reset,
  };
};
