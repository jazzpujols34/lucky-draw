import { useState } from 'react';
import { parseFile } from '../../utils/fileParser';
import { Upload } from 'lucide-react';

export default function FileUpload({ onCandidatesLoaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    try {
      setError('');
      setLoading(true);

      const candidates = await parseFile(file);

      if (candidates.length === 0) {
        setError('No valid candidates found in the file.');
        return;
      }

      onCandidatesLoaded(candidates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-2xl font-bold text-blue-400">File Upload</h3>

      <label
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-emerald-400 bg-emerald-400/10'
            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
          }
        `}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          disabled={loading}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />

        <p className="text-lg font-semibold mb-2">
          {loading ? 'Loading...' : 'Drag & drop your file'}
        </p>
        <p className="text-sm text-gray-400">
          or click to select CSV / Excel file
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Supported: .csv, .xlsx, .xls
        </p>
      </label>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
