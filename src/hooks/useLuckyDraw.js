import { useState, useCallback, useEffect } from 'react';
import { drawWinners } from '../utils/randomizer';
import { loadPrizes, savePrizes, loadHistory, saveHistory, loadCandidates, saveCandidates } from '../utils/storage';

export const useLuckyDraw = () => {
  const [candidatePool, setCandidatePool] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [history, setHistory] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [nextDrawNumber, setNextDrawNumber] = useState(1);

  // Load prizes from localStorage on mount
  useEffect(() => {
    const savedPrizes = loadPrizes();
    if (savedPrizes && savedPrizes.length > 0) {
      setPrizes(savedPrizes);
    }
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = loadHistory();
    if (savedHistory && savedHistory.length > 0) {
      setHistory(savedHistory);
      // Calculate next draw number from history
      const maxDrawNumber = Math.max(
        0,
        ...savedHistory.map(record => record.drawNumber || 0)
      );
      setNextDrawNumber(maxDrawNumber + 1);
    }
  }, []);

  // Save prizes to localStorage whenever they change
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Save prizes to localStorage whenever they change
  useEffect(() => {
    savePrizes(prizes);
  }, [prizes]);

  // Set candidates from input (manual or file)
  const setCandidates = useCallback((candidates) => {
    setCandidatePool(candidates);
    setAvailableCandidates(candidates);
    setCurrentDraw(null);
  }, []);

  // Perform a draw
  const performDraw = useCallback((count, prizeLabel = '', prizeId = null) => {
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
      id: crypto.randomUUID(),
      prizeId: prizeId || null,
      prizeName: prizeLabel,
      expectedCount: count,
      winners: winners.map(name => ({
        name,
        status: 'won',
        forfeitedAt: null,
        replacedBy: null,
        isReplacement: false,
        originalWinner: null,
      })),
      timestamp: Date.now(),
      drawNumber: nextDrawNumber,
      redrawHistory: [],
    };

    // Update state
    setCurrentDraw(drawRecord);

    // Remove winners from available pool
    const newAvailable = availableCandidates.filter(c => !winners.includes(c));
    setAvailableCandidates(newAvailable);

    // Add to history
    setHistory([...history, drawRecord]);

    // Increment draw number for next draw
    setNextDrawNumber(nextDrawNumber + 1);

    // Mark prize as drawn if prizeId provided
    if (prizeId) {
      setPrizes(prevPrizes =>
        prevPrizes.map(p =>
          p.id === prizeId ? { ...p, status: 'drawn' } : p
        )
      );
    }

    return drawRecord;
  }, [availableCandidates, history, nextDrawNumber]);

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

    // Restore winners to available pool (handle both old and new winner formats)
    const winnerNames = lastDraw.winners.map(w => typeof w === 'string' ? w : w.name);
    const restoredAvailable = Array.from(new Set([...availableCandidates, ...winnerNames]));
    setAvailableCandidates(restoredAvailable);

    // Reset prize status if it was drawn
    if (lastDraw.prizeId) {
      setPrizes(prevPrizes =>
        prevPrizes.map(p =>
          p.id === lastDraw.prizeId ? { ...p, status: 'active' } : p
        )
      );
    }

    // Decrement draw number
    setNextDrawNumber(prev => Math.max(1, prev - 1));
  }, [history, availableCandidates]);

  // Prize management methods
  const addPrize = useCallback((name, winnerCount, description = '') => {
    const newPrize = {
      id: crypto.randomUUID(),
      name,
      winnerCount,
      description,
      createdAt: Date.now(),
      status: 'active',
    };
    setPrizes([...prizes, newPrize]);
    return newPrize.id;
  }, [prizes]);

  const updatePrize = useCallback((id, updates) => {
    setPrizes(prevPrizes =>
      prevPrizes.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    );
  }, []);

  const deletePrize = useCallback((id) => {
    const prize = prizes.find(p => p.id === id);
    if (prize && prize.status === 'drawn') {
      throw new Error('Cannot delete a drawn prize');
    }
    setPrizes(prevPrizes => prevPrizes.filter(p => p.id !== id));
  }, [prizes]);

  // Load last event candidates from localStorage
  const loadLastEventCandidates = useCallback(() => {
    const lastCandidates = loadCandidates();
    if (lastCandidates && lastCandidates.length > 0) {
      setCandidates(lastCandidates);
      return true;
    }
    return false;
  }, []);

  // Save current candidates to localStorage
  const saveCurrentCandidates = useCallback(() => {
    if (candidatePool && candidatePool.length > 0) {
      saveCandidates(candidatePool);
      return true;
    }
    return false;
  }, [candidatePool]);

  // Forfeit methods
  const markWinnerAsForfeited = useCallback((drawId, winnerName, reason = '') => {
    setHistory(prevHistory =>
      prevHistory.map(draw => {
        if (draw.id === drawId) {
          const updatedDraw = {
            ...draw,
            winners: draw.winners.map(w =>
              w.name === winnerName
                ? { ...w, status: 'forfeited', forfeitedAt: Date.now(), reason }
                : w
            ),
          };
          // Also update currentDraw if it's the current draw
          if (currentDraw && currentDraw.id === drawId) {
            setCurrentDraw(updatedDraw);
          }
          return updatedDraw;
        }
        return draw;
      })
    );
  }, [currentDraw]);

  const redrawForfeitedSlots = useCallback((drawId, reason = '') => {
    const drawIndex = history.findIndex(d => d.id === drawId);
    if (drawIndex === -1) {
      throw new Error('Draw not found');
    }

    const draw = history[drawIndex];

    // Find forfeited winners
    const forfeited = draw.winners.filter(w => w.status === 'forfeited');
    const countToRedraw = forfeited.length;

    if (countToRedraw === 0) {
      throw new Error('No forfeited winners to redraw');
    }

    // Build exclusion list
    const exclude = new Set();

    // Exclude all current winners (won or forfeited)
    draw.winners.forEach(w => exclude.add(w.name));

    // Exclude anyone in redraw history (prevent re-forfeit loop)
    if (draw.redrawHistory) {
      draw.redrawHistory.forEach(entry => {
        exclude.add(entry.forfeitedWinner);
        exclude.add(entry.replacementWinner);
      });
    }

    // Filter candidate pool
    const eligibleCandidates = availableCandidates.filter(
      name => !exclude.has(name)
    );

    // Validate sufficient candidates
    if (eligibleCandidates.length < countToRedraw) {
      throw new Error(
        `Not enough candidates (need ${countToRedraw}, have ${eligibleCandidates.length})`
      );
    }

    // Draw new winners using Fisher-Yates
    const newWinnersList = drawWinners(eligibleCandidates, countToRedraw);

    // Create replacement winner objects
    const replacements = newWinnersList.map((name, idx) => ({
      name,
      status: 'won',
      forfeitedAt: null,
      replacedBy: null,
      isReplacement: true,
      originalWinner: forfeited[idx].name,
    }));

    // Create redraw history entries
    const redrawEntries = forfeited.map((original, idx) => ({
      drawId,
      forfeitedWinner: original.name,
      replacementWinner: replacements[idx].name,
      timestamp: Date.now(),
      reason,
    }));

    // Update draw record
    setHistory(prevHistory =>
      prevHistory.map((draw, idx) => {
        if (draw.id === drawId) {
          return {
            ...draw,
            winners: [...draw.winners, ...replacements],
            redrawHistory: [...(draw.redrawHistory || []), ...redrawEntries],
          };
        }
        return draw;
      })
    );
  }, [history, availableCandidates]);

  const undoLastForfeit = useCallback((drawId) => {
    const drawIndex = history.findIndex(d => d.id === drawId);
    if (drawIndex === -1) {
      throw new Error('Draw not found');
    }

    const draw = history[drawIndex];
    if (!draw.redrawHistory || draw.redrawHistory.length === 0) {
      throw new Error('No forfeits to undo');
    }

    // Get the last redraw entry
    const lastRedraw = draw.redrawHistory[draw.redrawHistory.length - 1];

    setHistory(prevHistory =>
      prevHistory.map(d => {
        if (d.id === drawId) {
          // Remove the replacement winner
          const updatedWinners = d.winners.filter(
            w => w.name !== lastRedraw.replacementWinner
          );

          // Restore forfeited winner to won status
          const finalWinners = updatedWinners.map(w =>
            w.name === lastRedraw.forfeitedWinner
              ? { ...w, status: 'won', forfeitedAt: null, replacedBy: null, reason: '' }
              : w
          );

          // Remove last redraw entry
          const updatedRedrawHistory = d.redrawHistory.slice(0, -1);

          return {
            ...d,
            winners: finalWinners,
            redrawHistory: updatedRedrawHistory,
          };
        }
        return d;
      })
    );

    // Restore replacement winner to available candidates
    setAvailableCandidates(prev => [
      ...prev,
      lastRedraw.replacementWinner,
    ]);
  }, [history]);

  return {
    // State
    candidatePool,
    availableCandidates,
    currentDraw,
    history,
    prizes,
    nextDrawNumber,

    // Actions
    setCandidates,
    performDraw,
    resetPool,
    clearAll,
    clearHistory,
    undoLastDraw,

    // Prize Management
    addPrize,
    updatePrize,
    deletePrize,
    loadLastEventCandidates,
    saveCurrentCandidates,

    // Forfeit & Redraw
    markWinnerAsForfeited,
    redrawForfeitedSlots,
    undoLastForfeit,

    // Computed
    candidateCount: candidatePool.length,
    availableCount: availableCandidates.length,
    historyCount: history.length,
    prizeCount: prizes.length,
  };
};
