import { useState, useCallback } from 'react';
import { drawWinners } from '../utils/randomizer';

export const useLuckyDraw = () => {
  const [candidatePool, setCandidatePool] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [history, setHistory] = useState([]);

  // Set candidates from input (manual or file)
  const setCandidates = useCallback((candidates) => {
    setCandidatePool(candidates);
    setAvailableCandidates(candidates);
    setCurrentDraw(null);
  }, []);

  // Perform a draw
  const performDraw = useCallback((count, prizeLabel = '') => {
    if (availableCandidates.length === 0) {
      throw new Error('No available candidates to draw from');
    }

    if (count > availableCandidates.length) {
      throw new Error(
        `Cannot draw ${count} winners from ${availableCandidates.length} available candidates`
      );
    }

    // Draw winners
    const winners = drawWinners(availableCandidates, count);

    // Create draw record
    const drawRecord = {
      winners,
      prizeLabel,
      timestamp: new Date(),
    };

    // Update state
    setCurrentDraw(drawRecord);

    // Remove winners from available pool
    const newAvailable = availableCandidates.filter(c => !winners.includes(c));
    setAvailableCandidates(newAvailable);

    // Add to history
    setHistory([...history, drawRecord]);

    return drawRecord;
  }, [availableCandidates, history]);

  // Reset available pool (but keep history)
  const resetPool = useCallback(() => {
    setAvailableCandidates(candidatePool);
    setCurrentDraw(null);
  }, [candidatePool]);

  // Clear everything
  const clearAll = useCallback(() => {
    setCandidatePool([]);
    setAvailableCandidates([]);
    setCurrentDraw(null);
    setHistory([]);
  }, []);

  // Clear history only
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Undo last draw
  const undoLastDraw = useCallback(() => {
    if (history.length === 0) {
      throw new Error('No draws to undo');
    }

    const lastDraw = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setHistory(newHistory);
    setCurrentDraw(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null);

    // Restore winners to available pool
    const restoredAvailable = Array.from(new Set([...availableCandidates, ...lastDraw.winners]));
    setAvailableCandidates(restoredAvailable);
  }, [history, availableCandidates]);

  return {
    // State
    candidatePool,
    availableCandidates,
    currentDraw,
    history,

    // Actions
    setCandidates,
    performDraw,
    resetPool,
    clearAll,
    clearHistory,
    undoLastDraw,

    // Computed
    candidateCount: candidatePool.length,
    availableCount: availableCandidates.length,
    historyCount: history.length,
  };
};
