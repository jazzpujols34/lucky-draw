/**
 * localStorage utilities for persistent data management
 * Handles safe get/set/clear operations with error handling
 */

const STORAGE_KEYS = {
  PRIZES: 'luckyDraw_prizes',
  HISTORY: 'luckyDraw_history',
  CANDIDATES: 'luckyDraw_candidates',
};

/**
 * Safely get data from localStorage
 * @param {string} key - Storage key
 * @returns {any|null} Parsed data or null if not found/invalid
 */
export const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Safely set data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} True if successful, false otherwise
 */
export const setToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error(`localStorage quota exceeded for key: ${key}`);
    } else {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
    return false;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all Lucky Draw data from localStorage
 */
export const clearAllStorage = () => {
  Object.values(STORAGE_KEYS).forEach(removeFromStorage);
};

/**
 * Load prizes from localStorage
 * @returns {Array} Array of Prize objects or empty array
 */
export const loadPrizes = () => {
  return getFromStorage(STORAGE_KEYS.PRIZES) || [];
};

/**
 * Save prizes to localStorage
 * @param {Array} prizes - Array of Prize objects
 * @returns {boolean} Success status
 */
export const savePrizes = (prizes) => {
  return setToStorage(STORAGE_KEYS.PRIZES, prizes);
};

/**
 * Load history from localStorage
 * @returns {Array} Array of DrawRecord objects or empty array
 */
export const loadHistory = () => {
  return getFromStorage(STORAGE_KEYS.HISTORY) || [];
};

/**
 * Save history to localStorage
 * @param {Array} history - Array of DrawRecord objects
 * @returns {boolean} Success status
 */
export const saveHistory = (history) => {
  return setToStorage(STORAGE_KEYS.HISTORY, history);
};

/**
 * Load candidates from localStorage
 * @returns {Array} Array of candidate names or empty array
 */
export const loadCandidates = () => {
  return getFromStorage(STORAGE_KEYS.CANDIDATES) || [];
};

/**
 * Save candidates to localStorage
 * @param {Array} candidates - Array of candidate names
 * @returns {boolean} Success status
 */
export const saveCandidates = (candidates) => {
  return setToStorage(STORAGE_KEYS.CANDIDATES, candidates);
};

/**
 * Export storage keys for direct use if needed
 */
export { STORAGE_KEYS };
