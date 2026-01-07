/**
 * Convert winners to CSV string
 */
export const winnersToCSV = (winners, prizeLabel = 'Prize') => {
  const header = ['Name', 'Prize', 'Timestamp'];
  const timestamp = new Date().toLocaleString();

  const rows = winners.map(winner => [winner, prizeLabel, timestamp]);

  const csvContent = [
    header.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

/**
 * Convert full history to CSV string
 */
export const historyToCSV = (history) => {
  const header = ['Draw #', 'Prize', 'Winners', 'Timestamp', 'Count'];

  const rows = history.map((draw, index) => [
    index + 1,
    draw.prizeLabel || 'N/A',
    draw.winners.join('; '),
    new Date(draw.timestamp).toLocaleString(),
    draw.winners.length,
  ]);

  const csvContent = [
    header.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

/**
 * Convert winners to text format
 */
export const winnersToText = (winners, prizeLabel = 'Prize') => {
  const text = [
    `Prize: ${prizeLabel}`,
    `Time: ${new Date().toLocaleString()}`,
    `Winners (${winners.length}):`,
    ...winners.map((w, i) => `${i + 1}. ${w}`),
  ].join('\n');

  return text;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Download file
 */
export const downloadFile = (content, fileName, mimeType = 'text/plain') => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', fileName);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Download winners as CSV
 */
export const downloadWinnersCSV = (winners, prizeLabel = 'Prize') => {
  const csv = winnersToCSV(winners, prizeLabel);
  const fileName = `winners-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, fileName, 'text/csv');
};

/**
 * Download full history as CSV
 */
export const downloadHistoryCSV = (history) => {
  const csv = historyToCSV(history);
  const fileName = `lucky-draw-history-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, fileName, 'text/csv');
};
