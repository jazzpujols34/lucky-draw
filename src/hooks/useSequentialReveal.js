import { useState, useEffect, useRef, useCallback } from 'react';

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
  const isPausedRef = useRef(false);

  // Cleanup function to clear timers
  const clearAnimation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Sleep helper for async animation loop
  const sleep = (ms) =>
    new Promise((resolve) => {
      timerRef.current = setTimeout(resolve, ms);
    });

  // Pause animation
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    clearAnimation();
  }, []);

  // Resume animation from current index
  const resume = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    // Continue animation from next winner
    if (indexRef.current < winners.length) {
      continueReveal(indexRef.current);
    }
  }, [winners]);

  // Reset animation
  const reset = useCallback(() => {
    clearAnimation();
    shouldContinueRef.current = false;
    setCurrentIndex(-1);
    setCountdown(null);
    setIsAnimating(false);
    setIsPaused(false);
    setPhase('idle');
    isPausedRef.current = false;
    indexRef.current = 0;
  }, []);

  // Main reveal loop
  const continueReveal = useCallback(
    async (startIndex) => {
      // Early exit if conditions not met
      if (!shouldContinueRef.current || startIndex >= winners.length) {
        setIsAnimating(false);
        setPhase('complete');
        if (onComplete) onComplete();
        return;
      }

      for (let i = startIndex; i < winners.length && shouldContinueRef.current; i++) {
        // Check pause status
        while (isPausedRef.current && shouldContinueRef.current) {
          await sleep(100); // Check pause every 100ms
        }

        if (!shouldContinueRef.current) break;

        // Countdown phase: 3 → 2 → 1
        for (let count = 3; count > 0; count--) {
          if (!shouldContinueRef.current || isPausedRef.current) break;
          setCountdown(count);
          setPhase('countdown');
          await sleep(speed * 0.3); // 30% of speed per countdown tick
        }

        if (!shouldContinueRef.current || isPausedRef.current) break;

        // Reveal phase
        setCountdown(null);
        setPhase('reveal');
        setCurrentIndex(i);
        indexRef.current = i;
        await sleep(speed * 0.4); // 40% of speed for reveal hold
      }

      setIsAnimating(false);
      setCountdown(null);
      setPhase('complete');
      if (onComplete) onComplete();
    },
    [winners.length, speed, onComplete]
  );

  // Main animation effect
  useEffect(() => {
    // Early exit if no winners or animation disabled
    if (!winners || winners.length === 0) {
      reset();
      return;
    }

    // Exit if animation disabled or is replacement
    if (!enabled || isReplacement) {
      // Show all winners instantly
      setCurrentIndex(winners.length - 1);
      setPhase('complete');
      setIsAnimating(false);
      setCountdown(null);
      return;
    }

    // Now we can safely start animation
    shouldContinueRef.current = true;
    isPausedRef.current = false;

    setIsAnimating(true);
    indexRef.current = 0;
    continueReveal(0);

    // Cleanup on unmount or dependency change
    return () => {
      shouldContinueRef.current = false;
      clearAnimation();
    };
  }, [winners, enabled, speed, isReplacement, continueReveal, reset]);

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
