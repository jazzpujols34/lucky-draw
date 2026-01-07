import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Normalize candidate names (trim, remove empty)
 */
const normalizeCandidates = (candidates) => {
  return candidates
    .map(name => (typeof name === 'string' ? name : String(name)).trim())
    .filter(name => name.length > 0)
    .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
};

/**
 * Parse CSV content
 */
export const parseCSV = (content) => {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const candidates = results.data
          .map(row => {
            if (Array.isArray(row)) {
              return row[0]; // Get first column
            }
            return row;
          })
          .filter(item => item);

        resolve(normalizeCandidates(candidates));
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

/**
 * Parse Excel file
 */
export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const candidates = data
          .map(row => {
            if (Array.isArray(row)) {
              return row[0]; // Get first column
            }
            return row;
          })
          .filter(item => item);

        resolve(normalizeCandidates(candidates));
      } catch (error) {
        reject(new Error(`Excel parsing error: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse file based on extension
 */
export const parseFile = (file) => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        parseCSV(event.target.result)
          .then(resolve)
          .catch(reject);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read CSV file'));
      };
      reader.readAsText(file);
    });
  }

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file);
  }

  return Promise.reject(new Error('Unsupported file format. Please use CSV or Excel (.xlsx)'));
};

/**
 * Parse manual text input (comma or newline separated)
 */
export const parseManualInput = (text) => {
  if (!text || !text.trim()) {
    return [];
  }

  let candidates;

  // Try to detect if comma-separated or newline-separated
  if (text.includes(',') && !text.includes('\n')) {
    candidates = text.split(',');
  } else {
    candidates = text.split('\n');
  }

  return normalizeCandidates(candidates);
};
