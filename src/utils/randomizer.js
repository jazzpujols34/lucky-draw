/**
 * Fisher-Yates shuffle algorithm
 * Creates a shuffled copy of an array
 */
export const fisherYatesShuffle = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/**
 * Draw N unique winners from available candidates
 */
export const drawWinners = (candidates, count) => {
  if (count > candidates.length) {
    throw new Error(`Cannot draw ${count} winners from ${candidates.length} candidates`);
  }

  const shuffled = fisherYatesShuffle(candidates);
  return shuffled.slice(0, count);
};
