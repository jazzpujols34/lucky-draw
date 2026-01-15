import { useState, useEffect, useRef } from 'react';

/**
 * Hook for sequential winner reveal animation with countdown
 *
 * Simple, robust implementation without complex async loops
 */
export const useSequentialReveal = (
  winners,
  { enabled = false, speed = 800, isReplacement = false, onComplete = null } = {}
) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [countdown, setCountdown] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Cleanup function
  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
  };

  // Main animation effect
  useEffect(() => {
    // Early exit if no winners or animation disabled
    if (!winners || winners.length === 0 || !enabled || isReplacement) {
      setIsAnimating(false);
      setCountdown(null);
      if (winners && winners.length > 0 && !enabled && !isReplacement) {
        // Show all instantly if animation disabled
        setCurrentIndex(winners.length - 1);
      }
      return;
    }

    // Clear any pending timers
    clearAllTimers();

    // Animation sequence
    let currentWinnerIndex = 0;
    let isAlive = true;

    const revealNextWinner = () => {
      if (!isAlive || currentWinnerIndex >= winners.length) {
        if (isAlive) {
          setIsAnimating(false);
          setCountdown(null);
          if (onComplete) onComplete();
        }
        return;
      }

      // Start countdown: 3 → 2 → 1
      let countdownNum = 3;
      const countdownTimer = () => {
        if (!isAlive) return;

        if (countdownNum > 0) {
          setCountdown(countdownNum);
          countdownNum--;
          countdownTimerRef.current = setTimeout(countdownTimer, speed * 0.3);
        } else {
          // Countdown complete, reveal winner
          setCountdown(null);
          setCurrentIndex(currentWinnerIndex);
          currentWinnerIndex++;

          // Wait before next winner
          timerRef.current = setTimeout(revealNextWinner, speed * 0.4);
        }
      };

      countdownTimer();
    };

    // Start animation
    setIsAnimating(true);
    revealNextWinner();

    // Cleanup
    return () => {
      isAlive = false;
      clearAllTimers();
    };
  }, [winners, enabled, speed, isReplacement, onComplete]);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);
  const reset = () => {
    clearAllTimers();
    setCurrentIndex(-1);
    setCountdown(null);
    setIsAnimating(false);
    setIsPaused(false);
  };

  // Return revealed winners
  const revealedWinners =
    currentIndex >= 0 ? winners.slice(0, currentIndex + 1) : [];

  return {
    revealedWinners,
    countdown,
    isAnimating,
    isPaused,
    pause,
    resume,
    reset,
  };
};
